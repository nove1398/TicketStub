const Express  = require('express');
const Router = Express.Router();
const AdminController = require('../controllers/AdminController.js');
const Middleware = require('../middleware/Middleware.js');


Router.get('/home', Middleware.isAdmin, AdminController.admin_home);
Router.get('/manageUsers', Middleware.isAdmin, AdminController.manage_users);
Router.get('/manageEvents', Middleware.isAdmin, AdminController.manage_events);
Router.get('/', Middleware.isAdmin, AdminController.admin_home);
module.exports = Router;