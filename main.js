var express = require('express');
var app = express();

var fs = require('fs');
var path = require('path');
var http = require('http').Server(app);
var mongoose = require('mongoose');
var io = require('socket.io').listen(http);
var bodyParser = require('body-parser');
var hbs = require('express-handlebars');
var config = require('./config');
var socketService = require('./services/socket');
mongoose.Promise = require('q').Promise;

var join = path.join;
var models = join(__dirname, 'models');

// Bootstrap models
var models = fs.readdirSync(models).forEach(function (file) {
    require(join(models, file));
});

app.use('/assets/', express.static(path.join(__dirname, 'assets/')));
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({extended: true})); // support encoded bodies

// app.engine('hbs', hbs({extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/layouts/'}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

var routes = require('./routes');
app.use('/', routes);

// Socket.IO
io.sockets.on('connection', function (socket) {
    socketService.registerClient(socket.id);
    // socket.join("test");
    // User sends new message
    socket.on('message', function (msg) {
        var Room = mongoose.model('Room');
        var Message = mongoose.model("Message");
        var User = mongoose.model("User");
        var Moment = require('moment');
        
        var message = new Message;
        message.body = msg.message;
        message.sender = msg.sender;
        message.room = msg.room;
        
        // Save the message in the DB
        message.create();
        
        // Get the room where the message was posted to
        Room.get(msg.room).then(function (r) {
            // Private rooms have interlocutor
            if (r.interlocutor) {
                // Find out which user has to be notified
                var userToNotify = r.initiator._id == msg.sender ? r.interlocutor._id : r.initiator._id;
                
                // Get user's socket
                var socketToNotify = socketService.getClientByUserId(userToNotify).socket;
                
                // Find the user in the DB
                User.findById(msg.sender).then(function (u) {
                    msg.sender = u;
                    msg.date = Moment().format('HH:mm:ss');
                    
                    // Send the message to the user
                    socket.broadcast.to(socketToNotify).emit('new-message', msg);
                });
            } else {
                // Public room
                // Find the user in the DB
                User.findById(msg.sender).then(function (u) {
                    msg.sender = u;
                    msg.date = Moment().format('HH:mm:ss');
                    
                    // Send the message to all connected sockets in the room
                    // io.to("test").emit('new-message', msg);
                    socket.broadcast.to(msg.room).emit('new-message', msg);
                });
            }
        });
    });
    
    // New user joins the chat
    socket.on('entered-chat', function (userId) {
        socketService.associateUserWithClient(socket.id, userId);
    });
    
    // User refreshes or closes the browser
    socket.on('disconnect', function () {
        socketService.deRegisterClient(socket.id);
    });
    
    socket.on('room', function (room) {
        socket.join(room);
    });
});

connect()
    .on('error', console.log)
    .on('disconnected', connect)
    .once('open', listen);

function listen() {
    http.listen(3000);
    console.log('Express app started on port 3000');
}

function connect() {
    var options = {server: {socketOptions: {keepAlive: 1}}};
    return mongoose.connect(config.db, options).connection;
}

