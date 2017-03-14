var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RoomSchema = new Schema({
    _id: {type: Schema.ObjectId},
    initiator: {type: Schema.ObjectId, ref: 'User'},
    interlocutor: {type: Schema.ObjectId, ref: 'User'},
    name: {type: String},
    public : {type: Boolean}
});

RoomSchema.methods = {
    createPublic: function() {
        return mongoose.connection.db.eval('createPublicRoom(' + JSON.stringify(this) + ')').then(function (r) {
            return r;
        });
    },
    createPrivate: function () {
        return mongoose.connection.db.eval('createPrivateRoom(' + JSON.stringify(this) + ')').then(function (r) {
            return r;
        });
    }
};

RoomSchema.statics = {
    list: function () {
        return mongoose.connection.db.eval('getRooms()');
    },
    find: function (u1, u2) {
        return mongoose.connection.db.eval('findPrivateRoom("' + u1 + '", "' + u2 + '")');
    },
    get: function (_id) {
        return this.findOne({_id: _id}).populate('initiator').populate('interlocutor').exec();
    }
};

mongoose.model('Room', RoomSchema);