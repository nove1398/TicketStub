//import models needed
const EventModel = require('../models/EventModel.js');
const UserModel = require('../models/UserModel.js');
const BookmarkModel = require('../models/UserBookmarks.js');
const SalesModel = require('../models/SalesModel.js');







exports.admin_home = async (req, res, next) => {
    try {
        const userCount = await UserModel.count({}).exec();
        const eventCount = await EventModel.count({}).exec();
        const eventActiveCount = await EventModel.count({
            isActive: true
        }).exec();
        const mostViewed = await EventModel.getMostViewedEvent();
        const genderStats = await UserModel.getUserGenderStats();
        const orderStats = await SalesModel.getHighestOrders();
        const bestSale = await SalesModel.getHighestSale();
        res.render('admin/index.ejs', {
            pageTitle: 'Admin',
            userName: req.session.name,
            userCount: userCount || 0,
            eventCount: eventCount || 0,
            activeEvents: eventActiveCount || 0,
            popularEvent: mostViewed[0] || 'n/a',
            genderStats: genderStats,
            orderStats: orderStats,
            saleStats: bestSale
        });
    } catch (error) {
        console.log(error);
        res.stats(502).json({
            error: 'Server error'
        });
    }

};

exports.manage_users = async (req, res, next) => {
    try {
        const userCount = await UserModel.count({}).exec();
        const activeUsers = await UserModel.count({
            isActive: true
        }).exec();
        //const genderStats = await UserModel.getUserGenderStats();
        res.render('admin/manageUsers.ejs', {
            pageTitle: 'Admin - User Management',
            userName: req.session.name,
            totalUsers: userCount,
            activeUsers: activeUsers
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Failed to fetch resources'
        });
    }
};

exports.manage_events = async (req, res, next) => {
    try {

        res.render('admin/manageEvents.ejs', {
            pageTitle: 'Admin',
            userName: req.session.name
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Failed to fetch resources'
        });
    }
};