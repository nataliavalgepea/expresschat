var mongoose = require('mongoose');
var User = mongoose.model('User');
var Room = mongoose.model('Room');
var Message = mongoose.model('Message');
var ObjectId = mongoose.Types.ObjectId;

exports.enter = function (req, res, next) {
    var user = {};
    
    function enterChat() {
        User.list().then(function (users) {
            // Remove current user from the list of users
            users = users.filter(function (i) {
                return String(i._id) != String(user._id);
            });
            Room.list().then(function (rooms) {
                res.render('chat', {user: user, users: users, rooms: rooms, room: null});
            }).catch(function (err) {
                console.log(err);
            });
        });
    }
    
    // Create new user and then enter the chat
    if (req.body.name) {
        // Check if the user already exists
        User.getByName(req.body.name).then(function (result) {
            if (result.length > 0) {
                user = result[0];
                enterChat();
            } else {
                user = new User();
                user.name = req.body.name;
                user.pictureUrl = req.body.pictureUrl;
                
                user.create().then(function (r) {
                    user._id = r.insertedId;
                    enterChat();
                });
            }
        });
    }
    // Enter the chat as existing user
    else if (req.params.id) {
        User.findById(ObjectId(req.params.id)).then(function (result) {
            user = result;
            enterChat();
        });
    }
};

exports.enterRoom = function (req, res, next) {
    // Find the room to enter
    Room.get(ObjectId(req.params.roomId)).then(function (result) {
        var currentUserId = req.params.userId;
        var currentUser = null;
        var interlocutor = null;
        var users = [];
        var messages = [];
        
        // Checks whether the current user is initiator or interlocutor
        if (result.initiator && result.interlocutor) {
            if (currentUserId == result.initiator._id) {
                currentUser = result.initiator;
                interlocutor = result.interlocutor
            } else {
                interlocutor = result.initiator
                currentUser = result.interlocutor;
            }
            proceed();
        } else {
            User.get(ObjectId(currentUserId)).then(function (result) {
                currentUser = result;
                proceed();
            }).catch(function (error) {
                console.log(error);
            });
        }
        
        function proceed() {
            // Load all users
            User.list().then(function (results) {
                // Remove current user from the list of users
                users = results.filter(function (i) {
                    return String(i._id) != String(currentUserId);
                });
                
                // Load all messsages in the room
                Message.list(req.params.roomId).then(function (results) {
                    messages = results;
                    res.render('chat', {room: result, messages: messages, user: currentUser, interlocutor: interlocutor, users: users});
                });
            });
        }
    });
    
};

exports.getRoom = function (req, res, next) {
    var currentUserId = req.query.currentUser;
    var requestedUserId = req.query.requestedUser;
    
    // Try to get existing chat room
    Room.find(currentUserId, requestedUserId).then(function (results) {
        
        // Create new room if nothing was found
        if (results.length == 0) {
            var room = new Room();
            room.initiator = currentUserId;
            room.interlocutor = requestedUserId;
            
            room.createPrivate().then(function (room) {
                res.setHeader('Content-Type', 'application/json');
                res.send({id: room.insertedId});
            });
        }
        // Else use the existing room
        else {
            var room = results[0];
            res.setHeader('Content-Type', 'application/json');
            res.send({id: room._id});
        }
    }).catch(function (err) {
        console.log(err);
    });
};

exports.create = function (req, res, next) {
    if (req.body) {
        room = new Room();
        room.name = req.body.name;
        room.initiator = ObjectId(req.body.initiator);
        
        room.createPublic().then(function (r) {
            res.status(200).json({id: r.insertedId});
        });
    }
};

