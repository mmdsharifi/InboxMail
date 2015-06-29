
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
user.pop();//remove last
nicknames = user;
console.log(nicknames);

io.sockets.on('connection', function (socket) {

    // When user enters name from the client
	socket.on('new user', function (data) {

		//var login;
		var login = false;
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
			socket.emit('SenderNotFound');
		} else {
			socket.set("login", data.name, function () {
				// Update 'nicknames' array
				nicknames.push(data.nickname);
				
				// Welcome the user who joined
				socket.emit('Hello', data.nickname, nicknames);
			});
		}

	});

    // Listening for chat messages being sent
	socket.on('Msg4', function (data) {

				var nickname =  data.sender;
				var message  = data.message;
				var reciver = data.reciver;
			
			var ExistUser = nicknames.filter(function (username) {
				return   reciver === username;
			});
			if (ExistUser.toString().length === 0) {
				socket.emit('UserNotHere');
				console.log('--'+'invalid user');
			}else{
				
			//sending message...
			var messages = 'From '+ nickname + '\n'+message+'\n--------\n';
			fs.appendFile('DB/'+reciver+'.txt', messages, function (err) {
						  if (err) throw err;
						  console.log('Your message is\n'+message + 'Sended');
						  socket.emit('‫‪MsgRcvd‬‬');
						});
				}	
	});
	
	socket.on('GiveMyMsg',function (data) {
		var user = data.me;
		//var users = fs.readFileSync('DB/'+ user +'.txt').toString();
		 fs.readFile('DB/'+ user +'.txt', function (err, msg) {
					  if (err) throw err;
 					  console.log(msg.toString());
					  socket.emit('allmsg',msg.toString());
			});
		
	});
});


server.listen(port, function () { console.log("Server listening at http://localhost:" + port) });

// ExpressJS routes using the 'get' verb
app.get('/', handler);