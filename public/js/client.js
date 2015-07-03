$(function() {
  var SERVER_ADDRESS = 'http://localhost:8000';
  var SYSTEM = "[SYSTEM]";
  //EVENTS
  var SOCKET_CONNECT = 'connect';
  var SOCKET_DISCONNECT = 'disconnect';
  var SOCKET_RECONNECT = 'reconnect';
  var SOCKET_RECONNECTING_ATTEMPT = 'reconnect_attempt';
  var SOCKET_RECONNECTING = 'reconnecting';
  var SOCKET_RECONNECT_ERROR = 'reconnect_error';
  var SOCKET_RECONNECT_FAILED = 'reconnect_failed';
  var SOCKET_ERROR = 'error';
  //////////////////////////////////////////
  var SOCKET_SEND_CHUNK = 'send chunk';
  var SOCKET_SUBMIT_ALIAS = 'submit alias';
  //////////////////////////////////////////
  var SYSTEM_LOG = '#system_log';
  var CHATROOM_LOG = '#chatlog';

  var socket = io.connect(SERVER_ADDRESS);
  $('#chatroom_state').hide();


  socket.on(SOCKET_CONNECT, function() {
    sendChunk(SYSTEM, 'Connected to ' + SERVER_ADDRESS, SYSTEM_LOG);
  });
  socket.on(SOCKET_DISCONNECT, function() {

    sendChunk(SYSTEM, 'Disconneceted from ' + SERVER_ADDRESS, SYSTEM_LOG);
  });
  socket.on(SOCKET_RECONNECT, function() {

    sendChunk(SYSTEM, 'Sucessfully reconnected to ' + SERVER_ADDRESS, SYSTEM_LOG);

  });
  socket.on(SOCKET_RECONNECTING_ATTEMPT, function() {
    sendChunk(SYSTEM, 'Attempting to reconnect to ' + SERVER_ADDRESS, SYSTEM_LOG);

  });
  socket.on(SOCKET_RECONNECT_FAILED, function() {
    sendChunk(SYSTEM, 'Failed to connect to ' + SERVER_ADDRESS, SYSTEM_LOG);

  });

  socket.on(SOCKET_ERROR, function() {
    if (err !== undefined) {
      message(SYSTEM, err);
    } else {
      message(SYSTEM, 'An unknown error occured');
    }
  });

  socket.on(SOCKET_SEND_CHUNK, function(source, chunk,destination) {
    sendChunk(source, chunk,destination);
  });

  function sendChunk(source, chunk, destination) {
    destination = destination || CHATROOM_LOG;
    var newChunk = $('<p>');
    var source = $('<b>', {
      text: source
    });
    var chunk = $('<span>', {
      text: chunk
    });

    newChunk.append(source);
    newChunk.append(chunk);
    $(destination).append(newChunk).get(0).scrollTop = 1000000;

  }

  $('#user_registration').submit(function(event) {
    event.preventDefault();
    var alias = $('#alias').val();
    socket.emit(SOCKET_SUBMIT_ALIAS, alias, function(available) {
      if(available){
        swapState();
      }else{
        $('.error').html('Alias taken!  Please enter another name.');
      }
    });

  });

  $('#chatroom_form').submit(function(event){
    event.preventDefault();
    var message = $('#chatroom_message').val();
    sendChunk('me',message);
    socket.emit(SOCKET_SEND_CHUNK,message);
    $('#chatroom_message').val('');
  });



///Functions
  function swapState(){
    $('#chatroom_state').show();
    $('#registration_state').hide();
  }

})();