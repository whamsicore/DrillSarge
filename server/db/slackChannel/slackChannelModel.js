var mongoose = require('mongoose');

// Schema defined to store slack channel name and slack api key
var SlackChannelSchema = new mongoose.Schema({
  slackChannelName: String,
  slackAPIKey: String
})

module.exports = mongoose.model('SlackChannel', SlackChannelSchema);
