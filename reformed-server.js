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
//LOGS
var SYSTEM_LOG = '#system_log';


var banList = {};
var connectedSocketIPList = {};
var socketAliasList = {};


var server = socketIO.listen(PORT);

server.sockets.on(SOCKET_CONNECTION, function(socket) {


  socket.on(SOCKET_CREATE_ALIAS, function(alias, callback) {
    if (!socketAliasList.hasOwnProperty(alias)) {
      socketAliasList[alias] = alias;
      socket.alias = alias;
      connectedSocketIPList[alias] = socket.handshake.address
      socket.broadcast.emit(SOCKET_SEND_CHUNK, socket.alias, ' has joined the chatroom.', SYSTEM_LOG);
      socket.broadcast.emit(SOCKET_UPDATE_ALIAS_LIST, socketAliasList);
      console.log(alias, ' has connected');
      callback(true);
    } else {
      callback(false);
    }

  });

  socket.on(SOCKET_SEND_CHUNK, function(chunk, log) {
    socket.broadcast.emit(SOCKET_SEND_CHUNK, socket.alias, chunk, log);
  });

  socket.on(SERVER_KICKED_EVENT, function(info) {
    socket.emit(SERVER_KICKED_EVENT, info);
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

      case SERVER_KICK:

        var socket = socketContainer.filter(function(currentSocket) {
          if (currentSocket.alias === target) {
            server.sockets.emit(SERVER_KICKED, target,message);
          }
        });
        break;

      case SERVER_BAN:

        var socket = socketContainer.filter(function(currentSocket) {
          if (currentSocket.alias === target) {
            var socketInfo = {
              ip: currentSocket.handshake.address,
              alias: currentSocket.alias
            }
            server.sockets.emit(SERVER_BAN_EVENT, socketInfo);
          }
        });

        break;

    }



  }


});