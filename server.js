var PORT = 8000;
var socketIO = require('socket.io');
var SOCKET_CONNECTION = 'connection';
var SOCKET_DISCONNECT = 'disconnect';
var SOCKET_SEND_CHUNK = 'send chunk';
var SOCKET_SUBMIT_ALIAS = 'submit alias';
var SOCKET_WATCH = 'watch';
var SYSTEM_LOG = '#system_log';


var aliasHolder = {};

var server = socketIO.listen(PORT);

server.sockets.on(SOCKET_CONNECTION, function(socket) {

  socket.on(SOCKET_SEND_CHUNK, function(chunk) {
    socket.broadcast.emit(SOCKET_SEND_CHUNK, socket.alias, chunk);
  });

  socket.on(SOCKET_SUBMIT_ALIAS, function(alias, callback) {
    if (!aliasHolder.hasOwnProperty(alias)) {
      aliasHolder[alias] = alias;
      socket.alias = alias;
      socket.broadcast.emit(SOCKET_WATCH, socket.alias);
      socket.broadcast.emit(SOCKET_SEND_CHUNK, socket.alias, ' has joined the chatroom.', SYSTEM_LOG);
      callback(true);
    } else {
      callback(false);
    }
  });

  socket.on(SOCKET_WATCH,function(){
    socket.broadcast.emit(SOCKET_WATCH,socket.alias);
  });

  socket.on(SOCKET_DISCONNECT, function() {
    delete(aliasHolder[socket.alias]);

  })

});