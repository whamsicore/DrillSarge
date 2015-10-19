var bodyParser = require('body-parser');
var express = require('express');
var mongoose = require('mongoose');

var app = express();

var router = express.Router();
mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/slackBotWeb');


/////////////////
// Slackclient //
/////////////////

// var sarge = require('./bot/sarge.js');
// var bot = new sarge(); //insert token
// for testing, create a single bot
// bot.addBot(); 

/**************/


app.use(express.static(__dirname + '/../client'));

app.get('/client', function(req, res) {
  res.render('index.html');
});

// Body-parsing middleware to populate req.body.
app.use(bodyParser.json());

app.use('/api', router);
require('./db/slackChannel/slackChannelRoutes')(router);

app.listen((process.env.PORT || 5000), function(){
  console.log('Sarge is running on port 5000');
});

module.exports = app;
