'use strict';

angular.module('drupalNgUiApp')
.factory('User', function($resource) {
  return $resource('/services/rest/user', null);
});
