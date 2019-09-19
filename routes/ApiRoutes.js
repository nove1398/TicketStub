/* IMPORT NEEDED MODULES */
const Express = require('express');
const Router = Express.Router();
const ApiController = require('../controllers/ApiController');
const {
    isLoggedIn,
    isElevatedUser,
    isAuthorizedRequest
} = require('../middleware/Middleware');


//API ROUTES
Router.get('/getevents', ApiController.get_all_events, ApiController.error_route);
Router.post('/rsvp-event', ApiController.rsvp_for_event, ApiController.error_route);
Router.post('/checkout-tickets', ApiController.checkout_tickets, ApiController.error_route);
Router.get('/get-event-data/:id', ApiController.get_event_data, ApiController.error_route);
Router.post('/addbookmark', ApiController.save_bookmark, ApiController.error_route);
Router.post('/removebookmark', ApiController.delete_bookmark);
Router.post('/search-events', ApiController.search_for_event, ApiController.error_route);
Router.post('/new-event', isLoggedIn, isAuthorizedRequest, ApiController.file_handler, ApiController.new_event, ApiController.error_route);
Router.post('/checkorder', ApiController.check_order_number);
Router.post('/removeuser', ApiController.remove_user, ApiController.error_route);
Router.post('/disableuser', ApiController.disable_user, ApiController.error_route);
Router.get(['/searchevent/:term/:lastId', '/searchevent/:term'], ApiController.admin_event_search, ApiController.error_route);
Router.get(['/searchuser/:name/:lastId', '/searchuser/:name/'], ApiController.search_user);
Router.post('/getuser', ApiController.user_payment);
Router.post('/disable-event', ApiController.disable_event);
Router.post('/delete-event', isLoggedIn, isAuthorizedRequest, ApiController.delete_event);
Router.post('/resetpassword', ApiController.reset_password);
Router.post('/resetpasswordconfirm', ApiController.confirm_reset_password);
Router.post('/updatebank', isLoggedIn, ApiController.update_bank);
Router.post('/creator/update-event', isLoggedIn, ApiController.file_handler, ApiController.update_event_data);
Router.all('/*', ApiController.error_route);

module.exports = Router;