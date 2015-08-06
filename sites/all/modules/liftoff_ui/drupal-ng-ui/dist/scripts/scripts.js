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
]).config([
  '$stateProvider',
  '$urlRouterProvider',
  'lkGoogleSettingsProvider',
  function ($stateProvider, $urlRouterProvider, lkGoogleSettingsProvider) {
    //$httpProvider.defaults.headers.common['X-CSRFToken'] = csrfToken;
    // Google Picker settings
    lkGoogleSettingsProvider.configure({
      apiKey: 'AIzaSyD9K2ZEikiUmj2ZYW0pTmVpKfBcMMxtH8Y',
      clientId: '845459481400-gku2j6ak4q6mgc2g5v2bpol2hd1h90l3.apps.googleusercontent.com',
      scopes: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive.file'
      ],
      views: ['DocsView().setIncludeFolders(false)']
    });
    //delete $httpProvider.defaults.headers.common['X-Requested-With'];
    $stateProvider.state('menu', {
      url: '/menu/:menu_name',
      templateUrl: 'views/menu.html',
      controller: 'MenuCtrl'
    });
    $urlRouterProvider.otherwise('/menu/main-menu');  /*$stateProvider
    .state('index', {
      url: '/',
      templateUrl: 'views/menu.html',
      controller:'MenuCtrl'
    })*/
  }
]).run([
  '$http',
  function ($http) {
    // Set the CSRF token for put/post requests
    $http.get('/services/session/token').success(function (data, status, headers, config) {
      $http.defaults.headers.common['X-CSRF-Token'] = data;
    });
  }
]);
'use strict';
angular.module('drupalNgUiApp').factory('Menu', [
  '$resource',
  function ($resource) {
    return $resource('/services/rest/liftoff_ui/:mid', null);
  }
]);
'use strict';
angular.module('drupalNgUiApp').factory('User', [
  '$resource',
  function ($resource) {
    return $resource('/services/rest/user', null);
  }
]);
'use strict';
angular.module('drupalNgUiApp').controller('MainCtrl', [
  '$scope',
  function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  }
]);
'use strict';
angular.module('drupalNgUiApp').controller('MenuCtrl', [
  '$stateParams',
  '$scope',
  '$filter',
  '$http',
  'Menu',
  'User',
  '$timeout',
  '$modal',
  function ($stateParams, $scope, $filter, $http, Menu, User, $timeout, $modal) {
    $scope.menuName = $stateParams.menuName != undefined ? $stateParams.menuName : 'main-menu';
    $scope.treeOptions = {
      dropped: function (event) {
        var siblings = event.dest.nodesScope.$modelValue;
        var index = event.dest.index;
        var nodeData = siblings[index];
        var $parent = event.dest.nodesScope.depth() > 0 ? event.dest.nodesScope.$parent.$modelValue : {
            id: 0,
            weight: 0
          };
        nodeData.parent = $parent.id;
        if (siblings.length == 1) {
          nodeData.weight = $parent.weight;
        } else if (index == 0) {
          nodeData.weight = parseInt(siblings[1].weight) - 3;
        } else if (index >= siblings.length - 1) {
          nodeData.weight = parseInt(siblings[siblings.length - 1].weight) + 3;
        } else if (parseInt(siblings[index + 1].weight) - parseInt(siblings[index - 1].weight) > 1) {
          nodeData.weight = parseInt(siblings[index - 1].weight) + 1;
        } else {
          var weight = parseInt(siblings[index - 1].weight) + 5;
          nodeData.weight = weight;
          for (var i = index + 1; i < siblings.length; i++) {
            weight += 5;
            siblings[i].weight = weight;
            console.log(weight);
          }
        }
        $scope.itemSave({
          id: nodeData.id,
          parent: nodeData.parent,
          weight: nodeData.weight
        });
        console.log(nodeData.weight);
      }
    };
    $scope.remove = function (scope) {
      scope.remove();
    };
    $scope.itemNew = function (scope, type) {
      var nodeData = scope.$modelValue;
      if (nodeData == undefined) {
        nodeData = { nodes: $scope.data };
      }
      nodeData.nodes.push({
        id: 'new',
        title: '',
        menu_name: $scope.menuName,
        type: type,
        parent: nodeData.id,
        weight: !nodeData.nodes.length ? nodeData.weight : parseInt(nodeData.nodes[nodeData.nodes.length - 1].weight) + 5,
        user: $scope.user,
        editing: true,
        status: 'draft',
        nodes: []
      });
      $timeout(function () {
        angular.element('#title-new').last().focus();
      }, 10);
      if (type == 'link' || type == 'gdrive') {
        $scope.open(scope);
      }
    };
    $scope.itemSave = function (item) {
      var menuItem = Menu.save(item, function (data) {
          if (item.id == undefined || item.id == 'new') {
            item.id = data.id;
            console.log(item);
            console.log(data);
          }
        });
    };
    $scope.itemSaveProp = function (id, prop, val) {
      var data = { 'id': id };
      data[prop] = val;
      $scope.itemSave(data);
    };
    $scope.visible = function (item) {
      if ($scope.query && $scope.query.length > 0 && item.title.indexOf($scope.query) == -1) {
        return false;
      }
      return true;
    };
    $scope.data = Menu.query({ menu_name: $scope.menuName });
    $scope.users = User.query();
    $scope.types = [
      {
        name: 'Overview',
        key: 'overview',
        icon: 'list',
        color: 'rgb(77, 195, 255)'
      },
      {
        name: 'Page',
        key: 'page',
        icon: 'file',
        color: 'rgb(188, 133, 230)'
      },
      {
        name: 'Event',
        key: 'event',
        icon: 'calendar',
        color: 'rgb(223, 123, 170)'
      },
      {
        name: 'Link',
        key: 'link',
        icon: 'link',
        color: 'rgb(246, 141, 56)'
      },
      {
        name: 'Google Drive',
        key: 'gdrive',
        icon: 'cloud-download',
        color: 'rgb(178, 118, 54)'
      }
    ];
    $scope.statuses = [
      {
        name: 'Draft',
        key: 'draft',
        'class': 'danger'
      },
      {
        name: 'Needs Review',
        key: 'needs_review',
        'class': 'warning'
      },
      {
        name: 'Approved',
        key: 'published',
        'class': 'success'
      }
    ];
    $scope.user = 1;
  }
]);
'use strict';
angular.module('drupalNgUiApp').directive('menuNodeTitle', [
  '$timeout',
  function ($timeout) {
    return {
      restrict: 'A',
      templateUrl: 'views/menuNodeTitle.html',
      link: function ($scope, $element, $attrs) {
        $scope.titleEditBegin = function (id) {
          $scope.node.editing = true;
          $timeout(function () {
            angular.element('#title-' + id).last().focus();
          }, 10);
        };
        $scope.titleEditDone = function () {
          $scope.node.editing = false;
          $scope.itemSave($scope.node);
        };
      }
    };
  }
]).directive('menuNodeType', [
  '$modal',
  'Menu',
  function ($modal, Menu) {
    return {
      restrict: 'A',
      templateUrl: 'views/menuNodeType.html',
      link: function ($scope, $element, $attrs) {
        var updateType = function () {
          angular.forEach($scope.types, function (item) {
            if (item.key === $scope.node.type) {
              $scope.type = item;
            }
          });
        };
        updateType();
        $scope.size = $attrs.size != undefined ? $attrs.size : 'xs';
        $scope.dropdown = $attrs.typeDropdown != undefined ? true : false;
        $scope.typeClick = function (node) {
          if (!$scope.dropdown) {
            $scope.openModal(node, $scope.types);
          }
        };
        $scope.typeSelect = function (type) {
          $scope.node.type = type;
          updateType();  // @todo: change type on backend?
                         // @todo: confirm?
        };
        $scope.openModal = function (node, types) {
          node.linkUrl = node.linkUrl == undefined ? 'http://' : node.linkUrl;
          node.gdriveFile = $scope.node.gdriveFile != undefined ? $scope.node.gdriveFile : [];
          $scope.node = node;
          $modal.open({
            templateUrl: 'views/menuNodeModal.html',
            controller: [
              '$scope',
              '$modalInstance',
              '$log',
              function ($scope, $modalInstance, $log) {
                $scope.types = types;
                $scope.node = node;
                $scope.submit = function () {
                  //$log.log('Submiting user info.');
                  //$log.log(JSON.stringify(item));\
                  $modalInstance.close($scope.node);
                };
                $scope.cancel = function () {
                  $modalInstance.dismiss('cancel');
                };
                $scope.import = function (file, xpath) {
                  console.log($scope.node);
                  var item = {
                      id: $scope.node.id,
                      'import': file,
                      xpath: xpath
                    };
                  $scope.importing = -1;
                  Menu.save(item, function (data) {
                    $scope.importing = 1;  // @todo: something w response
                  });
                };
                $scope.$watch('node.gdriveFile', function (newValue, oldValue) {
                  console.log(newValue);
                });  /*$scope.$watch('node.type', function(newValue, oldValue) {
              if (confirm('Changing the item type may result in lost data. Are you sure you want to do this?')) {
                // @todo: save
              }
              else {
                $scope.type = oldValue;
              }
            });*/
              }
            ],
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
          });
        };
      }
    };
  }
]).directive('menuNodeUser', function () {
  return {
    restrict: 'A',
    templateUrl: 'views/menuNodeUser.html',
    link: function ($scope, $element, $attrs) {
      angular.forEach($scope.users, function (user) {
        if (user.uid == $scope.node.user) {
          $scope.name = user.name;
        }
      });
      $scope.userChange = function (user) {
        $scope.node.user = user.id;
        $scope.name = user.name;
        $scope.itemSaveProp($scope.node.id, 'user', $scope.node.user);
      };
    }
  };
}).directive('menuNodeStatus', function () {
  return {
    restrict: 'A',
    templateUrl: 'views/menuNodeStatus.html',
    link: function ($scope, $element, $attrs) {
      $scope.setStatus = function (key) {
        var activeStatus = null;
        angular.forEach($scope.statuses, function (item) {
          if ($scope.node.status === item.key) {
            $scope.status = item;
          }
        });
      };
      $scope.setStatus();
      $scope.statusChange = function (status) {
        $scope.node.status = status;
        $scope.setStatus();
        $scope.itemSaveProp($scope.node.id, 'status', $scope.node.status);
      };
      $scope.statusIncrease = function () {
        var activeStatus = null;
        angular.forEach($scope.statuses, function (item, key) {
          if ($scope.node.status === item.key) {
            activeStatus = $scope.statuses[key + 1];
          }
        });
        console.log(activeStatus);
        if (activeStatus != undefined) {
          $scope.status = activeStatus;
          $scope.node.status = activeStatus.key;
          $scope.itemSaveProp($scope.node.id, 'status', $scope.node.status);
        }
      };
    }
  };
}).directive('menuNodeNew', function () {
  return {
    restrict: 'A',
    templateUrl: 'views/menuNodeNew.html',
    link: function ($scope, $element, $attrs) {
    }
  };
}).directive('menuNodeDelete', function () {
  return {
    restrict: 'A',
    templateUrl: 'views/menuNodeDelete.html',
    link: function ($scope, $element, $attrs) {
    }
  };
});