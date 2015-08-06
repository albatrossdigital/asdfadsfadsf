'use strict';

angular.module('drupalNgUiApp')
.factory('Menu', function($resource) {
  return $resource('/services/rest/liftoff_ui/:mid', null);
});
