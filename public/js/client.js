(function() {
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
  var SOCKET_ALIAS;
  //////////////////////////////////////////
  var SOCKET_SEND_CHUNK = 'send chunk';
  var SOCKET_SUBMIT_ALIAS = 'submit alias';
  var SOCKET_UPDATE_ALIAS_LIST = 'update alias list';
  //////////////////////////////////////////
  var SYSTEM_LOG = '#system_log';
  var CHATROOM_LOG = '#chatlog';
  var STATE;
  var CHATROOM_STATE = 'chatroom state';
  var REGISTRATION_STATE = 'registartion state';
  var SERVER_KICKED = 'server kicked';

  var socket = io.connect(SERVER_ADDRESS);
  // swapState(REGISTRATION_STATE);

  socket.on(SOCKET_CONNECT, function() {
    swapState(REGISTRATION_STATE);
    sendChunk(SYSTEM, 'Connected to ' + SERVER_ADDRESS, SYSTEM_LOG);
  });
  socket.on(SOCKET_DISCONNECT, function() {
    swapState(REGISTRATION_STATE);
    sendChunk(SYSTEM, 'Disconnected from ' + SERVER_ADDRESS, SYSTEM_LOG);
  });
  socket.on(SOCKET_RECONNECT, function() {
    swapState(REGISTRATION_STATE);
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

  socket.on(SOCKET_SEND_CHUNK, function(source, chunk, destination) {

    // console.log(chunk);
    if (chunk.indexOf('@' + SOCKET_ALIAS) !== -1) {


    }
    sendChunk(source, chunk, destination);

  });

  socket.on(SOCKET_UPDATE_ALIAS_LIST, function(incomingList) {
    updateAliasList(incomingList);
  });

  socket.on(SERVER_KICKED, function(info) {
      if(info.target === SOCKET_ALIAS){
        socket.disconnect();
      }           
  });



  function sendChunk(source, chunk, destination) {
    destination = destination || CHATROOM_LOG;

    var newChunk = $('<p>');

    var source = $('<b>', {
      text: source
    });

    if (chunk.indexOf('@' + SOCKET_ALIAS) !== -1) {
      var tmp = '@' + SOCKET_ALIAS;
      var index = chunk.indexOf(tmp);
      var front = chunk.substring(0, index);
      console.log('SOCKET_ALIAS.length', SOCKET_ALIAS.length);
      console.log('front', front);
      var back = chunk.substring(index + SOCKET_ALIAS.length + 1, chunk.length);
      console.log('back', back);

      var chunk = $('<span>', {
        html: front + '<span class="mentioned">@' + SOCKET_ALIAS + '</span>' + back

      });

    } else {
      var chunk = $('<span>', {
        text: chunk
      });
    }


    newChunk.append(source);
    newChunk.append(chunk);
    $(destination).append(newChunk).get(0).scrollTop = 1000000;

  }

  function mentioned(chunk) {
    '<span class="mentioned">';
  }

  function updateAliasList(aliasList) {
    console.log(aliasList);
    $('#online_users').empty();
    for (var k in aliasList) {
      var alias = $('<span> ', {
        text: aliasList[k]
      });

      $('#online_users').append(alias);
    }
  }


  $('#user_registration').submit(function(event) {
    event.preventDefault();
    var alias = $('#alias').val();
    socket.emit(SOCKET_SUBMIT_ALIAS, alias, function(available) {
      if (available) {
        swapState(CHATROOM_STATE);
        SOCKET_ALIAS = alias;
      } else {
        $('.error').html('Alias taken!  Please enter another name.');
      }
    });

  });


  $('#chatroom_form').submit(function(event) {
    event.preventDefault();
    var message = $('#chatroom_message').val();
    sendChunk('me', message);
    socket.emit(SOCKET_SEND_CHUNK, message);
    $('#chatroom_message').val('');
  });



  ///Functions
  function swapState(state) {
    switch (state) {
      case REGISTRATION_STATE:
        $('#chatroom_state').hide();
        $('#registration_state').show();
        break;
      case CHATROOM_STATE:
        $('#chatroom_state').show();
        $('#registration_state').hide();
        break;

    }
  }

})();