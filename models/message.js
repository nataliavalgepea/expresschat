var mongoose = require('mongoose');
require('mongoose-moment')(mongoose);

var Schema = mongoose.Schema;
var Moment = require('moment');

var MessageSchema = new Schema({
    _id: {type: Schema.ObjectId},
    room: {type: Schema.ObjectId, ref: 'Room'},
    sender: {type: Schema.ObjectId, ref: 'User'},
    date: {type: Date, default: new Moment().toDate()},
    body: {type: String, default: ''}
});

MessageSchema.methods = {
    create: function () {
        this.date = new Moment().toDate();
        return mongoose.connection.db.eval('createMessage(' + JSON.stringify(this) + ')').then(function (r) {
            return r;
        });
    }
};

MessageSchema.statics = {
    list: function (roomId) {
        return mongoose.connection.db.eval('getMessages("' + roomId + '")').then(function (r) {
            r.forEach(function (i) {
                i.sender = i.sender[0];
                i.date = Moment(i.date).format('HH:mm:ss');
            });
            return r;
        }).catch(function(err){
            console.log(err);
        });
    }
};

mongoose.model('Message', MessageSchema);