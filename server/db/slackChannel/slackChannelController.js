var SlackChannels = require('./slackChannelModel');
var Slack = require('slack-client');


module.exports = {

  // Listens to post request from client to add slack channel to database.
  addNewOrganization: function(req, res, next) {
    // if request body doesn't exist, return bad request error to client
    if(!req.body) {
      return res.status(400).json({error:"Bad Request"});
    } else {
      // var slackChannelName = req.body.slackChannelName;
      var slackAPIKey = req.body.slackAPIKey;

      validateSlack(slackAPIKey, function success (client){ // Looks for the slack channel api token in the database to see if it exists already
          
        /** activate bot */
        var Sarge = require('../../bot/sarge.js');
        var bot = new Sarge(client.token); //insert token 

        /** clear channel */
        SlackChannels.remove({}, function(){
          var slackChannelModel = new SlackChannels();
            // slackChannelModel.slackChannelName = slackChannelName;
            slackChannelModel.slackAPIKey = slackAPIKey;
            slackChannelModel.save(function(err) {
              
              if(err) {
                var response = {error: 'Unable to add new slack channel and API key to database'};
                res.status(500).json(response);
              } else {

                var response = {slackDomain: client.team.domain};
                console.log('Successfully saved slack channel and API key to database');
                res.status(201).json(response);
              } //if

            }); //save

        });

        /** update database */
        // SlackChannels.findOne({slackAPIKey: slackAPIKey}, function(err, model) {
          
        //   if(!model) { //model not found, create new one
        //     var slackChannelModel = new SlackChannels();
        //     // slackChannelModel.slackChannelName = slackChannelName;
        //     slackChannelModel.slackAPIKey = slackAPIKey;
        //     slackChannelModel.save(function(err) {
              
        //       if(err) {
        //         var response = {error: 'Unable to add new slack channel and API key to database'};
        //         res.status(500).json(response);
        //       } else {

        //         var response = {slackDomain: client.team.domain};
        //         console.log('Successfully saved slack channel and API key to database');
        //         res.status(201).json(response);
        //       } //if

        //     }); //save
        //   } //if(!model)
        // }); //find slackChannel

      }, function error (err){
      
        var response = {error: 'Unable to add new slack channel and API key to database'};
        res.status(500).json(response);
      
      }); //validateSlack


    } //if(req.body)
  } //addNewOrganization
}; //export


/**
 * Validate the slack api token and trigger callbacks
 * @param  {string} token   used for connecting with Slack
 * @param  {function} success save token to database upon success and if no duplicate is present
 * @param  {function} error   output error
 
 */
function validateSlack(token, success, error){
  var autoReconnect = false, // Automatically reconnect after an error response from Slack.
      autoMark = true, // Automatically mark each message as read after it is processed.
      slackToken = token;
  
  /** @type {Slack} instantiate client connection */
  var client = new Slack(slackToken, autoReconnect, autoMark); //instantiate client connection  

  client.on('open', function(){
    console.log('new organization. connected = ', client.connected)
    success(client);
  }); 

  client.on('error', function(err){
    error(err);
  });


  client.login();

} //validateSlack
