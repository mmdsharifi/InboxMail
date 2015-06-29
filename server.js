
/**
 * Module dependencies.
 */
// Create a Server and set a port
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
user.pop();//remove last elemet;beacause it's empty
nicknames = user;
console.log(nicknames);

io.sockets.on('connection', function (socket) {

    // When user enters name from the client
	socket.on('‫‪HelloFrom‬‬', function (data) {

		//var login to endshoure
		var login = false;
		nicknames.forEach(function (name, index) {

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
				
				// Server Say Hello to user
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
				socket.emit('UserNotHere');//say to clien this user not here!
				console.log('UserNotHere');
			}else{
			socket.emit('OK');	// Server Say OK
			console.log('OK');
			//sending message...
			var messages = 'From '+ nickname + '\n'+message+'\n--------\n';
			fs.appendFile('DB/'+reciver+'.txt', messages, function (err) {
						  if (err) throw err;
						  console.log('Your message is\n'+message + 'Sended');
						  socket.emit('‫‪MsgRcvd‬‬');
						});
				}	
	});
	
	// Get all messages in user's inbox	
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