
/**
 * Module dependencies.
 */

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var handler = require('./handler');
var fs = require('fs');
var port = 1337;

// Sets up express static server directory to the /public folder
app.use(express.static(__dirname + '/public'));

// Holds an array of users connected
var nicknames = [];
 
//Read Users name and password from file
var users = fs.readFileSync('DB/users.txt').toString();
var user = users.split(',');
nicknames = user;


io.sockets.on('connection', function (socket) {

    // When user enters name from the client
	socket.on('new user', function (data) {

		//var nicknameTaken;
		var login;
		nicknames.forEach(function (name, index) {
			console.log(name + nicknames[index + 1] + " " + data.nickname + "  " + data.password);
			if ((name.toLowerCase() === data.nickname.toLowerCase())) {
				if (nicknames[index + 1].toLowerCase() === data.password.toLowerCase()) {
					login = true;
					return;
				}
			}
		});
		if (!login) {
			socket.emit('error login');
		} else {
			socket.set("login", data.name, function () {
				// Update 'nicknames' array
				nicknames.push(data.nickname);
				
				// Welcome the user who joined
				socket.emit('welcome', data.nickname, nicknames);
			});
		}

	});

    // Listening for chat messages being sent
	socket.on('outgoing', function (data) {

				var nickname =  data.sender;
				var message  = data.message;
				var reciver = data.reciver;
			
			var ExistUser = nicknames.filter(function (username) {
				return   reciver === username;
			});
			if (ExistUser.toString().length === 0) {
				socket.emit('invalid user');
				console.log('--'+'invalid user');
			}else{
				socket.set('valid user',function () {
					socket.emit('success');
				});
			
			//sending message...
			var messages = '\nFrom '+ nickname + '\n'+message+'\n--------';
			fs.appendFile('DB/'+reciver+'.txt', messages, function (err) {
						  if (err) throw err;
						  console.log('Your message is\n'+message + 'Sended');
						});
				}
			
	});

    // Listening for when someone leaves - native listener for socket.io
	socket.on('disconnect', function () {

		socket.get('nickname', function (err, nickname) {

			// Remove username from users
			nicknames.splice(nicknames.indexOf(nickname), 1);

            // Don't need to broadcast if there are no users left
			if (nicknames.length === 0) return;

            // Notify existing users that someone left
			socket.broadcast.emit('user left', nickname, nicknames);
		});

		console.log('user disconnected!');
	});
});


server.listen(port, function () { console.log("Server listening at http://localhost:" + port) });

// ExpressJS routes using the 'get' verb
app.get('/', handler);