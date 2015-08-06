'use strict';
angular.module('app.tree')

.directive('nodeTitle', function() {
  return {
    restrict: 'A',
    templateUrl: 'views/nodeTitle.html',
    link: function($scope, $element, $attrs) {
      $scope.titleEditBegin = function() {
        $scope.node.editing = true;
      }
      $scope.titleEditDone = function() {
        $scope.node.editing = false;
      }
    }
  }
})


.directive('nodeType', function() {
  return {
    restrict: 'A',
    templateUrl: 'views/nodeType.html',
    link: function($scope, $element, $attrs) {
      angular.forEach($scope.types, function(item) {
        if (item.key === $scope.node.type) {
          $scope.type = item;
        }
      }); 
    }
  }
})

.directive('nodeUser', function() {
  return {
    restrict: 'A',
    templateUrl: 'views/nodeUser.html',
    link: function($scope, $element, $attrs) {
      $scope.userChange = function(user) {
        $scope.node.user = user;
      }
    }
  }
})

.directive('nodeStatus', function() {
  return {
    restrict: 'A',
    templateUrl: 'views/nodeStatus.html',
    link: function($scope, $element, $attrs) {
      $scope.setStatus = function(key) {
        var activeStatus = null;
        angular.forEach($scope.statuses, function(item) {
          if ($scope.node.status === item.key) {
            $scope.status = item;
          }
        });
      }
      $scope.setStatus();
      $scope.statusChange = function(status) {
        $scope.node.status = status;
        $scope.setStatus();
      }
      $scope.statusIncrease = function() {
        var activeStatus = null;
        angular.forEach($scope.statuses, function(item, key) {
          if ($scope.node.status === item.key) {
            activeStatus = $scope.statuses[key+1];
          }
        });
        console.log(activeStatus);
        if (activeStatus != undefined) {
          $scope.status = activeStatus;
          $scope.node.status = activeStatus.key;
        }
      }
    }
  }
})



.directive('nodeNew', function() {
  return {
    restrict: 'A',
    templateUrl: 'views/nodeNew.html',
    //scope: {
    //  title: '=',
    //},
    link: function($scope, $element, $attrs) {
    }
  }
})

.directive('nodeDelete', function() {
  return {
    restrict: 'A',
    templateUrl: 'views/nodeDelete.html',
    link: function($scope, $element, $attrs) {
    }
  }
})
