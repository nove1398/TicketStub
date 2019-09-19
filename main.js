const FS = require('fs');
const Helmet = require('helmet');
const Express = require('express');
const App = Express();
const HTTP = require('http');
const httpsOptions = {
    key: FS.readFileSync("/home/nove/keys/privkey.pem"),
    cert: FS.readFileSync("/home/nove/keys/fullchain.pem")
};
const Server = HTTP.createServer(App);
const IO = require('socket.io')(Server);
const BodyParser = require('body-parser');
const Mongoose = require('mongoose');
const Session = require('express-session');
const MongoStore = require('connect-mongo')(Session);
Server.listen(5009);

Mongoose.set('useCreateIndex', true);
Mongoose.set('useFindAndModify', false);
Mongoose.connect('mongodb://localhost:27017/islandstubber', {
    useNewUrlParser: true
});

Mongoose.connection.once('open', () => {
    console.log('COnnected to db');
});

App.use(Helmet());
App.use(BodyParser.urlencoded({
    extended: true
}));
App.use(BodyParser.json());
App.use(function (req, res, next) {
    res.header('X-Powered-By', "null");
    res.header('Access-Control-Allow-Origin', "islandstub.ca");
    res.header('Access-Control-Allow-Methods', "GET,PUT,POST,DELETE");
    res.header('Access-Control-Allow-Headers', "Content-type");
    next();
});
App.use(Session({
    secret: 'Azp-Zfgt$jkLkopAzz_',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false
    },
    store: new MongoStore({
        mongooseConnection: Mongoose.connection,
        ttl: 60 * 1 * 60 //60 = 1 minute
    })
}));

App.set('view engine', 'ejs');
App.set('view engine', 'pug');
App.use('/js', Express.static(__dirname + '/public/javascript'));
App.use('/img', Express.static(__dirname + '/public/images'));
App.use('/css', Express.static(__dirname + '/public/css'));
App.use('/flyers', Express.static(__dirname + '/public/eventFlyers'));
App.use('/vouchers', Express.static(__dirname + '/public/userReceipts'));
App.use('/', require('./routes/indexRoute.js'));
App.use('/api', require('./routes/ApiRoutes.js'));
App.use('/auth', require('./routes/AuthRoute.js'));
App.use('/admins', require('./routes/AdminRoutes.js'));