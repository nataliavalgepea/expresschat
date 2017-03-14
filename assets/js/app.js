(function () {
    "use strict";
    
    var socket = io();
    var messagesCount = 5;
    var messagesContainer = $('ul#messages');
    var delay = 2000;
    var interval;
    var messages = [
        "I danced with a squirrel sliding down a hill because I'm sexy and I know it.",
        "I pooped on a spoon in an elevator because the voices told me to.",
        "I trolled a football player on your car because Big Bird told me to.",
        "I yelled at a snowman in line at the bank because I'm sexy and I know it.",
        "I karate chopped my dog while riding a motorcycle because that's the way the cookie crumbles.",
        "I farted on a baseball bat in a hole because I like getting wet.",
        "I yelled at a banana while riding a motorcycle because that's how I roll.",
        "I trolled my mobile phone while riding a motorcycle because Big Bird told me to.",
        "I karate chopped a gangster while riding a motorcycle because Daddy would like some sausages.",
        "I smelled a fork in a swimming pool because I like getting wet.",
        "I ran over a llama in my car because I'm a ninja!",
        "I ran over a nipple in a swimming pool because I'm sexy and I do what I want",
        "I pooped on your mom while riding a motorcycle because I'm cool like that"
    ];
    var roomId = $('.room').attr('id');
    
    socket.on('connect', function (data) {
        console.log("Connected to chat");
        socket.on('new-message', function (message) {
            if (message.room == roomId) {
                var htmlMessage = generateTemplate(message.message, message.sender, message.date);
                $(messagesContainer).append(htmlMessage);
            } else {
                var badge = $('#badge_' + message.sender._id);
                var counter = $(badge).text();
                if (!counter) {
                    counter = 0;
                }
                $('#badge_' + message.sender._id).text(parseInt(counter) + 1);
            }
        });
    });
    
    function generateTemplate(message, user, date) {
        if (!user) {
            user = {
                name: $('.current_user').text(),
                _id: $('.current_user').attr('id'),
                pictureUrl: $('#current_user_picture').attr('src')
            };
        }
        
        return "<li class='media message'>" +
            "<div class='media-body'>" +
            "<div class='media'>" +
            "<a class='pull-left' href='#'>" +
            "<img class='media-object img-circle ' src='" + user.pictureUrl + "'/>" +
            "</a>" +
            "<div class='media-body'>" +
            message +
            "<br/>" +
            "<small class='text-muted'>" + user.name + " | " + date + "</small>" +
            "</div>" +
            "</div>" +
            "</div>" +
            "</li>";
    }
    
    function addMessage() {
        var messageText = $("input[type=text]").val();
        var message = generateTemplate(messageText, null, moment().format('HH:mm:ss'));
        $(messagesContainer).append(message);
        
        var msgObject = {
            room: roomId,
            message: messageText,
            sender: $('.current_user').attr('id')
        };
        
        socket.emit('message', msgObject);
    }
    
    function displayMessages() {
        var index = 0;
        var stop = function () {
            if (index == messagesCount) {
                clearInterval(interval);
            }
        }
        
        var start = function () {
            interval = setInterval(function () {
                var message = generateTemplate(messages[Math.floor(Math.random() * messages.length)]);
                $(messagesContainer).append(message);
                index++;
                stop();
            }, delay);
        }
        
        start();
    }
    
    function findRoom(currentUserId, requestedUserId) {
    }
    
    function clearMessages() {
        clearInterval(interval);
        $(messagesContainer).empty();
    }
    
    $(document).ready(function () {
        
        if (roomId) {
            socket.emit('room', roomId);
        }
        // displayMessages();
        if ($(".current_user").attr('id')) {
            socket.emit('entered-chat', $('.current_user').attr('id'));
        }
        $(".clear-messages").click(function () {
            clearMessages();
            displayMessages();
        });
        
        $("#message-btn").click(function () {
            addMessage();
            $("#message-input").val("");
        });
        
        $("#message-input").keypress(function (e) {
            if (e.which == 13) {
                addMessage();
                $("#message-input").val("");
            }
        });
        
        $(".chat-user").click(function () {
            var currentUserId = $('.current_user').attr('id');
            var requestedUserId = $(this).attr('id');
            $.get('/get-room?currentUser=' + currentUserId + '&requestedUser=' + requestedUserId, function (response) {
                window.location = '/chat/' + currentUserId + '/room/' + response.id;
            });
        });
        
        $('#userForm').submit(function (e) {
            e.preventDefault();
            var formData = $("#userForm").serialize();
            $.post('/create-user', formData)
                .done(function (response) {
                    $("#user-error").text("");
                    window.location = '/chat/' + response.id;
                })
                .fail(function (xhr, status, error) {
                    $("#user-error").text(xhr.responseJSON.error);
                });
        });
        
        $('#roomForm').submit(function (e) {
            e.preventDefault();
            var currentUserId = $('.current_user').attr('id');
            var formData = $("#roomForm").serialize();
            $.post('/create-room', formData)
                .done(function (response) {
                    window.location = '/chat/' + currentUserId + '/room/' + response.id;
                })
                .fail(function (xhr, status, error) {
                    console.log(error);
                });
        });
    });
})();

