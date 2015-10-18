var SlackChannels = require('./slackChannelModel');

module.exports = {

  // Listens to post request from client to add slack channel to database.
  addNewOrganization: function(req, res, next) {
    // if request body doesn't exist, return bad request error to client
    if(!req.body) {
      return res.status(400).json({error:"Bad Request"});
    } else {
      var slackChannelName = req.body.slackChannelName;
      var slackAPIKey = req.body.slackAPIKey;
      // If both slack channel name and slackAPI key exists,
      if(slackChannelName && slackAPIKey) {
        // Looks for the slack channel name in the database to see if it exists already
        SlackChannels.findOne({slackChannelName: slackChannelName}, function(err, model) {
          // If it exists, overwrite the previous API key and save new API key
          if(model) {
            model.slackAPIKey = slackAPIKey;
            model.save(function(err) {
              if(err) {
                var response = {error: 'Unable to save API Key'};
                console.log(response.error);
                console.log('Error:', err);
                res.status(500).json(response);
              } else {
                console.log('Successfully updated slackAPIKey for existing Slack Channel');
                res.status(201).send();
              }
            });
          } else {
            // If the slack channel name doesn't exist in the database, create a new model and save slackchannel name and slack API key to the database.
            var slackChannelModel = new SlackChannels();
            slackChannelModel.slackChannelName = slackChannelName;
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
            });
          }
        })
      }
    }
  }
};

// leave extra line at end
