/* IMPORT NEEDED MODULES */
const FS = require('fs');
const JWT = require('jsonwebtoken');
const Config = require('../utils/Config.js');
const UserModel = require('../models/UserModel');

/* MIDDLEWARE CHECKS */
module.exports = {

    isLoggedIn: (req, res, next) => {
        if (req.session && req.session.isLogged === true) {
            res.locals.isLoggedIn = true;
        } else {
            res.locals.isLoggedIn = false;
        }

        next();
    },
    isElevatedUser: async (req, res, next) => {
        try {
            if (req.session.isLogged !== true || !req.session.userId) {
                return res.render('main/loginUser.ejs', {
                    subMsg: 'Authentication error, only an "event creator" can access this page',
                    pageTitle: 'Login'
                });
            }

            const count = await UserModel.count({
                _id: req.session.userId,
                isLogged: true,
                level: 2
            }).exec();
            if (count === 1) {
                return next();
            }
            throw new Error('Authentication Required');

        } catch (error) {
            res.render('main/loginUser', {
                subMsg: error.message + ', only an "event creator" can access this page',
                pageTitle: 'Login'
            });
        }
    },
    isAdmin: async (req, res, next) => {
        try {
            if (req.session.isLogged !== true || !req.session.userId) {
                return res.redirect('/500');
            }

            const count = await UserModel.count({
                _id: req.session.userId,
                isLogged: true,
                level: 1
            }).exec();
            if (count === 1) {
                return next();
            }
            throw new Error('Authentication Required');

        } catch (error) {
            res.redirect('/500');
        }
    },
    isAuthorizedRequest: async (req, res, next) => {
        try {

            const decoded = JWT.verify(req.headers.authorization, Config.jwtSecret());
            const count = await UserModel.count({
                _id: decoded.userId,
                isLogged: true,
                level: 2
            }).exec();
            if (count === 1) {
                return next();
            }
            throw new Error('Not authorized');
        } catch (error) {
            if (req.xhr)
                return res.json({
                    msg: 'Authentication needed',
                    status: 407,
                    error: error
                });
            else
                return res.redirect('/loginUser');
        }
    }
}