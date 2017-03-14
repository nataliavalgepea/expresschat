var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    _id: {type: Schema.ObjectId},
    name: {type: String, default: 'Anonymous'},
    pictureUrl: {type: String, default: '/assets/img/6.png'}
});

UserSchema.methods = {
    create: function () {
        if (!this.name) {
            this.name = 'Anonymous';
        }
        return mongoose.connection.db.eval('createUser(' + JSON.stringify(this) + ')').then(function (r) {
            return r;
        });
    }
};

UserSchema.statics = {
    list: function () {
        return this.find().exec();
    },
    getByName: function (name) {
        return this.find({name: name}).exec();
    },
    get: function (_id) {
        return this.findOne({_id: _id}).exec();
    }
}

mongoose.model('User', UserSchema);