var PORT = 8000;
var socketIO = require('socket.io');
var SOCKET_CONNECTION = 'connection';
var SOCKET_DISCONNECT = 'disconnect';
var SOCKET_SEND_CHUNK = 'send chunk';
var SOCKET_SUBMIT_ALIAS = 'submit alias';
var SERVER_SEND_CHUNK = 'server';
var SOCKET_UPDATE_ALIAS_LIST = 'update alias list';
var SYSTEM_LOG = '#system_log';
var SERVER_DATA = 'data';
var SERVER_POWER = '/';
var SERVER_KICK = '/kick';
var SERVER_KICKED = 'server kicked';
var SERVER_BAN = '/ban';

var banList = {};
var aliasList = {};
var socketContainer = [];

var server = socketIO.listen(PORT);

server.sockets.on(SOCKET_CONNECTION, function(socket) {
  socketContainer.push(socket);

  socket.on(SOCKET_SEND_CHUNK, function(chunk, log) {
    socket.broadcast.emit(SOCKET_SEND_CHUNK, socket.alias, chunk, log);

  });

  socket.on(SERVER_KICKED, function(info) {
    socket.emit(SERVER_KICKED, info);
  });

  socket.on(SOCKET_SUBMIT_ALIAS, function(alias, callback) {
    if (!aliasList.hasOwnProperty(alias)) {
      aliasList[alias] = alias;
      socket.alias = alias;
      socket.broadcast.emit(SOCKET_SEND_CHUNK, socket.alias, ' has joined the chatroom.', SYSTEM_LOG);
      socket.emit(SOCKET_UPDATE_ALIAS_LIST, aliasList);
      socket.broadcast.emit(SOCKET_UPDATE_ALIAS_LIST, aliasList);
      console.log(socket.alias, 'has conencted');
      callback(true);
    } else {
      callback(false);
    }
  });

  socket.on(SOCKET_DISCONNECT, function() {
    if (socket.alias) {
      delete(aliasList[socket.alias]);
      socket.broadcast.emit(SOCKET_UPDATE_ALIAS_LIST, aliasList);
      socket.broadcast.emit(SOCKET_SEND_CHUNK, socket.alias, ' has left the chatroom.', SYSTEM_LOG);
    }
  });

});
process.stdin.on(SERVER_DATA, function(chunk) {

  chunk = chunk.toString().split('\n')[0];
  if (chunk.charAt(0) === SERVER_POWER) {
    var command = chunk.split(' ');
    var target = command[1];
    var message = chunk.replace(target, '');
    message = message.replace(command[0], '');
    var testObj = {
      target: target,
      message: message
    }
    command = command[0]
    switch (command) {

      case SERVER_KICK:

        var socket = socketContainer.filter(function(currentSocket) {
          if (currentSocket.alias === target) {
            server.sockets.emit(SERVER_KICKED, testObj);
          }
        });
        break;

      case SERVER_BAN:

        console.log(aliasList);
        break;

    }
  }
});