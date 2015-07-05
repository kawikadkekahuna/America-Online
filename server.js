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

var aliasContainer = {};
var socketContainer = {};

var server = socketIO.listen(PORT);

server.sockets.on(SOCKET_CONNECTION, function(socket) {
  socketContainer[socket] = socket;
  socket.on(SOCKET_SEND_CHUNK, function(chunk) {
    socket.broadcast.emit(SOCKET_SEND_CHUNK, socket.alias, chunk);

  });

  socket.on(SOCKET_SUBMIT_ALIAS, function(alias, callback) {
    if (!aliasContainer.hasOwnProperty(alias)) {
      aliasContainer[alias] = alias;
      socket.alias = alias;
      socket.broadcast.emit(SOCKET_SEND_CHUNK, socket.alias, ' has joined the chatroom.', SYSTEM_LOG);
      socket.emit(SOCKET_UPDATE_ALIAS_LIST, aliasContainer);
      socket.broadcast.emit(SOCKET_UPDATE_ALIAS_LIST, aliasContainer);
      callback(true);
    } else {
      callback(false);
    }
  });

  socket.on(SOCKET_DISCONNECT, function() {
    if (socket.alias) {
      delete(aliasContainer[socket.alias]);
      socket.broadcast.emit(SOCKET_SEND_CHUNK, socket.alias, ' has left the chatroom.', SYSTEM_LOG);
      socket.broadcast.emit(SOCKET_UPDATE_ALIAS_LIST, aliasContainer);
    }
  });

});
process.stdin.on(SERVER_DATA, function(chunk) {

  chunk = chunk.toString().split('\n')[0];
  if (chunk.charAt(0) === SERVER_POWER) {
    var command = chunk.substring(0, chunk.indexOf(' '));
    var destinationData = chunk.substring(chunk.indexOf(' ') + 1, chunk.length);
    switch (command) {

      case SERVER_KICK:
        for (var key in socketContainer) {
          if (socketContainer[key].alias === destinationData) {
            console.log('kick');
            // delete(socketContainer[key]);
            socketContainer[key].disconnect();
            // console.log('socketContainer', socketContainer);
          }
        }
        delete(aliasContainer[destinationData]);
        break;

    }



  }


});