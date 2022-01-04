require('./models/db');

const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const bodyparser = require('body-parser');

const session = require('express-session');
var cookieParser = require('cookie-parser');

const employeeController = require('./controllers/employeeController');

var app = express();
app.use(bodyparser.urlencoded({
    extended: true
}));
app.use(bodyparser.json());
app.set('views', path.join(__dirname, '/views/'));
app.engine('hbs', exphbs({ extname: 'hbs', defaultLayout: 'mainLayout', layoutsDir: __dirname + '/views/layouts/' }));
app.set('view engine', 'hbs');

app.use(cookieParser());
app.use(session({secret: "Shh, its a secret!"}));

app.listen(8080, () => {
    console.log('Express server started at port : 8080');
});

app.use('/uploads', express.static('uploads'));
app.use('/', employeeController);