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

var aliasList = {};
var socketContainer = [];

var server = socketIO.listen(PORT);

server.sockets.on(SOCKET_CONNECTION, function(socket) {
  socketContainer.push(socket);

  socket.on(SOCKET_SEND_CHUNK, function(chunk) {
    socket.broadcast.emit(SOCKET_SEND_CHUNK, socket.alias, chunk);

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
    delete(aliasList[socket.alias]);
    console.log(aliasList);
    socket.broadcast.emit(SOCKET_UPDATE_ALIAS_LIST,aliasList);
    socket.broadcast.emit(SOCKET_SEND_CHUNK, socket.alias, ' has left the chatroom.', SYSTEM_LOG);
  });

});
process.stdin.on(SERVER_DATA, function(chunk) {

  chunk = chunk.toString().split('\n')[0];
  if (chunk.charAt(0) === SERVER_POWER) {
    var command = chunk.substring(0, chunk.indexOf(' '));
    var destinationData = chunk.substring(chunk.indexOf(' ') + 1, chunk.length);
    switch (command) {

      case SERVER_KICK:

        var socket = socketContainer.filter(function(currentSocket) {
          if (currentSocket.alias === destinationData) {
            currentSocket.disconnect();
            // console.log(currentSocket.alias,'has disconnected');
          }
        });

        break;


    }



  }


});