angular.module('slackBotApp.confirmPage', [])

.controller('confirmPageCtrl', function ($scope, $rootScope, $state, $localStorage, $http, $window) {
  $scope.slackChannelName = $localStorage.slackChannelNameStored;

  $scope.goToHomepage = function() {
    // console.log('clicked on button')
    //betabootcamp
    if($rootScope.slackDomain){
      var url = "https://"+ $rootScope.slackDomain +".slack.com/messages/general";
      $window.open(url);
      
    }else{
      alert('Please go back and re-enter your API token. Thank you.');
    } //if
  }  //goToHomepage
});

//leave empty line
