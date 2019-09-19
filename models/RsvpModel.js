const Mongoose = require('mongoose');
const Utils = require('../utils/NodeUtils');
const Schema = Mongoose.Schema({
    event: {
        type: Mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Event'
    },
    user: {
        type: Mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    email: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now(),
        get: function (val) {
            return Utils.prettyDate(val);
        }
    }
});

Schema.statics.getRsvpData = function (id) {
    let query = {
        event: id
    }; //get all events belonging to author
    return this.model('Rsvp')
        .find(query)
        .sort({
            date: -1
        })
        .populate('event', 'eventName')
        .populate('user', 'name')
        .exec();
}

Schema.statics.getRsvpSaved = function (id, userId) {
    let query = {
        event: id,
        user: userId
    }; //get all events belonging to author
    return this.model('Rsvp')
        .countDocuments(query)
        .exec();
}

module.exports = Mongoose.model('Rsvp', Schema, 'Rsvps');