'use strict';

angular.module('drupalNgUiApp')
.factory('menuTree', ['$resource', function($resource) {
return $resource('/json/:id', null,
    {
        'update': { method:'PUT' }
    });
}]);
