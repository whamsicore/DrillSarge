angular.module('slackBotApp.homepage', [])

  .controller('HomepageCtrl', function ($scope, $rootScope, $http, $state, $timeout) {

    /**
     * Make http post to server database to store slackchannel information
     * @return {http request} save data to database
     */
    $scope.saveSlackInfo = function() {
      // var slackChannelName = $scope.slackChannelName;
      var slackAPIKey = $scope.slackAPIKey;
      if(slackAPIKey) {

        return $http({
          method: 'POST',
          url: '/api/addNewOrganization',
          data: {
            slackAPIKey: slackAPIKey,
            // slackChannelName: slackChannelName, 
          }
        })
        .then(function (resp) {
          $state.go('confirm'); //go to confirm screen

          console.log('Successfully saved to database. resp=', resp)
          $rootScope.slackDomain = resp.data.slackDomain;
        }, function(err) {

          alert("Something is wrong with your API token... ("+err.data.error+")");
          // console.log('Error:', err);
          // console.log('Cannot save to database')
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
