var bodyParser = require('body-parser');
var express = require('express');
var mongoose = require('mongoose');
var SlackDb = require('./db/slackChannel/slackChannelModel');

var app = express();

var router = express.Router();

mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/slackBotWeb');


/////////////////
// Slackclient //
/////////////////


/** NOTE: load Sarge for all Slack organizations */
SlackDb.find({}, function(err, orgs){
  // console.log('test:', orgs)
  for(var key in orgs){
    var org = orgs[key]
    var token = org.slackAPIKey;
    var sarge = require('./bot/sarge.js');
    var bot = new sarge(token); 


  } //for

}); //find


// var Sarge = require('./bot/sarge.js');
// var bot = new Sarge(); //insert token

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
