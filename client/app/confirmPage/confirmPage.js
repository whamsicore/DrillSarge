angular.module('slackBotApp.confirmPage', [])

.controller('confirmPageCtrl', function ($scope, $rootScope, $state, $localStorage, $http) {
  $scope.slackChannelName = $localStorage.slackChannelNameStored;

  $scope.goToHomepage = function() {
    console.log('clicked on button')
    $state.go('homepage');
  }
});

//leave empty line
