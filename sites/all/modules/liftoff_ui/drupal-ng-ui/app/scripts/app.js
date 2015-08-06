'use strict';


angular.module('drupalNgUiApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ui.router',
  'ui.bootstrap',
  'ui.tree',
  'frapontillo.bootstrap-switch',
  'lk-google-picker'
])
.config(function ($stateProvider, $urlRouterProvider, lkGoogleSettingsProvider) {

  //$httpProvider.defaults.headers.common['X-CSRFToken'] = csrfToken;

  // Google Picker settings
  lkGoogleSettingsProvider.configure({
    apiKey   : 'AIzaSyD9K2ZEikiUmj2ZYW0pTmVpKfBcMMxtH8Y',
    clientId : '845459481400-gku2j6ak4q6mgc2g5v2bpol2hd1h90l3.apps.googleusercontent.com',
    scopes   : ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive.file'],
    //locale   : 'ja',
    //features : [],
    views    : ['DocsView().setIncludeFolders(false)' ] //'DocsView().setMode(google.picker.​ViewId.DOCUMENTS  )'
  });


  //delete $httpProvider.defaults.headers.common['X-Requested-With'];
  $stateProvider
  .state('menu', {
    url: "/menu/:menu_name",
    templateUrl: 'views/menu.html',
    controller: 'MenuCtrl'
  })
  $urlRouterProvider.otherwise('/menu/main-menu');
  /*$stateProvider
    .state('index', {
      url: '/',
      templateUrl: 'views/menu.html',
      controller:'MenuCtrl'
    })*/
})
.run(function ($http) {
  // Set the CSRF token for put/post requests
  $http.get('/services/session/token').success(function(data, status, headers, config) {
    $http.defaults.headers.common['X-CSRF-Token'] = data;
  });
});




