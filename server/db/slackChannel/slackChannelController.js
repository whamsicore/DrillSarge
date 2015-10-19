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

      validateSlack(slackAPIKey, function success (){ // Looks for the slack channel api token in the database to see if it exists already
          SlackChannels.findOne({slackAPIKey: slackAPIKey}, function(err, model) {
            
            if(!model) { //model not found, create new one
              var slackChannelModel = new SlackChannels();
              // slackChannelModel.slackChannelName = slackChannelName;
              slackChannelModel.slackAPIKey = slackAPIKey;
              slackChannelModel.save(function(err) {
                if(err) {
                  var response = {error: 'Unable to add new slack channel and API key to database'};
                  console.log(response.error);
                  console.log('Error:', err);
                  res.status(500).json(response);
                } else {
                  console.log('Successfully saved slack channel and API key to database');
                  res.status(201).send();
                }
              }); //save
            } //if(!model)
          }); //find slackChannel

      }, function error (){
        console.log("Error when connecting with Slack: ", err)
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
      slackToken = token || 'xoxb-12608710676-WToSXWoZrkJayDKbFRAs2JpL';
  
  /** @type {Slack} instantiate client connection */
  var client = new Slack(slackToken, autoReconnect, autoMark); //instantiate client connection  

  client.on('open', function(){
    console.log('new organization. connected = ', client.connected)
    success();
  }); 

  client.on('error', function(err){
    error(err);
  });


  client.login();

} //validateSlack
