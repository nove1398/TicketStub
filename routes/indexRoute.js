/*  IMPORT NEEDED MODULES */
const IndexController = require('../controllers/IndexController.js');
const Express = require('express');
const Router = Express.Router();
const {
    isLoggedIn,
    isElevatedUser,
    isAuthorizedRequest
} = require('../middleware/Middleware.js');



/* ROUTES FOR PAGES */
Router.get('/home', isLoggedIn, IndexController.home);
Router.get(['/search/:term/:country', '/search/:term', '/search'], isLoggedIn, IndexController.search_page);
Router.get('/viewEvent/:id', isLoggedIn, IndexController.view_event_page);
Router.get('/profile', isLoggedIn, IndexController.user_profile_page);
Router.get('/manage/:id', isLoggedIn, isElevatedUser, IndexController.manage_event);
Router.get('/contactUs', isLoggedIn, IndexController.contact_us_page);
Router.get('/aboutUs', isLoggedIn, IndexController.about_us_page);
Router.get('/creator', isLoggedIn, isElevatedUser, IndexController.create_event_page);
Router.get('/register', isLoggedIn, IndexController.register_page);
Router.get('/loginUser', isLoggedIn, IndexController.login_user_page);
Router.get('/checkorder', isLoggedIn, IndexController.ticket_checker);
Router.get('/resetPassword', isLoggedIn, IndexController.reset_password);
Router.get('/confirmReset/:id', isLoggedIn, IndexController.confirm_reset);
Router.get('/edit/:id', isLoggedIn, isElevatedUser, IndexController.edit_event);
Router.get('/sellerinfo', isLoggedIn, IndexController.seller_update);
Router.get('/terms', isLoggedIn, IndexController.terms_page);
Router.get('/refund', isLoggedIn, IndexController.refund_page);
Router.get('/privacy', isLoggedIn, IndexController.privacy_page);
Router.get('/500', isLoggedIn, IndexController.redirect_500);
Router.get('/', isLoggedIn, IndexController.redirect_home);


module.exports = Router;