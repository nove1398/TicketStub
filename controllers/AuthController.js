const {isAlphaNum,isAlpha,isNumeric,isValidEmail,isName} = require('../utils/NodeUtils.js');
const Config = require('../utils/Config.js');
const JWT = require('jsonwebtoken');
const Bcrypt = require('bcryptjs');
const UserModel = require('../models/UserModel.js');
const NodeMailer = require('nodemailer');

exports.login_user = async (req,res,next)=>{
    try{
        let pass = req.body.pass.trim();
        let mail = req.body.mail.trim();
    
        const doc = await UserModel.findOne({email: mail,isActive:true});
            if(!doc){
                let customError = new Error('Authentication issue');
                customError.message = 'Invalid details provided, try again';
                customError.code = 401;
                throw customError;
            }
    
               if(Bcrypt.compareSync(pass, doc.hash)){
                    const token = JWT.sign({
                                                userId: doc._id,
                                                userType: doc.level
                                            },
                                            Config.jwtSecret(),
                                            {
                                                expiresIn: "1h"
                                            });
                    req.session.isLogged = true;
                    req.session.userId = doc._id;
                    req.session.userMail= doc.email;
                    req.session.level= doc.level;
                    req.session.name = doc.name;
                    await UserModel.findOneAndUpdate({_id:doc._id},{isLogged:true});
                    res.json({msg: 'logged in successfully',redirect: '/home', token:token});
                }else{
                    let customError = new Error('Authentication issue');
                    customError.message = 'Invalid details provided, try again';
                    customError.code = 401;
                    throw customError;
                }
    }catch(error){
        next(error);
    }
};
exports.login_userModel_error = (err,req,res,next)=>{
    res.status(405).json({ msg: err.message});
};

exports.register_userModel =  async (req,res,next)=>{
    try{
        let pass = req.body.pass.trim();
        let mail = req.body.mail.trim();
        let fname = req.body.fname.trim();
        let lname = req.body.lname.trim();
        let gender = req.body.gender.trim();
        let userType = req.body.userType.trim();
        let termsAgreement = req.body.terms;
        let errors = [];

        isName(fname,errors,"first name is not a valid input");
        isName(lname,errors,"last name is not a valid input");
        isAlpha(gender,errors,"gender is not a valid input");
        isNumeric(userType,errors,"is not a valid number");
        isValidEmail(mail,errors,"email is not a valid email");

        if(errors.length > 0){
            const customError = new Error('Validation error');
            customError.code = 12000;
            customError.msg = errors;
            throw customError;
        }
         if(userType < 2 || userType.length < 1) userType = 3;
        const User = new UserModel();
        User.email = mail;
        User.name.first = fname.toLowerCase();
        User.name.last = lname.toLowerCase();
        User.isLogged = false;
        User.level = userType; 
        User.gender = gender;
        User.termsAgreement = termsAgreement;
        var salt = await Bcrypt.genSaltSync(10);
        var hash = await Bcrypt.hashSync(pass, salt);
        User.hash = hash;
        User.salt = salt;
        await User.save();
        let transporter = NodeMailer.createTransport(
            {
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
            },
            {
                // sender info
                from: 'IslandStub inc. <support@islandstub.ca>'
            });
            let message = {
                // Comma separated list of recipients
                to: `IslandStub inc. <support@islandstub.ca>`,
                // Subject of the message
                subject: `New User Registered`,
                //Body of document
                html: `Hey, <b>${fname + ' ' + lname}</b> has registered! 
                        <br>
                        Email: ${mail}
                        <br>
                      IslandStub inc.&copy; ${new Date().getFullYear()}` 
            };
            transporter.sendMail(message);
        res.json({msg:'Sucessfully registered'});
    }catch(err){
       
        next(err);
    }
};
exports.register_userModel_error = (err,req,res,next)=>{
    const customError = new Error();
    customError.code = err.code;
    customError.status = 403;
    console.log(err);
    switch(err.code){
        case 11000:
           customError.msg = 'Email already registered';
        break;
        case 12000:
            customError.msg = err.msg;
            break;
        default:
            customError.msg = "Something went really wrong";
        break;
    }

    res.status(403).json({error:customError});
};

exports.logout_user = (req,res)=>{ 
    UserModel.findOneAndUpdate({_id:req.session.userId},{isLogged:false}, (err,doc)=>{
        if(err){
            console.log(err);
            req.session.destroy();
            return res.redirect('/main/loginuser');
        }
        req.session.destroy();
        res.cookie("ioid", "", { expires: new Date(0),domain:'138.197.174.187', path: '/' });
        res.redirect('/home');
    });  
};

exports.default_route = (req,res)=>{
    res.status(500).json({msg:'No route found for request'});
};