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
  var CHATROOM_STATE_EL = $('#chatroom_state');
  var REGISTRATION_STATE_EL = $('#registration_state')
  var KICKED_STATE_EL = $('#kicked_state');
  //////////////////////////////////////////
  var CHATROOM_STATE = 'chatroom state';
  var REGISTRATION_STATE = 'registartion state';
  var KICKED_STATE = 'kicked state';
  var SERVER_KICKED = 'server kicked';
  var SOCKET_MSG_CAP = 5;
  var SOCKET_MSG_COUNT = 0;
  var ONE_SECOND = 1000;
  var SOCKET_INTERVAL_RUNNING = false;

  var socket = io.connect(SERVER_ADDRESS);
  // swapState(REGISTRATION_STATE);

  socket.on(SOCKET_CONNECT, function() {
    swapState(REGISTRATION_STATE);
    sendChunk(SYSTEM, 'Connected to ' + SERVER_ADDRESS, SYSTEM_LOG);
  });

  socket.on(SOCKET_DISCONNECT, function() {
    sendChunk(SYSTEM, 'Disconnected from ' + SERVER_ADDRESS, SYSTEM_LOG);
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
    };
  });

  socket.on(SOCKET_SEND_CHUNK, function(source, chunk, destination) {
    sendChunk(source, chunk, destination);
  });

  socket.on(SOCKET_UPDATE_ALIAS_LIST, function(incomingList) {
    updateAliasList(incomingList);
  });

  socket.on(SERVER_KICKED, function(info) {
    if (info.target === SOCKET_ALIAS) {
      swapState(KICKED_STATE);
      var msg = $('<p>', {
        text: info.message
      });
      KICKED_STATE_EL.append(msg);
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
      console.log('back', back);;

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

  };

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
        $('.error').html('Alias taken!  Please; enter another name.');
      }
    });

  });


  $('#chatroom_form').submit(function(event) {
    event.preventDefault();
    var message = $('#chatroom_message').val();
    SOCKET_MSG_COUNT++;
    if (!SOCKET_INTERVAL_RUNNING) {
      startSocketInterval(socket);
    }
    console.log(SOCKET_MSG_COUNT);;
    console.log('SOCKET_INTERVAL_RUNNING', SOCKET_INTERVAL_RUNNING);
    sendChunk('me', message);
    socket.emit(SOCKET_SEND_CHUNK, message);
    $('#chatroom_message').val('');
  });



  ///Functions
  function startSocketInterval(socket) {
    SOCKET_INTERVAL_RUNNING = true;
    console.log('timeoutID', timeoutID);
    var intervalID = setInterval(function() {
      console.log(SOCKET_MSG_COUNT);
      var infoObj = {
        target: SOCKET_ALIAS,
        message: 'You have exceeded the amount of messages allowed per second'
      }
      if (SOCKET_MSG_COUNT === SOCKET_MSG_CAP) {
        socket.emit(SERVER_KICKED, infoObj);
        clearInterval(intervalID);
        clearInterval(timeoutID);
        SOCKET_MSG_COUNT = 0;
        // swapState(KICKED_STATE);
      }
    }, 50);

    var timeoutID = setTimeout(function() {

      SOCKET_MSG_COUNT = 0;
      SOCKET_INTERVAL_RUNNING = false;
      clearInterval(intervalID);
    }, ONE_SECOND * 2)



  }

  function swapState(state) {
    switch (state) {
      case REGISTRATION_STATE:
        CHATROOM_STATE_EL.hide();
        REGISTRATION_STATE_EL.show();
        KICKED_STATE_EL.hide();
        break;
      case CHATROOM_STATE:
        CHATROOM_STATE_EL.show();
        REGISTRATION_STATE_EL.hide();
        KICKED_STATE_EL.hide();
        break;
      case KICKED_STATE:
        CHATROOM_STATE_EL.hide();
        REGISTRATION_STATE_EL.hide();
        KICKED_STATE_EL.show();


    }
  }

})();