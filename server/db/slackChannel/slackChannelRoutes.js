var slackChannelController = require('./slackChannelController');

module.exports = function(router){
  router.post('/addNewOrganization', slackChannelController.addNewOrganization);
};
