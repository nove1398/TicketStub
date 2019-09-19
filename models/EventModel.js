const Mongoose = require('mongoose');
const Utils = require('../utils/NodeUtils');
const Schema = Mongoose.Schema({
    isActive: {
        type: Boolean,
        required: true
    },
    createdDate: {
        type: Date,
        default: Date.now
    },
    author: {
        type: Mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    eventFlyer: {
        type: String,
        default: null
    },
    eventTags: [{
        name: String
    }],
    ticketCurrency: {
        type: String,
        validate: {
            validator: function (v) {
                return /cad|usd/.test(v);
            },
            message: '{VALUE} is not a valid currency type!'
        }
    },
    ticketTypes: [{
            name: String,
            price: {
                type: Number,
                get: function (val) {
                    return parseFloat((val / 100)).toFixed(2);
                },
                set: function (val) {
                    return Math.round(parseFloat(val) * 100);
                }
            },
            description: String,
            quantity: Number,
            limitSales: Boolean,
            saleStart: {
                type: String
            },
            saleEnd: {
                type: String
            }
        }

    ],
    eventName: {
        type: String,
        required: true,
        index: true
    },
    organizerName: {
        type: String,
        default: null,
        index: true
    },
    eventDescription: {
        type: String,
        required: true,
        default: null
    },
    eventCountry: {
        type: String,
        default: null,
        index: true
    },
    eventVenueName: {
        type: String,
        default: null
    },
    eventAddress: {
        address: String,
        state: String,
        city: String,
        zip: String,
    },
    eventTime: {
        start: {
            time: {
                type: String
            },
            timeOfDay: {
                type: String,
                validate: {
                    validator: function (v) {
                        return /am|pm/.test(v);
                    },
                    message: '{VALUE} is not a valid option'
                }
            }
        },
        end: {
            time: {
                type: String
            },
            timeOfDay: {
                type: String,
                validate: {
                    validator: function (v) {
                        return /am|pm/.test(v);
                    },
                    message: '{VALUE} is not a valid option'
                }
            }
        }
    },
    eventDate: {
        day: {
            type: String,
            default: null
        },
        month: {
            type: String,
            default: null,
            index: true
        },
        year: {
            type: String,
            default: null
        }
    },
    eventViews: {
        type: Number,
        default: 0
    },
    eventPurchaseClicks: {
        type: Number,
        default: 0
    },
    isRsvpEnabled: {
        type: Boolean,
        default: false
    },
    rsvpCount: {
        type: Number,
        default: 0
    },
    rsvpTotal: {
        type: Number,
        default: 0
    },
    lastViewed: {
        type: Date,
        get: function (val) {
            return Utils.prettyDate(val);
        }
    }
});

// Schema.pre('findOneAndUpdate', function (next) {
//     console.log('presave');
//     if (this.ticketCurrency !== "cad" || this.ticketCurrency !== "usd") {
//         let err = new Error('Invalid currency type');
//         err.msg = "Invalid currency selected";
//         err.code = 12000;
//         return next(err);
//     }
//     next();
// });
Schema.virtual('fixedDate')
    .get(function () {
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        let temp = this.createdDate;
        let year = new Date(temp).getFullYear();
        return monthNames[temp.getMonth()] + ' ' + temp.getDate() + ', ' + year;
    });

Schema.statics.updatePurchaseClicks = function (id) {
    let query = {
        _id: id
    };
    let update = {
        $inc: {
            eventPurchaseClicks: 1
        }
    };
    return this.model('Event')
        .findOneAndUpdate(query, update)
        .exec();
}

Schema.statics.updateEventviews = function (id) {
    let query = {
        _id: id
    };
    let update = {
        $inc: {
            eventViews: 1
        },
        $set: {
            lastViewed: new Date()
        }
    };
    return this.model('Event')
        .findOneAndUpdate(query, update)
        .exec();
}

Schema.statics.subEventRsvp = function (id) {
    let query = {
        _id: id
    };
    let update = {
        $inc: {
            rsvpCount: -1
        }
    };
    return this.model('Event')
        .findOneAndUpdate(query, update)
        .exec();
}

Schema.statics.getPostedEvents = function (id) {
    let query = {
        author: id
    }; //get all events belonging to author
    return this.model('Event')
        .find(query)
        .sort({
            createdDate: -1
        })
        .exec();
}

Schema.statics.getAllEvents = function (lastId) {
    let query = {
        _id: {
            $gt: lastId
        }
    }; //get all events belonging to author
    return this.model('Event')
        .find(lastId === '' ? {} : query)
        .sort({
            createdDate: -1
        })
        .limit(30)
        .exec();
}

Schema.statics.getEvent = function (id) {
    let query = {
        _id: id
    }; //get all events belonging to author
    return this.model('Event')
        .findOne(query)
        .exec();
}

Schema.statics.getSalesCount = function (id) {
    return this.model('TicketSale')
        .find({
            event: id
        })
        .populate('user', 'name')
        .exec();
}

Schema.statics.getTotalTickets = function (id) {
    return this.model('Event').findOne({
        _id: id
    }).exec();
}

Schema.statics.searchEvents = function (term, lastId) {
    term = term.trim().toLowerCase() || '';
    lastId = lastId.trim() || '';
    let sort = {
        createdDate: -1
    };
    let query1 = {
        eventName: {
            $regex: term
        }
    };
    let query2 = {
        eventName: {
            $regex: term
        },
        _id: {
            '$gt': lastId
        }
    };
    return this.model('Event')
        .find((lastId === '') ? query1 : query2)
        .select({
            _id: 1,
            eventDescription: 1,
            eventFlyer: 1,
            eventName: 1,
            isActive: 1
        })
        .sort(sort)
        .limit(20)
        .exec();
}
Schema.statics.getMostViewedEvent = function (id) {
    return this.model('Event')
        .find({
            isActive: true,
        })
        .select({
            eventViews: 1,
            lastViewed: 1,
            eventName: 1,
            eventPurchaseClicks: 1
        })
        .sort('-eventViews')
        .limit(1)
        .exec();
}

module.exports = Mongoose.model('Event', Schema, 'Events');