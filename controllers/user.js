var mongoose = require('mongoose');
var User = mongoose.model('User');

exports.create = function (req, res, next) {
    if (req.body.name) {
        // Try to find existing user
        User.getByName(req.body.name).then(function(result) {
            // User with existing name was found
            if (result.length > 0) {
                res.status(409).json({error: "User with the specified name already exists. Please choose another name."});
            }
            // Else create new user
            else {
                user = new User();
                user.name = req.body.name;
                user.pictureUrl = req.body.pictureUrl;
            
                user.create().then(function(r){
                    res.status(200).json({id: r.insertedId});
                });
            }
        });
    }
};

exports.list = function (req, res, next) {
    // Load all users
    User.list().then(function(results){
        users = results;
        res.render('index', {users: users});
    });
}