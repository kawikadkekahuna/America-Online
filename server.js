var PORT = 8000;
var socketIO = require('socket.io');
var SOCKET_CONNECTION = 'connection';
var SOCKET_DISCONNECT = 'disconnect';
var SOCKET_SEND_CHUNK = 'send chunk';
var SOCKET_SUBMIT_ALIAS = 'submit alias';
var SOCKET_UPDATE_ALIAS_LIST = 'update alias list';
var SYSTEM_LOG = '#system_log';


var aliasContainer = {};

var server = socketIO.listen(PORT);

server.sockets.on(SOCKET_CONNECTION, function(socket) {

  socket.on(SOCKET_SEND_CHUNK, function(chunk) {
    socket.broadcast.emit(SOCKET_SEND_CHUNK, socket.alias, chunk);
  });

  socket.on(SOCKET_SUBMIT_ALIAS, function(alias, callback) {
    if (!aliasContainer.hasOwnProperty(alias)) {
      aliasContainer[alias] = alias;
      socket.alias = alias;
      socket.broadcast.emit(SOCKET_SEND_CHUNK, socket.alias, ' has joined the chatroom.', SYSTEM_LOG);
      socket.emit(SOCKET_UPDATE_ALIAS_LIST,aliasContainer);
      socket.broadcast.emit(SOCKET_UPDATE_ALIAS_LIST, aliasContainer);
      callback(true);
    } else {
      callback(false);
    }
  });

  socket.on(SOCKET_DISCONNECT, function() {
    delete(aliasContainer[socket.alias]);
    socket.broadcast.emit(SOCKET_SEND_CHUNK, socket.alias, ' has left the chatroom.', SYSTEM_LOG);
    socket.broadcast.emit(SOCKET_UPDATE_ALIAS_LIST, aliasContainer);

  })

});