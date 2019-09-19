const Mongoose = require('mongoose');
const Schema = Mongoose.Schema({
    name:{
        first: {type: String },
        last: {type: String}
    },
    email: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    gender: {
        type: String,
        uppercase: false,
        enum: ['m','f']
    },
    isLogged: { 
        type: Boolean,
        required: true
    },
    isActive: { 
        type: Boolean,
        default: true
    },
    isReset:{
        type: Boolean,
        default: false
    },
    level: {
        type: Number,
        required: true,
        min: 1,
        max: 4,
        default: 3
    },
    salt: {
        type: String,
        required: true
    },
    hash: {
        type: String,
        required: true
    },
    termsAgreement:{
        type: Boolean
    },
    payment:{
        institutionNumber: String,
        branchNumber: String,
        accountNumber: String,
        bankName: String,
        accountName: String,
        paypalEmail: String
    }
});

Schema
.virtual('name.full')
.get(function () {
  return this.name.first + ' ' + this.name.last;
});

Schema.statics.getUserGenderStats = function(needle){
    return this.model('User')
                .aggregate([
                    {
                        $group:{
                            _id:{ 
                                genderType: "$gender"
                                 },
                            count: { "$sum": 1 } 
                        }
                    }
                ])
                .exec();
}

Schema.statics.getPaymentInfo = function(searchId){
    return this.model('User')
                .findOne({_id:searchId})
                .select('payment')
                .exec();
}

Schema.statics.findUser = function(needle,searchId){
    let sort = {"name.last": -1 };
    let lastId = searchId || '';
    let query =  {$or:[{ 
                        "name.first" : { $regex: new RegExp(needle)}
                        },
                        { 
                            "name.last" : { $regex: new RegExp(needle)}
                        },
                    ]};
    let query2 = {$or:[{ 
                        "name.first" : { $regex: new RegExp(needle)}
                        },
                        { 
                            "name.last" : { $regex: new RegExp(needle)}
                        },
                    ],
                    _id: { "$gt": lastId }
                };
    return this.model('User')
                .find(lastId!==''?query2:query)
                .select('isActive level name gender email')
                .limit(20)
                .sort(sort)
                .exec();
}
module.exports = Mongoose.model('User', Schema, 'Users');