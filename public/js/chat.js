(function($){


// window.location.origin polyfill support for IE
if (!window.location.origin) {window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');}

var socket = io.connect(window.location.origin);

var chatNameSection = $('.chat-name-section'),
	chatBoxSection = $('.chat-box-section'),
	chatInputSection = $('.chat-input-section'),
	chatSound = new Howl({
		urls: ['/other/notify.ogg','/other/notify.mp3','/other/notify.wav']
	});
var chatNameForm = $('#chatNameForm'),//login Form	
	chatInputForm = $('#chatInputForm');//send message Form

var Inbox = $('#messages'),// All messages in usre's file
	messageTextBox = $('#messageTextBox');// a textbox for write user's message

var modalPopupBtn = $('#usersOnlineBtn'),
	usersOnlineCounter = modalPopupBtn.find('.badge');



/**
 * Socket Events
 */
// If Login unsuccessful

socket.on('error login',function () {
	chatNameSection.find('.form-group').addClass('has-error has-nickname-taken');
});

// If name already exists
/*socket.on('nickname taken', function() {
	chatNameSection.find('.form-group').addClass('has-error has-nickname-taken');
});
*/
// Welcoming signed in user
socket.on('welcome', function(nickname, nicknames) {

	// Show Chat Area
	chatNameSection.remove();
	chatBoxSection.show(500);
	chatInputSection.show(500);

	chatBoxSection.$("#username").html('Hello, <span class="text-success">' + nickname + '</span>');

	// Update users list
	updateUsers(nicknames);
});

// Broadcast to rest of chat that user has joined
socket.on('user joined', function(nickname, nicknames) {
	var userJoinedMessage = '<p class="text-primary"><em><u>' + nickname + '</u> has joined the chat.</em></p>';

	// Append to chat box and scroll to latest message
	appendAndScroll(userJoinedMessage);

	// Update users list
	updateUsers(nicknames);
});

// Broadcast to rest of chat that user has left
socket.on('user left', function(nickname, nicknames) {
	var userLeftMessage = '<p class="text-warning"><em>' + nickname + ' has left the chat.</em></p>';

	// Append to chat box and scroll to latest message
	appendAndScroll(userLeftMessage);

	// Update users list
	updateUsers(nicknames);
});

// Display incoming messages on screen
socket.on('incoming', function(data, self) {

	var nickname = self ? 'You' : data.nickname;
	var self = self ? 'self' : '';
	var receivedMessage = '<p class="entry ' + self + '"><b class="text-primary">' + nickname + ' said: </b>' + data.message + '</p>';

	// Append to chat box and scroll to latest message
	appendAndScroll(receivedMessage);
});



/**
 * UI Events
 */

// Submit handler for name entry box
chatNameForm.on('submit', function(e){

	e.preventDefault();

	var chatName = $.trim( chatNameSection.find('#name').val() );
    var chatPass = $.trim( chatNameSection.find('#pass').val() );
	
	if(chatName != '' && chatPass != '') {
        // Emit valid entry to server
        // for validation against nicknames array
		socket.emit('new user', { nickname: sanitize(chatName),
								  password: sanitize(chatPass)
		 });
	} else {
		chatNameSection.find('.form-group').addClass('has-error');
	}
});

// Submit handler for message entry box
chatInputForm.on('submit', function(e){
	e.preventDefault();
	var ToReciver = $("To").find(':selected').text();
	alert(ToReciver);
	validateAndSend(ToReciver);		
});

// Trigger submit handler for message box programatically
// when 'Enter' key is pressed. Does not match when
// the Shift, Ctrl or Alt key are also pressed during that process
messageTextBox.on('keypress', function(e) {
	if (e.which === 13 && e.shiftKey === false &&
		e.altKey === false && e.ctrlKey === false &&

        // Ensuring its not a touch device as
        // you wouldn't want this event attached in that scenario
        ('ontouchstart' in window === false || 'msMaxTouchPoints' in window.navigator === false)) {

		// submit form
		chatInputForm.submit();
		return false; // prevent cursor from shifting to next line
	}
});

// Remove error when input is being typed in
chatNameSection.find('#name').on('keypress', function(e) {
	chatNameSection.find('.has-error').removeClass('has-error').removeClass('has-nickname-taken');
});


/**
 * Helper functions
 */

// Convert html tags into literal strings
function sanitize (input) {
	return input.replace(/>/g, '&gt;').replace(/</g,'&lt;').replace('\n','<br/>');
}

// Appends messages to chat box and scroll down
// to latest notification
function appendAndScroll (html) {
	Inbox.append(html);
	Inbox.scrollTop(Inbox[0].scrollHeight);

	// Plays sound if its not already playing
	chatSound.play();
}

// Validate and send messages
function validateAndSend (Reciver) {
	var chatMessage = $.trim(messageTextBox.val());
	
	alert(chatMessage + Reciver);
	
	if(chatMessage != '') {
		socket.emit('outgoing', { message: sanitize(chatMessage) ,
								  reciver: Reciver});

		// Clear chat text box after message success
		messageTextBox.val('');
	}
};

// Populate/Update users list
function updateUsers (nicknames) {
	
	// bind users in Database to dropdown list
	var users ;
	for(var i=0; i< nicknames.length-1; i++) {
		if (i%2 == 0 && nicknames[i].length !=0 ) {
			users+= '<option>' + nicknames[i] + '</option>';
		}		
	}
	
	// Update users box
	$('#To').html(users);
}


})(jQuery);