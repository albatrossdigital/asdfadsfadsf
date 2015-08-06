'use strict';
angular.module('drupalNgUiApp')

.directive('menuNodeTitle', function($timeout) {
  return {
    restrict: 'A',
    templateUrl: 'views/menuNodeTitle.html',
    link: function($scope, $element, $attrs) {
      $scope.titleEditBegin = function(id) {
        $scope.node.editing = true;
        $timeout(function () {
          angular.element('#title-'+id).last().focus();
        }, 10);
      }
      $scope.titleEditDone = function() {
        $scope.node.editing = false;
        $scope.itemSave($scope.node);
      }
    }
  }
})




.directive('menuNodeType', function($modal, Menu) {
  return {
    restrict: 'A',
    templateUrl: 'views/menuNodeType.html',
    link: function($scope, $element, $attrs) {
      var updateType = function() {
        angular.forEach($scope.types, function(item) {
          if (item.key === $scope.node.type) {
            $scope.type = item;
          }
        });
      }
      updateType();

      $scope.size = $attrs.size != undefined ? $attrs.size : 'xs';
      $scope.dropdown = $attrs.typeDropdown != undefined ? true : false;

      $scope.typeClick = function(node) {
        if (!$scope.dropdown) {
          $scope.openModal(node, $scope.types);
        }
      }

      $scope.typeSelect = function(type) {
        $scope.node.type = type;
        updateType();
        // @todo: change type on backend?
        // @todo: confirm?
      }

      $scope.openModal = function(node, types) {
        node.linkUrl = node.linkUrl == undefined ? 'http://' : node.linkUrl;
        node.gdriveFile = $scope.node.gdriveFile != undefined ? $scope.node.gdriveFile : [];
        $scope.node = node;
        $modal.open({
          templateUrl: 'views/menuNodeModal.html',
          //size: 'sm',
          //scope: $scope,
          controller: function ($scope, $modalInstance, $log) {
            $scope.types = types;
            $scope.node = node;
            $scope.submit = function () {
              //$log.log('Submiting user info.');
              //$log.log(JSON.stringify(item));\
              $modalInstance.close($scope.node);
            }
            $scope.cancel = function () {
              $modalInstance.dismiss('cancel');
            };


            $scope.import = function (file, xpath) {
              console.log($scope.node);
              var item = {
                id: $scope.node.id, 
                'import': file,
                xpath: xpath
              }
              $scope.importing = -1;
              Menu.save(item, function(data) {
                $scope.importing = 1;
                // @todo: something w response
              });
            };

            $scope.$watch('node.gdriveFile', function(newValue, oldValue) {
              console.log(newValue);
            });

            /*$scope.$watch('node.type', function(newValue, oldValue) {
              if (confirm('Changing the item type may result in lost data. Are you sure you want to do this?')) {
                // @todo: save
              }
              else {
                $scope.type = oldValue;
              }
            });*/
          },
          resolve: {
            item: function () {
              return $scope.item;
            }
          }
        }).result.then(function (newNode) {
          $scope.node = newNode;
          updateType();
          $scope.itemSave(newNode);
        }, function () {
          // Cancel: nothing happens
        });
      };
    }
  }
})

.directive('menuNodeUser', function() {
  return {
    restrict: 'A',
    templateUrl: 'views/menuNodeUser.html',
    link: function($scope, $element, $attrs) {
      angular.forEach($scope.users, function(user) {
        if (user.uid == $scope.node.user) {
          $scope.name = user.name;
        }
      });
      
      $scope.userChange = function(user) {
        $scope.node.user = user.id;
        $scope.name = user.name;
        $scope.itemSaveProp($scope.node.id, 'user', $scope.node.user);   
      }
    }
  }
})




.directive('menuNodeStatus', function() {
  return {
    restrict: 'A',
    templateUrl: 'views/menuNodeStatus.html',
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
        $scope.itemSaveProp($scope.node.id, 'status', $scope.node.status);
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
          $scope.itemSaveProp($scope.node.id, 'status', $scope.node.status);
        }
      }
    }
  }
})



.directive('menuNodeNew', function() {
  return {
    restrict: 'A',
    templateUrl: 'views/menuNodeNew.html',
    //scope: {
    //  title: '=',
    //},
    link: function($scope, $element, $attrs) {
    }
  }
})

.directive('menuNodeDelete', function() {
  return {
    restrict: 'A',
    templateUrl: 'views/menuNodeDelete.html',
    link: function($scope, $element, $attrs) {
    }
  }
})
