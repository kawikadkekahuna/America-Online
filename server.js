var PORT = 8000;
var socketIO = require('socket.io');
var SOCKET_CONNECTION = 'connection';
var SOCKET_SEND_CHUNK = 'send chunk';
var SOCKET_SUBMIT_ALIAS = 'submit alias';
var SYSTEM_LOG = '#system_log';
var SOCKET_DISCONNECT = 'disconnect';


var aliasHolder = {};

var server = socketIO.listen(PORT);

server.sockets.on(SOCKET_CONNECTION, function(socket) {

  socket.on(SOCKET_SEND_CHUNK, function(chunk) {
    socket.broadcast.emit(SOCKET_SEND_CHUNK, socket.alias, chunk);
  });

  socket.on(SOCKET_SUBMIT_ALIAS, function(alias, callback) {
    console.log(alias);
    console.log(aliasHolder);
    if (!aliasHolder.hasOwnProperty(alias)) {
      callback(true);
      aliasHolder[alias] = alias;
      socket.alias = alias;
      socket.broadcast.emit(SOCKET_SEND_CHUNK,socket.alias, ' has joined the chatroom.',SYSTEM_LOG);
    } else {
      callback(false);
    }
  });

  socket.on(SOCKET_DISCONNECT,function(){
    console.log(aliasHolder[socket.alias], ' will be deleted');
    delete(aliasHolder[socket.alias]);
    console.log(aliasHolder[socket.alias],' after');

  })

});