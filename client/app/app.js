// Bootstrap the app and controllers
angular.module('slackBotApp', [
  'slackBotApp.homepage',
  'slackBotApp.confirmPage',
  'ui.router',
  'ngMaterial',
  'ngStorage'
])

// config the app states
.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('homepage', {
      url: '/',
      templateUrl: 'app/homepage/homepage.html',
      controller: 'HomepageCtrl'
    })
    .state('confirm', {
      url: '/confirm',
      templateUrl: 'app/confirmPage/confirmPage.html',
      controller: 'confirmPageCtrl'
    });

    $urlRouterProvider.otherwise('/');
});
