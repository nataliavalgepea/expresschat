var express = require('express');
var router = express.Router();
var config = require('../config');
var chat = require('../controllers/chat');
var user = require('../controllers/user');

router.get('/', user.list);

router.get('/chat/:id', chat.enter);

router.post('/create-room', chat.create);

router.post('/create-user', user.create);

router.get('/chat/:userId/room/:roomId', chat.enterRoom);

router.get('/get-room', chat.getRoom);

module.exports = router;