const Express  = require('express');
const Router = Express.Router();
const AuthController = require('../controllers/AuthController.js');

Router.post('/login', AuthController.login_user,AuthController.login_userModel_error);
Router.post('/register', AuthController.register_userModel, AuthController.register_userModel_error);
Router.get('/logout', AuthController.logout_user);
Router.all('/*', AuthController.default_route);

module.exports = Router;