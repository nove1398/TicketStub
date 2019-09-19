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
    orderNumber: {
        type: String,
        required: true,
        index: true
    },
    purchaseDate: {
        type: Date,
        default: Date.now(),
        get: function (val) {
            return Utils.prettyDate(val);
        }
    },
    ticketAmount: {
        type: Number
    },
    ticketSum: {
        type: String,
        default: '00.00'
    },
    ticketsBought: [{
        name: {
            type: String
        },
        quantity: {
            type: Number
        }
    }],
    eventAttendees: [{
        Name: {
            type: String
        },
        ticketType: {
            type: String
        }
    }],
    ticketReceipt: {
        type: String
    }
});

Schema.statics.orderExists = function (needle, cb) {
    return this.model('TicketSale').count({
        orderNumber: needle
    });
}

Schema.statics.orderNumberExists = function (needle) {
    return this.model('TicketSale')
        .findOne({
            orderNumber: needle
        })
        .populate('event', 'eventName eventDate')
        .populate('user', 'name')
        .exec();
}

Schema.statics.getMyOrders = function (needle) {
    return this.model('TicketSale')
        .find({
            user: needle
        })
        .populate('event', 'eventName eventDate')
        .sort('-purchaseDate')
        .exec();
}


Schema.statics.generateOrderNumber = function () {
    let now = Date.now().toString();
    // pad with extra random digit
    now += now + Math.floor(Math.random() * 10);
    // format
    return [now.slice(0, 4), now.slice(4, 10), now.slice(10, 14)].join('-');
}

Schema.statics.getHighestOrders = function (needle) {
    return this.model('TicketSale')
        .findOne({})
        .sort('-ticketSum')
        .populate('event', 'eventName')
        .exec();
}

Schema.statics.getHighestSale = function (needle) {
    return this.model('TicketSale')
        .findOne({})
        .sort('-ticketAmount')
        .populate('event', 'eventName')
        .exec();
}

module.exports = Mongoose.model('TicketSale', Schema, 'TicketSales');