var PORT = 8000;
var socketIO = require('socket.io');
var server = socketIO.listen(PORT);
var SERVER_CONNECTED = 'connect';

server.sockets.on(SERVER_CONNECTED,function(){
  console.log('connected');
});