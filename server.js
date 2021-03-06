var PORT = 8000;
var socketIO = require('socket.io');
var SOCKET_CONNECTION = 'connection';
var SOCKET_DISCONNECT = 'disconnect';
var SOCKET_SEND_CHUNK = 'send chunk';
var SOCKET_CREATE_ALIAS = 'submit alias';
var SOCKET_UPDATE_ALIAS_LIST = 'update alias list';
var SERVER_DATA = 'data';
var SERVER_POWER = '/';
var SERVER_SEND_CHUNK = 'server';
var SERVER_KICKED_EVENT = 'server kicked';
var SERVER_BAN_EVENT = 'server ban';
var SERVER_BAN_COMMAND = '/ban';
var SERVER_KICK_COMMAND = '/kick';
var SERVER_SWAP_STATE = 'server swap state';

//LOGS
var SYSTEM_LOG = '#system_log';


var banList = {};
var connectedSocketIPList = {};
var socketAliasList = {};
var socketContainerArr = [];


var server = socketIO.listen(PORT);

server.sockets.on(SOCKET_CONNECTION, function(socket) {
  socketContainerArr.push(socket);
  socket.on(SOCKET_CREATE_ALIAS, function(alias, callback) {
    var res = {};

    if (!socketAliasList.hasOwnProperty(alias) && !banList.hasOwnProperty(alias)) {
      socket.alias = alias;
      socketAliasList[alias] = alias;
      connectedSocketIPList[alias] = socket.handshake.address;
      socket.broadcast.emit(SOCKET_SEND_CHUNK, socket.alias, ' has joined the chatroom.', SYSTEM_LOG);
      socket.broadcast.emit(SOCKET_UPDATE_ALIAS_LIST, socketAliasList);
      socket.emit(SOCKET_UPDATE_ALIAS_LIST, socketAliasList);
      res = {
        created: true,
        banned: false
      }
      callback(res);

    }
    if (banList.hasOwnProperty(alias)) {
      res = {
        created: false,
        banned: true
      }
      callback(res);
    }
    if (!banList.hasOwnProperty(alias) && socketAliasList.hasOwnProperty(alias)) {
      res = {
        created: false,
        banned: false
      }
      callback(res);
    }


  });

  socket.on(SOCKET_SEND_CHUNK, function(chunk, log) {
    socket.broadcast.emit(SOCKET_SEND_CHUNK, socket.alias, chunk, log);
  });

  socket.on(SERVER_KICKED_EVENT, function(target, message) {
    socket.emit(SERVER_KICKED_EVENT, target, message);
  });

  socket.on(SOCKET_DISCONNECT, function() {

    if (socket.alias) {
      delete(socketAliasList[socket.alias]);
      delete(connectedSocketIPList[socket.alias]);
      socket.broadcast.emit(SOCKET_UPDATE_ALIAS_LIST, socketAliasList);
      socket.broadcast.emit(SOCKET_SEND_CHUNK, socket.alias, ' has left the chatroom', SYSTEM_LOG);
    }
  });

  //Ends socket.socket.on
});

process.stdin.on(SERVER_DATA, function(chunk) {
  chunk = chunk.toString().split('\n')[0];

  if (chunk.charAt(0) === SERVER_POWER) {
    var command = chunk.split(' ');
    var target = command[1];
    var message = chunk.replace(target, '');
    message = message.replace(command[0], '');

    command = command[0];

    switch (command) {

      case SERVER_KICK_COMMAND:

        var socket = socketContainerArr.filter(function(currentSocket) {
          if (currentSocket.alias === target) {
            server.sockets.emit(SERVER_KICKED_EVENT, target, message);
          }
        });
        break;

      case SERVER_BAN_COMMAND:

        var socket = socketContainerArr.filter(function(currentSocket) {
          if (currentSocket.alias === target) {
            var ip = currentSocket.handshake.address
            banList[currentSocket.alias] = ip;
            server.sockets.emit(SERVER_BAN_EVENT, target, message, ip);
            process.stdout.write(currentSocket.alias + currentSocket.handshake.address + ' has been banned');
          }
        });

        break;

    }



  }


});