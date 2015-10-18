angular.module('slackBotApp.homepage', [])

  .controller('HomepageCtrl', function ($scope, $rootScope, $http, $state) {

    /**
     * Make http post to server database to store slackchannel information
     * @return {http request} save data to database
     */
    $scope.saveSlackInfo = function() {
      var slackChannelName = $scope.slackChannelName;
      var slackAPIKey = $scope.slackAPIKey;
      if(slackChannelName && slackAPIKey) {
        $state.go('confirm'); //go to confirm screen

        return $http({
          method: 'POST',
          url: '/api/addNewOrganization',
          data: {slackChannelName: slackChannelName, slackAPIKey: slackAPIKey}
        })
        .then(function (resp) {

          console.log('Successfully saved to database')
        }, function(err) {
          console.log('Error:', err);
          console.log('Cannot save to database')
        });
      }
    }



  }) //HomepageCtrl

  .directive('autofocus', ['$timeout', function($timeout) {
    return {
      restrict: 'A',
      link : function($scope, $element) {
        $timeout(function() {
          $element[0].focus();
        });
      }
    }
  }]);


//leave empty line
