/* IMPORT NEEDED MODULES */
const SalesModel = require('../models/SalesModel.js');
const EventModel = require('../models/EventModel.js');
const UserModel = require('../models/UserModel.js');
const RsvpModel = require('../models/RsvpModel.js');
const BookmarkModel = require('../models/UserBookmarks.js');



/* ROUTES */
exports.home = async (req, res, next) => {
    try {
        //.aggregate({$unwind:"$ticketTypes"},{$group:{_id:null,maxVal:{$max:"$ticketTypes.price"},minVal:{$min:"$ticketTypes.price"}}})
        let query = {
            isActive: true
        };
        let sort = {
            createdDate: -1
        };
        const docs = await EventModel.find(query).sort(sort).limit(20).exec();
        res.render('main/home.ejs', {
            pageTitle: 'Island Stub Home',
            docCount: docs.length,
            records: docs
        });
    } catch (err) {
        res.status(501).json({
            msg: 'Oh noe... an error occured',
            error: err
        });
    }

};

exports.search_page = async (req, res, next) => {
    try {
        let term = req.params.term || '';
        let country = req.params.country || '';
        let query1 = {
            isActive: true
        };
        let query2 = {
            isActive: true,
            $and: [{
                    $text: {
                        $search: term
                    }
                },
                {
                    eventCountry: {
                        $regex: new RegExp(country)
                    }
                }
            ]
        };
        const docs = await EventModel
            .find((term === '') ? query1 : query2)
            .select({
                _id: 1,
                eventAddress: 1,
                eventTags: 1,
                eventDescription: 1,
                eventFlyer: 1,
                ticketTypes: 1,
                eventName: 1
            })
            .sort({
                createdDate: -1
            })
            .limit(20)
            .exec();

        res.render('main/eventSearchPage.ejs', {
            pageTitle: 'Island Stub Search',
            records: docs,
            search: term,
            location: country
        });
    } catch (err) {
        console.log(err);
        res.status(501).json({
            msg: 'Oh no... an error occured',
            error: err
        });
    }

};

exports.view_event_page = async (req, res, next) => {
    try {
        let eventId = req.params.id.trim();
        let query = {
            _id: eventId,
            isActive: true
        };
        const doc = await EventModel.findOne(query)
            .select({
                _id: 1,
                isActive: 1,
                eventAddress: 1,
                eventTags: 1,
                eventVenueName: 1,
                eventDescription: 1,
                eventFlyer: 1,
                ticketTypes: 1,
                eventTime: 1,
                eventName: 1,
                eventDate: 1,
                organizerName: 1,
                ticketCurrency: 1,
                isRsvpEnabled: 1,
                rsvpCount: 1
            })
            .exec();
        await EventModel.updateEventviews(eventId);

        res.render('main/eventDisplayPage.ejs', {
            pageTitle: 'Island Stub - ' + doc.eventName.toUpperCase(),
            doc: doc || null
        });
    } catch (err) {
        console.log(err);
        res.status(501).json({
            msg: 'Oh no... an error occured',
            error: err
        });
    }

};

exports.user_profile_page = async (req, res, next) => {
    try {
        let userId = req.session.userId;
        let userLevel = await UserModel.findOne({
            _id: userId
        }, 'level');
        let userName = req.session.name;
        if (userLevel.level === 3 || userLevel.level === 1) {
            const bookmarks = await BookmarkModel.getMyBookmarks(userId);
            const orders = await SalesModel.getMyOrders(userId);
            res.render('main/userProfile.ejs', {
                pageTitle: 'Island Stub User Dashboard',
                client: userName,
                savedDocs: bookmarks,
                historyDocs: orders
            });
        } else if (userLevel.level === 2) {
            const docs = await EventModel.getPostedEvents(userId);
            res.render('main/sellerProfile.ejs', {
                pageTitle: 'Island Stub Seller Dahboard',
                client: userName,
                eventDocs: docs
            });
        } else
            throw new Error('Failed to find resource');
    } catch (error) {
        console.log('user profile error =>', error);
        res.redirect('/home');
    }
};

exports.manage_event = async (req, res, next) => {
    try {
        let eventId = req.params.id.trim();
        const docs = await EventModel.getSalesCount(eventId);
        const eventDoc = await EventModel.getEvent(eventId);
        const rsvpDoc = await RsvpModel.getRsvpData(eventId);
        const totalSales = docs.length;
        let salesSummary = {};
        let tempObj;
        for (let i = 0; i < docs.length; i++) {
            tempObj = docs[i];
            tempObj.ticketsBought.forEach(element => {
                if (typeof element.quantity === 'undefined') return;
                if (salesSummary[element.name])
                    salesSummary[element.name] += element.quantity;
                else
                    salesSummary[element.name] = element.quantity;
            });
        }
        res.render('main/manageEvent.ejs', {
            pageTitle: 'Island Stub Manage Event',
            totalSales: totalSales,
            ticketSales: salesSummary,
            records: docs,
            eventDoc: eventDoc,
            rsvpDocs: rsvpDoc
        });
    } catch (error) {
        console.log(error);
        res.render('fails/500.ejs', {
            status: 500,
            msg: 'There was a server error trying to process that request'
        });
    }
};

exports.contact_us_page = (req, res, next) => {
    res.render('main/contactUs.ejs', {
        pageTitle: 'Island Stub Contact Us'
    });
};

exports.about_us_page = (req, res, next) => {
    res.render('main/aboutUs.ejs', {
        pageTitle: 'Island Stub About Us'
    });
};

exports.create_event_page = (req, res, next) => {
    res.render('main/createEventPage.ejs', {
        pageTitle: 'Island Stub Create Event'
    });
};

exports.register_page = (req, res, next) => {
    res.render('main/registerUser.ejs', {
        pageTitle: 'Island Stub Registration'
    });
};

exports.login_user_page = (req, res, next) => {
    res.render('main/loginUser.ejs', {
        pageTitle: 'Island Stub Registration'
    });
};

exports.ticket_checker = (req, res, next) => {
    res.render('scanner/index.ejs', {
        pageTitle: 'Order Checker'
    });
};

exports.reset_password = (req, res, next) => {
    res.render('main/resetPassword.ejs', {
        pageTitle: 'Password Reset'
    });
};

exports.confirm_reset = (req, res, next) => {
    res.render('main/confirmReset.ejs', {
        pageTitle: 'Password Reset'
    });
};

exports.terms_page = (req, res, next) => {
    res.render('main/terms.ejs', {
        pageTitle: 'Terms and Condition'
    });
};

exports.seller_update = async (req, res, next) => {
    try {
        const user = await UserModel.findOne({
            _id: req.session.userId
        }).select('payment');
        res.render('main/sellerInfo.ejs', {
            pageTitle: 'Update Banking Information',
            banking: user
        });
    } catch (error) {
        console.log(error);
    }
};

exports.privacy_page = (req, res, next) => {
    res.render('main/privacyPolicy.ejs', {
        pageTitle: 'privacy Policy'
    });
};

exports.refund_page = (req, res, next) => {
    res.render('main/refundPolicy.ejs', {
        pageTitle: 'Refund Policy'
    });
};

exports.edit_event = async (req, res, next) => {
    try {
        const doc = await EventModel.getEvent(req.params.id);
        res.render('main/eventEdit.ejs', {
            pageTitle: 'Edit Event',
            data: doc
        });
    } catch (error) {
        res.render('fails/500.ejs', {
            status: 500,
            msg: 'There was a server error trying to process that request'
        });
    }

};

exports.redirect_500 = (req, res, next) => {
    res.render('fails/notAuthorized.ejs', {
        pageTitle: 'Not Authorized',
        msg: 'Only for authorized persons'
    });
};


exports.redirect_home = (req, res, next) => {
    res.redirect('/home');
};