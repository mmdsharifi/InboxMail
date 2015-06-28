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




/**
 * Socket Events
 */
 
// If Login unsuccessful
socket.on('error login',function () {
	chatNameSection.find('.form-group').addClass('has-error has-nickname-taken');
});



// Welcoming Loged In user
socket.on('welcome', function(nickname, nicknames) {

	// Show Chat Area
	chatNameSection.remove();
	chatBoxSection.show(500);
	chatInputSection.show(500);

	$("#username").html('<h2>Hello, <span>' + nickname + '!</span></h2>');

	// Update users list
	updateUsers(nicknames);
});


// Display incoming messages on screen
socket.on('incoming', function(data, self) {

	var nickname = self ? 'You' : data.nickname;
	var self = self ? 'self' : '';
	var receivedMessage = '<p class="entry ' + self + '"><b class="text-primary">' + nickname + ' said: </b><span class="text-black" >' + data.message + '</span></p>';

	// Append to chat box and scroll to latest message
	appendAndScroll(receivedMessage);
});



/**
 * UI Events
 */

// Submit handler for Login
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
var validUser = true;
	validUser =	socket.on('invalid user',function () {
			chatInputForm.find(".form-group").addClass('has-error invalid-user');
			return false;
		});
// Submit handler for message entry box
chatInputForm.on('submit', function(e){
	e.preventDefault();
	validateAndSend(validUser);		
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
function validateAndSend (IsvalidUser) {
	var chatMessage = $.trim(messageTextBox.val());
	var senderUser = chatNameSection.find('#name').val();
	var Reciver = $("#To").val();
	

	//show error for sending message to invalid user 
	
	//alert(chatMessage +' rec: '+ Reciver +' sndr:'+ senderUser);
	alert(IsvalidUser);
	if(chatMessage != '' && IsvalidUser) {
		socket.emit('outgoing', { message: sanitize(chatMessage) ,
								  reciver: Reciver,
								  sender : senderUser
		});
		alert('Server : Your message sended successfuly! ;)');
		// Clear chat text box after message success
		messageTextBox.val('');
	}else{
		alert('invalid user: FAIL to send Message :(');
		messageTextBox.val('');
		$('#To').val('');
	}
};

// Populate/Update users list
function updateUsers (nicknames) {
	
	// bind users in Database to dropdown list
	var users ;
	for(var i=0; i< nicknames.length-1; i++) {
		if (i%2 == 0 && nicknames[i].length !==0 ) {
			users+= '<li><a href="#">' + nicknames[i] + '</a></li>';
		}		
	}
	//<li><a href="#">Action</a></li>
	// Update users box
	$('#To').html(users);
}


})(jQuery);