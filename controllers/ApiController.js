//import models needed
const EventModel = require('../models/EventModel.js');
const UserModel = require('../models/UserModel.js');
const RsvpModel = require('../models/RsvpModel.js');
const BookmarkModel = require('../models/UserBookmarks.js');
const SalesModel = require('../models/SalesModel.js');
const {
    isNumeric,
    isAlpha,
    isAlphaNum,
    isAddress,
    isTime,
    isValidEmail,
    toTitleCase,
    parseRsvpReceipt,
    parseHtmlReceipt,
    prettyDate,
    emailPusher,
    parseBankingInfo
} = require('../utils/NodeUtils.js');
const Config = require('../utils/Config.js');
const PDF = require('html-pdf');
const Stripe = require('stripe')(Config.stripeKey());
const Mongoose = require('mongoose');
const FS = require('fs');
const BarcodeGen = require('bwip-js');
const Path = require('path');
const Multer = require('multer');
const Bcrypt = require('bcryptjs');
const NodeMailer = require('nodemailer');
const FileStorage = Multer.diskStorage({
    destination: (req, file, cb) => {
        if (!FS.existsSync('/home/nove/IslandStub/public/eventFlyers/'))
            FS.mkdirSync('/home/nove/IslandStub/public/eventFlyers/');

        cb(null, 'public/eventFlyers/');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '_' + Date.now() + Path.extname(file.originalname.toLowerCase()));
    }
});
const Upload = Multer({
    storage: FileStorage,
    limits: {
        fileSize: 1048576 * 1 * 15
    }, //1mb
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
            cb(null, true);
        } else {
            cb({
                fileType: file.mimetype,
                msg: `${file.mimetype} Invalid file type selected`,
                code: 502
            }, false);
        }
    }
});

exports.file_handler = Upload.single('flyers');

exports.new_event = async (req, res, next) => {
    try {
        const errorArray = [];
        // isAlpha(req.body.eventName, errorArray,'Event name');
        // isAlpha(req.body.organizerName, errorArray, 'Organizer name');
        // //isAlpha(req.body.eventDescription,errorArray,'Event description');
        // isAlpha(req.body.eventCountry, errorArray, 'Event country');
        // isAlpha(req.body.eventCity, errorArray, 'Event city');
        // isAlpha(req.body.eventAddress1, errorArray, 'Event address');
        // if(req.body.eventAddress2.length > 0)
        //     isAlpha(req.body.eventAddress2, errorArray, 'Event address line 2');
        // isTime(req.body.eventTimeStart, errorArray, 'For a starting time');
        // isTime(req.body.eventTimeEnd, errorArray, 'For a ending time');
        // isAlpha(req.body.eventTimeOfDayStart, errorArray, 'Invalid character');
        // isAlpha(req.body.eventTimeOfDayEnd, errorArray, 'Invalid character');

        // if (errorArray.length > 0) {
        //     return res.json({
        //         error: errorArray
        //     });
        // }

        let tagsArr = req.body.eventTags.split(",");
        let eventModel = new EventModel();
        eventModel.eventFlyer = (typeof req.file != 'undefined') ? '/flyers/' + req.file.filename : null;
        eventModel.isActive = true;
        eventModel.author = Mongoose.Types.ObjectId(req.session.userId);
        eventModel.eventName = req.body.eventName.toLowerCase();
        eventModel.organizerName = req.body.orgName.toLowerCase();
        eventModel.eventDescription = req.body.eventDescription.trim();
        eventModel.eventCountry = req.body.eventCountry;
        eventModel.eventAddress.address = req.body.eventAddress.toLowerCase();
        eventModel.eventAddress.zip = req.body.eventZipcode;
        eventModel.eventAddress.city = req.body.eventCity.toLowerCase();
        eventModel.eventAddress.state = req.body.eventState.toLowerCase();
        eventModel.eventTime.start.time = req.body.eventTimeStart;
        eventModel.eventTime.end.time = req.body.eventTimeEnd;
        eventModel.eventTime.start.timeOfDay = req.body.eventTimeOfDayStart.toLowerCase();
        eventModel.eventTime.end.timeOfDay = req.body.eventTimeOfDayEnd.toLowerCase();
        eventModel.eventDate.day = req.body.eventDay.toLowerCase();
        eventModel.eventDate.month = req.body.eventMonth.toLowerCase();
        eventModel.eventDate.year = req.body.eventYear.toLowerCase();
        eventModel.ticketCurrency = req.body.ticketCurrency;
        eventModel.isRsvpEnabled = req.body.rsvpCheck === 'true' ? true : false;
        eventModel.rsvpCount = eventModel.isRsvpEnabled === true ? req.body.rsvpLimit : 0;
        eventModel.rsvpTotal = eventModel.isRsvpEnabled === true ? req.body.rsvpLimit : 0;

        eventModel.eventTags = tagsArr.map((item) => {
            if (item && item !== null && item.length > 0)
                return {
                    name: item.toLowerCase()
                };
        });
        const ticketObjs = JSON.parse(req.body.ticketData);
        
       for(let k=0;k<ticketObjs.length;k++){
          eventModel.ticketTypes.push({
                    name: ticketObjs[k].name,
                    price: ticketObjs[k].price,
                    description: ticketObjs[k].description,
                    quantity: ticketObjs[k].quantity,
                    limitSales: ticketObjs[k].limitedTime,
                    saleStart: ticketObjs[k].limitedStart,
                    saleEnd: ticketObjs[k].limitedEnd
                });
       }


        //  const validatorErr = await eventModel.validateSync();
        // //     if(validatorErr.errors['ticketCurrency'])
        //          for(let key in validatorErr.errors)
        //             console.log(key, validatorErr.errors[key].value + ' ' + validatorErr.errors[key].message);

        const result = await eventModel.save();
        return res.json({
            error: null,
            msg: 'Event posted successfully'
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
}

exports.get_all_events = async (req, res, next) => {
    try {
        let query = {};
        const docs = await EventModel.find(query).exec();
        return res.json({
            records: docs,
            count: docs.length
        });
    } catch (err) {
        next(err);
    }
}

//SEARCH FOR EVENT
exports.search_for_event = async (req, res, next) => {
    try {
        let country = req.body.location.trim() || '';
        let term = req.body.term.trim() || '';
        let lastId = req.body.lastId.trim() || '';
        let sort = {
            createdDate: -1
        };
        let query1 = {
            $text: {
                $search: term
            },
            eventCountry: {
                $regex: country
            }
        };
        let query2 = {
            $text: {
                $search: term
            },
            eventCountry: {
                $regex: country
            },
            _id: {
                '$gt': lastId
            }
        };
        // let query = { eventName:{ $regex: term, $options: 'i'}, eventCountry: country };
        const docs = await EventModel
            .find((lastId === '') ? query1 : query2)
            .select({
                _id: 1,
                eventAddress1: 1,
                eventAddress2: 1,
                eventTags: 1,
                eventDescription: 1,
                eventFlyer: 1,
                ticketTypes: 1,
                eventName: 1
            })
            .sort(sort)
            .limit(20)
            .exec();
        res.json({
            qry: term,
            records: docs,
            logged: req.session.isLogged
        });
    } catch (err) {
        next(err);
    }
};

//SAVE BOOKMARK
exports.save_bookmark = async (req, res, next) => {
    try {
        //save event to users list
        let id = req.body.eventId; //id of event
        let user = req.session.userId;
        const bookmarkCount = await BookmarkModel.getIsBookmarkSaved(user, id);
        if (bookmarkCount >= 1) {
            return res.json({
                error: {
                    msg: 'Event already saved to bookmarks'
                }
            });
        }
        const bookmark = new BookmarkModel();
        bookmark.user = req.session.userId;
        bookmark.title = req.body.name;
        bookmark.event = id;
        const doc = await bookmark.save();
        if (doc)
            res.json({
                msg: 'The event has been saved'
            });
        else
            res.status(402).json({
                error: {
                    msg: 'Failed to save bookmark, please try again'
                }
            });
    } catch (err) {
        res.status(402).json({
            error: {
                msg: 'Failed to save bookmark, please try again'
            }
        });
    }
};

//DELETE SAVED BOOKMARK
exports.delete_bookmark = async (req, res, next) => {
    try {
        //remove event to users list
        let id = req.body.eventId; //id of event
        let user = req.session.userId;
        const doc = await BookmarkModel.removeBookmark(user, id);

        if (doc) {
            res.json({
                msg: 'The bookmark has been removed'
            });
        } else {
            res.status(444).json({
                error: {
                    msg: 'Failed to remove bookmark, please try again'
                }
            });
        }

    } catch (err) {
        res.status(444).json({
            error: {
                msg: 'Failed to remove bookmark, please try again'
            }
        });
    }
};


exports.get_event_data = async (req, res, next) => {
    try {
        if (typeof req.session.userId === 'undefined')
            return res.status(401).json({
                error: {
                    msg: 'Authentication required, please log-in'
                }
            });
        let id = req.params.id.trim();
        EventModel.updatePurchaseClicks(id);
        const doc = await EventModel
            .findOne({
                _id: id
            })
            .select({
                _id: 1,
                ticketTypes: 1,
                ticketCurrency: 1
            })
            .exec();
        let clone = doc.ticketTypes.slice(0);
        doc.ticketTypes.forEach((element, index) => {
            if (element.quantity < 1)
                clone.splice(clone.indexOf(element), 1);
        });
        doc.ticketTypes = clone;

        return res.json({
            records: doc
        });
    } catch (err) {
        console.log(err);
        res.json({
            error: err
        });
    }
};

exports.delete_event = async (req, res, next) => {
    try {
        return;
        let id = req.body.eventId; //id of event
        const doc = await EventModel.findOneAndRemove({
            _id: id
        }).exec(); //change back to findoneandremove
        let fileLocation = '/home/nove/IslandStub/public/eventFlyers/' + doc.eventFlyer.replace('/flyers/', '');
        FS.unlinkSync(fileLocation);
        console.log(doc);
        if (doc)
            res.json({
                msg: 'The event has been removed',
                name: doc.eventName
            });
        else
            res.status(402).json({
                error: {
                    msg: 'Failed to remove event, please try again'
                }
            });
    } catch (err) {
        console.log(err);
    }
};

//CHECK ORDER NUMBER
exports.check_order_number = async (req, res, next) => {
    try {
        let order = req.body.order;
        const sale = await SalesModel.orderNumberExists(order);
        res.json(sale);
    } catch (error) {
        console.log(error);
    }
};

//RSVP FOR EVENT
exports.rsvp_for_event = async (req, res, next) => {
    try {
        if (typeof req.session.userId === 'undefined')
            return res.status(401).json({
                error: {
                    msg: 'Authentication required, please log-in'
                }
            });
        let {
            eventId,
            email
        } = req.body;
        isValidEmail(email);
        const foundEvent = await EventModel.findOne({
                _id: eventId,
                rsvpCount: {
                    $gte: 1
                }

            }).populate('author', 'email')
            .exec();
        if (!foundEvent) {
            return res.json({
                result: false,
                msg: 'RSVP has run out, sorry'
            });
        }
        const isReserved = await RsvpModel.getRsvpSaved(eventId, req.session.userId);
        if (isReserved > 0) {
            return res.json({
                result: false,
                msg: 'RSVP has already been made'
            });
        }
        await EventModel.subEventRsvp(eventId);
        let rsvp = new RsvpModel();
        rsvp.user = req.session.userId;
        rsvp.event = eventId;
        rsvp.email = email;
        await rsvp.save();

        const orderNumber = SalesModel.generateOrderNumber();

        //Generate barcode
        const bars = await new Promise((resolve, reject) => {
            BarcodeGen.toBuffer({
                bcid: 'code128', // Barcode type
                text: orderNumber, // Text to encode
                scale: 3, // 3x scaling factor
                height: 15, // Bar height, in millimeters
                includetext: false, // Show human-readable text
                textxalign: 'center', // Always good to set this
                paddingwidth: 10,
                paddingheight: 10
            }, function (err, png) {
                if (err) {
                    console.log(err);
                    return reject(err);
                }

                //return resolve(Buffer.from(png).toString('base64'));
                return resolve(png.toString('base64'));
            });
        });
        let buyerName = req.session.name.first + ' ' + req.session.name.last;
        let htmlBody = parseRsvpReceipt({
            name: toTitleCase(buyerName),
            date: prettyDate(Date.now()),
            bar: bars,
            fees: fromCents(0),
            eventName: toTitleCase(foundEvent.eventName),
            orderNumber: orderNumber
        });
        // Create a SMTP transporter object
        let transporter = NodeMailer.createTransport({
            host: Config.mailData().host,
            port: 465,
            secure: true,
            auth: {
                user: Config.mailData().user,
                pass: Config.mailData().pass
            },
            // tls: {
            //     rejectUnauthorized: false
            // },
            logger: false,
            debug: false // include SMTP traffic in the logs
        }, {
            // sender info
            from: 'IslandStub inc. <sales@islandstub.ca>'
        });
        let options = {
            format: 'Letter', // allowed units: A3, A4, A5, Legal, Letter, Tabloid
            orientation: "portrait"
        };
        let receiptName = buyerName.replace(/ /g, '_') + '_' + new Date().getTime() + '.pdf';
        let pdfDoc = await new Promise((resolve, reject) => {
            PDF.create(htmlBody, options)
                .toFile('/home/nove/IslandStub/public/userReceipts/' + receiptName, function (err, res) {
                    if (err)
                        return reject(err);
                    return resolve(res.filename);
                });
        });
        // Message object
        let message = {
            // Comma separated list of recipients
            to: `Support <sales@islandstub.ca>, ${toTitleCase(buyerName)} <${email}>, ${foundEvent.eventName} <${foundEvent.author.email}>`,
            // Subject of the message
            subject: `Island Stub Ticket Purchase for ${toTitleCase(foundEvent.eventName)}`,
            //Body of document
            html: `Hey <b>${toTitleCase(buyerName)}</b>! Thanks for your support you can find your ticket attached, enjoy!
                                If you have any queries or need additional information, you can contact the event promoter via email at ${foundEvent.author.email} .
                              <br>
                              IslandStub inc.&copy; ${new Date().getFullYear()}`,
            // An array of attachments
            attachments: [{
                filename: 'ticket_receipt.pdf',
                path: pdfDoc
            }]
        };
        transporter.sendMail(message);
        res.json({
            result: true,
            msg: 'RSVP sent successfully'
        });
    } catch (err) {
        next(err);
    }
};

//PURCHASING TICKETS
function toCents(val) {
    return Math.round(parseFloat(val) * 100);
}

function fromCents(val) {
    return parseFloat((val / 100)).toFixed(2);
}

function calcServiceFee(val) {
    return Math.round((val * 0.05) + 60);
}

function calcProcessFee(val) {
    return Math.round((val * 0.029) + 30);
}

exports.paypal_create_payment = async (req, res, next) => {
    try {
        let itemsArray = [];
        let totalPrice = 100;
        let currency = "USD";
        const vipQuantity = req.body.vq || 0;
        const earlybirdQuantity = req.body.ebq || 0;
        const generalQuantity = req.body.gq || 0;
        const freeQuantity = req.body.fq || 0;
        const eventId = req.body.itemID;
        const totaltickets = vipQuantity + generalQuantity + earlybirdQuantity;
        const event = await EventModel.findOne({
                _id: eventId,
                isActive: true
            })
            .select({
                _id: 1,
                ticketTypes: 1,
                ticketCurrency: 1,
                eventName: 1
            })
            .exec();
        currency = event.ticketCurrency || "USD";
        Object.keys(event.ticketTypes).forEach(element => {
            if (event.ticketTypes.hasOwnProperty(element) && element !== '$init') {
                let ticket = event.ticketTypes[element];
                if (ticket.quantity > 0)
                    itemsArray.push({
                        "name": ticket.name + ' ticket',
                        "sku": ticket.name,
                        "price": ticket.price,
                        "currency": currency,
                        "quantity": ticket.quantity
                    });
            }

        });



        PayPal.configure({
            'mode': 'sandbox', //sandbox or live
            'client_id': 'ATZeEfJqGVYvi2_Le8HI1sXunZLNx5ls7Hh0rHbCe7VnlKjcZSK9qVxOOBc0DtnMKtFGX55a9KFrayS1',
            'client_secret': 'ELAPuoTvq78JjcpFcvWsnqOnzcP2em776eXwrrkq04-CPRzBdkbzY-H1do80UPIeO_ssWC2y9l11G_Zs'
        });
        let create_payment_json = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": "http://return.url",
                "cancel_url": "http://cancel.url"
            },
            "transactions": [{
                "item_list": {
                    "items": itemsArray
                },
                "amount": {
                    "currency": currency,
                    "total": totalPrice
                },
                "description": `Buying ${totaltickets} tickets`
            }]
        };
        PayPal.payment.create(create_payment_json, function (error, payment) {
            if (error) {
                console.log(error.response);
                throw error;
            } else {
                console.log("Create Payment Response");
                console.log(payment);
                res.json(payment);
            }
        });

    } catch (error) {
        console.log(error);
    }
};
exports.paypal_execute_payment = async (req, res, next) => {
    try {
        var execute_payment_json = {
            "payer_id": req.body.payerID,
            "transactions": [{
                "amount": {
                    "currency": "USD",
                    "total": "100.00"
                }
            }]
        };

        var paymentId = req.body.paymentID;
        PayPal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
            if (error) {
                console.log(error.response);
                throw error;
            } else {
                console.log("Get Payment Response");
                console.log(payment);
                res.json(payment);
            }
        });
    } catch (error) {
        console.log(error);
    }
};
/*
SAMPLE CHECKOUT
{ eventId: '5ba8149a8b6a20581f7f4f62',
  tickets:
   [ { ticketId: '5bb3bee03a9b351363f2f32e', ticketQuantity: '1' } ],
  token:
   { id: 'tok_1DKXKPB0ojtYZbEn1HYbsmdB',
     object: 'token',
     card:
      { id: 'card_1DKXKOB0ojtYZbEnaXRVsYtF',
        object: 'card',
        address_city: 'georgetown',
        address_country: 'Jamaica',
        address_line1: 'lot 24 second street',
        address_line1_check: 'pass',
        address_line2: '',
        address_state: '',
        address_zip: '',
        address_zip_check: '',
        brand: 'Visa',
        country: 'US',
        cvc_check: 'pass',
        dynamic_last4: '',
        exp_month: '11',
        exp_year: '2022',
        funding: 'credit',
        last4: '4242',
        name: 'nigel howard',
        tokenization_method: '' },
     client_ip: '208.131.168.146',
     created: '1539376425',
     email: 'nove1398@yahoo.com',
     livemode: 'false',
     type: 'card',
     used: 'false' } }
*/
exports.checkout_tickets = async (req, res, next) => {
    try {
        if (typeof req.session.userId === 'undefined') {
            return res.status(401).json({
                error: {
                    msg: 'Authentication required, please log-in'
                }
            });
        }

        let selectedTickets = req.body.tickets;
        let eventId = req.body.eventId;
        let stripeToken = req.body.token;
        const eventObj = await EventModel.findOne({
                _id: eventId,
                isActive: true
            })
            .select({
                _id: 1,
                ticketTypes: 1,
                ticketCurrency: 1,
                eventName: 1
            })
            .populate('author', 'email')
            .exec();
        if (!eventObj) {
            return res.status(401).json({
                error: {
                    msg: 'Invalid event choosen'
                }
            });
        }
        let updatedTicketQuantity = [];
        let ticketsToBuy = selectedTickets.map((userTicket, index) => {
            let obj = eventObj.ticketTypes.find(o => {
                return o._id == userTicket.ticketId
            });
            if (obj) {
                obj.quantity -= Number(userTicket.ticketQuantity);
                updatedTicketQuantity.push(obj);
                return {
                    ticketAmount: Number(userTicket.ticketQuantity),
                    ...obj._doc,
                    currency: eventObj.ticketCurrency,
                    getTotalCents() {
                        let serviceFee = calcServiceFee(this.price);
                        let processFee = calcProcessFee(this.price + serviceFee);
                        let totalFees = (serviceFee + processFee);
                        return (Number(this.price) + totalFees) * Number(this.ticketAmount);
                    },
                    getFees() {
                        let serviceFee = calcServiceFee(this.price);
                        let processFee = calcProcessFee(this.price + serviceFee);
                        return (serviceFee + processFee);
                    },
                    getTotal() {
                        return fromCents(this.getTotalCents());
                    }
                };
            }
        });

        let totalPayable = ticketsToBuy.reduce((accum, item) => accum + item.getTotalCents(), 0);
        let totalFees = ticketsToBuy.reduce((accum, item) => accum + item.getFees(), 0);
        let totalTicketsBought = ticketsToBuy.reduce((accum, item) => accum + item.ticketAmount, 0);
        let currency = eventObj.ticketCurrency;
        const orderNumber = SalesModel.generateOrderNumber();
        let description = `Buying ${totalTicketsBought} tickets from IslandStub`;
        const customer = await Stripe.customers.create({
            email: stripeToken.email,
            card: stripeToken.id
        });
        const chargeResult = await Stripe.charges.create({
            amount: totalPayable,
            description: description,
            currency: currency,
            customer: customer.id,
            metadata: {
                order_number: orderNumber
            }
        });

        if (chargeResult.status === 'succeeded') {

            //Generate barcode
            const bars = await new Promise((resolve, reject) => {
                BarcodeGen.toBuffer({
                    bcid: 'code128', // Barcode type
                    text: orderNumber, // Text to encode
                    scale: 3, // 3x scaling factor
                    height: 15, // Bar height, in millimeters
                    includetext: false, // Show human-readable text
                    textxalign: 'center', // Always good to set this
                    paddingwidth: 10,
                    paddingheight: 10
                }, function (err, png) {
                    if (err) {
                        console.log(err);
                        return reject(err);
                    }
                    return resolve(png.toString('base64'));
                });
            });


            let buyerName = req.session.name.first + ' ' + req.session.name.last;
            let receiptName = buyerName.replace(/ /g, '_') + '_' + new Date().getTime() + '.pdf';
            let options = {
                format: 'Letter', // allowed units: A3, A4, A5, Legal, Letter, Tabloid
                orientation: "portrait"
            };
            let htmlBody = parseHtmlReceipt({
                buyerName: toTitleCase(buyerName),
                date: prettyDate(Date.now()),
                bar: bars,
                totalCost: fromCents(totalPayable),
                fees: fromCents(totalFees),
                eventName: toTitleCase(eventObj.eventName),
                tickets: ticketsToBuy,
                orderNumber: orderNumber,
                totalNumber: totalTicketsBought
            });
            let pdfDoc = await new Promise((resolve, reject) => {
                PDF.create(htmlBody, options)
                    .toFile('/home/nove/IslandStub/public/userReceipts/' + receiptName, function (err, res) {
                        if (err)
                            return reject(err);
                        return resolve(res.filename);
                    });
            });

            emailPusher({
                recipientsEmails: `Support <sales@islandstub.ca>, ${toTitleCase(buyerName)} <${req.session.userMail}>, ${eventObj.eventName} <${eventObj.author.email}>`,
                subjectText: `Island Stub Ticket Purchase for ${toTitleCase(eventObj.eventName)}`,
                htmlBody: `Hey <b>${toTitleCase(buyerName)}</b>! Thanks for your support you can find your ticket attached, enjoy the show.
                    If you have any queries or need additional information, you can contact the event promoter via email at ${eventObj.author.email} .
                    <br>
                    IslandStub inc.&copy; ${new Date().getFullYear()}`,
                attachmentFiles: {
                    filename: 'ticket_receipt.pdf',
                    path: pdfDoc
                }
            });
            const sale = new SalesModel();
            sale.event = eventObj._id;
            sale.user = req.session.userId;
            sale.orderNumber = orderNumber;
            sale.ticketAmount = totalTicketsBought;
            sale.ticketSum = fromCents(totalPayable);
            sale.ticketReceipt = '/vouchers/' + receiptName;
            for (let index = 0; index < ticketsToBuy.length; index++) {
                sale.ticketsBought.push({
                    name: ticketsToBuy[index].name,
                    quantity: ticketsToBuy[index].ticketAmount
                });
            }
            await sale.save();
            let query = {};
            for (let ticket of updatedTicketQuantity) {
                let index = eventObj.ticketTypes.indexOf(ticket);
                query["ticketTypes." + index + ".quantity"] = ticket.quantity;

            }
            await EventModel.findOneAndUpdate({
                _id: eventId
            }, {
                $set: query

            }, {
                "new": true
            }).exec();

            return res.json({
                status: 'succeeded',
                msg: 'Payment made successfully, please check your email.'
            });
        }
        res.json({
            status: 'failed',
            msg: 'Payment was not made successfully.'
        });

        // if(info.rejected.length > 0)
        //     console.log(info.rejected)
        // // only needed when using pooled connections
        // transporter.close();
    } catch (err) {
        console.log(err);
        next(err);
    }
};

exports.search_user = async (req, res, next) => {
    try {

        let name = req.params.name || '';
        let lastId = req.params.lastId || '';
        const userDocs = await UserModel.findUser(name, lastId);

        res.json({
            docs: userDocs
        });
    } catch (error) {
        next(error);
    }
};

exports.remove_user = async (req, res, next) => {
    try {
        let id = req.body.userId;
        const removedDoc = await UserModel.findOneAndRemove({
            _id: id
        }, {
            select: 'name'
        }).exec();
        res.json({
            doc: removedDoc
        });
    } catch (error) {
        console.log(error);

    }
};

exports.disable_user = async (req, res, next) => {
    try {
        let id = req.body.userId;
        const originalDoc = await UserModel.findById(id).select('isActive');
        const removedDoc = await UserModel.findByIdAndUpdate(id, {
            $set: {
                isActive: !originalDoc.isActive
            }
        }, {
            new: true,
            select: 'name isActive'
        });
        res.json({
            doc: removedDoc
        });
    } catch (error) {
        console.log(error);

    }
};

exports.admin_event_search = async (req, res, next) => {
    try {
        let term = req.params.term || '';
        let lastId = req.params.lastId || '';
        const eventDocs = await EventModel.searchEvents(term, lastId);
        res.json({
            docs: eventDocs
        });
    } catch (error) {
        console.log(error);
    }
};

exports.disable_event = async (req, res, next) => {
    try {
        let id = req.body.eventId;
        const originalDoc = await EventModel.findById(id).select('isActive');
        const removedDoc = await EventModel.findByIdAndUpdate(id, {
            $set: {
                isActive: !originalDoc.isActive
            }
        }, {
            new: true,
            select: 'eventName isActive'
        });
        res.json({
            doc: removedDoc
        });
    } catch (error) {
        console.log(error);

    }
};

exports.remove_event = async (req, res, next) => {
    try {
        let id = req.body.eventId;
        const removedDoc = await EventModel.findOne({
            _id: id
        }, {
            select: 'eventName eventFlyer'
        }); //change back to findoneandremove
        let fileLocation = '/home/nove/IslandStub/public/eventFlyers/' + removedDoc.eventFlyer.replace('/flyers/', '');
        //remove file associated with event
        FS.unlinkSync(fileLocation);
        res.json({
            doc: removedDoc
        });
    } catch (error) {
        console.log(error);

    }
};

exports.reset_password = async (req, res, next) => {
    try {
        let mail = req.body.email;

        let tempuser = await UserModel.findOne({
            email: mail
        }).select({
            name: 1,
            email: 1
        }).exec();
        await UserModel.findByIdAndUpdate(tempuser._id, {
            $set: {
                isActive: false,
                isReset: true
            }
        }).exec();
        let transporter = NodeMailer.createTransport({
            host: Config.mailData().host,
            port: 465,
            secure: true,
            auth: {
                user: Config.mailData().user,
                pass: Config.mailData().pass
            },
            // tls: {
            //     rejectUnauthorized: false
            // },
            logger: false,
            debug: false // include SMTP traffic in the logs
        }, {
            // sender info
            from: 'IslandStub inc. <support@islandstub.ca>'
        });
        let message = {
            // Comma separated list of recipients
            to: `${toTitleCase(tempuser.name.full)} <${mail}>`,
            // Subject of the message
            subject: `Reset Password Request`,
            //Body of document
            html: `Hey <b>${toTitleCase(tempuser.name.full)}</b>! This request was made to reset your password, 
                if this request was not made by you just ignore this email, 
                otherwise click the link below to continue resetting your password. 
                        <br>
                        <a href="https://islandstub.com/confirmreset/${tempuser._id}">Continue with reset</a>
                      <br>
                      IslandStub inc.&copy; ${new Date().getFullYear()}`
        };
        transporter.sendMail(message);
        res.json({
            msg: 'Request has been made'
        });
    } catch (error) {
        console.log(error);

    }
};

exports.confirm_reset_password = async (req, res, next) => {
    try {
        let id = req.body.rid;
        let newPass = req.body.pass;
        let tempUser = await UserModel.findOne({
            _id: id
        }).select({
            name: 1,
            email: 1,
            isActive: 1,
            isReset: 1
        }).exec();
        if (!tempUser.isReset || tempUser.isActive) {
            return res.status(405).json({
                status: 405,
                msg: 'Request has been denied'
            });
        }
        let newSalt = await Bcrypt.genSaltSync(10);
        let newHash = await Bcrypt.hashSync(newPass, newSalt);
        await UserModel.findByIdAndUpdate(tempUser._id, {
            $set: {
                isActive: true,
                isReset: false,
                salt: newSalt,
                hash: newHash
            }
        });
        let transporter = NodeMailer.createTransport({
            host: Config.mailData().host,
            port: 465,
            secure: true,
            auth: {
                user: Config.mailData().user,
                pass: Config.mailData().pass
            },
            // tls: {
            //     rejectUnauthorized: false
            // },
            logger: false,
            debug: false // include SMTP traffic in the logs
        }, {
            // sender info
            from: 'IslandStub inc. <support@islandstub.ca>'
        });
        let message = {
            // Comma separated list of recipients
            to: `${toTitleCase(tempUser.name.full)} <${tempUser.email}>`,
            // Subject of the message
            subject: `Reset Password Successfully Done`,
            //Body of document
            html: `Hey <b>${toTitleCase(tempUser.name.full)}</b>! This is to inform you that your password was reset successfully, enjoy!
                      <br>
                      IslandStub inc.&copy; ${new Date().getFullYear()}`
        };
        transporter.sendMail(message);
        res.json({
            msg: 'Password has been updated'
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 500,
            msg: 'Request has been denied'
        });
    }
};

exports.update_bank = async (req, res, next) => {
    try {
        let instNum = req.body.instNum;
        let branchNum = req.body.branchNum;
        let accNum = req.body.accNum;
        let bankName = req.body.bankName.toLowerCase();
        let accountName = req.body.accountName.toLowerCase();
        let paypalMail = req.body.paypalMail;
        const updatedDoc = await UserModel.findOneAndUpdate({
            _id: req.session.userId
        }, {
            "$set": {
                "payment.institutionNumber": instNum || "",
                "payment.branchNumber": branchNum || "",
                "payment.accountNumber": accNum || "",
                "payment.bankName": bankName || "",
                "payment.accountName": accountName || "",
                "payment.paypalEmail": paypalMail || ""
            }
        }, {
            "new": true
        }).select('name');
        emailPusher({
            subjectText: "New banking information received from IslandStub!",
            htmlBody: parseBankingInfo(instNum, branchNum, accNum, bankName, accountName, paypalMail),
            recipientsEmails: "Garrett <garrett@islandstub.ca>"
        });
        res.json({
            data: updatedDoc
        });
    } catch (error) {
        console.log(error);
    }
};

exports.update_event_data = async (req, res, next) => {
    try {
        let eventName = req.body.eventName;
        let organizerName = req.body.orgName;
        let eventDescription = req.body.eventDescription;
        let eventCountry = req.body.eventCountry;
        let eventVenueName = req.body.eventVenueName;
        let eventAddress = req.body.eventAddress;
        let eventCity = req.body.eventCity;
        let eventState = req.body.eventState;
        let eventZipcode = req.body.eventZipcode;
        let eventTimeStart = req.body.eventTimeStart;
        let eventTimeEnd = req.body.eventTimeEnd;
        let eventTimeOfDayStart = req.body.eventTimeOfDayStart;
        let eventTimeOfDayEnd = req.body.eventTimeOfDayEnd;
        let eventTags = req.body.eventTags.split(',');
        let eventMonth = req.body.eventMonth;
        let eventDay = req.body.eventDay;
        let eventYear = req.body.eventYear;
        let ticketCurrency = req.body.ticketCurrency;
        let eventId = req.body.eventId;
        let rsvpCheck = req.body.rsvpCheck;
        let rsvpLimit = req.body.rsvpLimit;
        let newTickets = JSON.parse(req.body.eventTickets);

        let tagsArr = eventTags.map((item, index) => {
            if (item.length > 0)
                return {
                    name: item.toLowerCase()
                };
        });

        let updateData = {
            $set: {
                eventName: eventName,
                organizerName: organizerName,
                eventDescription: eventDescription.replace(/\n\r?/g, '<br />'),
                eventCountry: eventCountry,
                eventVenueName: eventVenueName,
                "eventAddress.address": eventAddress,
                "eventAddress.city": eventCity,
                "eventAddress.state": eventState,
                "eventAddress.zip": eventZipcode,
                eventTimeStart: eventTimeStart,
                eventTimeEnd: eventTimeEnd,
                eventTimeOfDayStart: eventTimeOfDayStart,
                eventTimeOfDayEnd: eventTimeOfDayEnd,
                eventMonth: eventMonth,
                eventDay: eventDay,
                eventYear: eventYear,
                ticketCurrency: ticketCurrency,
                eventTags: tagsArr,
                isRsvpEnabled: rsvpCheck
            },
            $push: {
                ticketTypes: {
                    $each: newTickets
                }
            },
            $inc: {
                rsvpTotal: rsvpLimit || 0,
                rsvpCount: rsvpLimit || 0
            }
        };
        const updatedDoc = await EventModel.findOneAndUpdate({
                _id: eventId
            }, updateData, {
                "new": true
            }).select('eventName')
            .exec();
        res.json({
            doc: updatedDoc
        });
    } catch (error) {
        console.log(error);
        next(error);
    }
};

exports.user_payment = async (req, res, next) => {
    try {
        let userId = req.body.userId;
        const userDocs = await UserModel.getPaymentInfo(userId);

        res.json({
            docs: userDocs
        });
    } catch (error) {
        next(error);
    }
};


// DEFAULT ERROR ROUTE
exports.error_route = (err, req, res, next) => {
    console.log('error route end', err);
    switch (err.code) {
        case 12000:
            return res.status(400).json({
                error: err
            });
            break;
        case 502:
            return res.status(501).json({
                error: err
            });
        case 406:
            return res.status(406).json({
                error: err
            });
        default:
            return res.status(500).json({
                error: err
            });
    }

};