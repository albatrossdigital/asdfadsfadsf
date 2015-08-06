'use strict';

angular.module('app.tree', ['ui.tree', 'ui.bootstrap', 'ngResource'])
.controller('treeCtrl', function($scope, $filter) {

  $scope.remove = function(scope) {
    scope.remove();
  };

  $scope.itemNew = function(scope, type) {
    var nodeData = scope.$modelValue;
    if (nodeData == undefined) {
      nodeData = {nodes: $scope.data};
    }
    nodeData.nodes.push({
      id: nodeData.id * 10 + nodeData.nodes.length,
      title: '',
      type: type,
      user: $scope.user,
      editing: true,
      status: 'draft',
      nodes: []
    });
    $scope.open(scope);
  };

  $scope.visible = function(item) {
    if ($scope.query && $scope.query.length > 0
      && item.title.indexOf($scope.query) == -1) {
      return false;
    }
    return true;
  };

  $scope.findNodes = function(){

  };

  $scope.open = function (scope) {
    var modalInstance = $modal.open({
      templateUrl: 'myModalContent.html',
      controller: 'ModalInstanceCtrl',
      resolve: {
        item: function () {
          return scope;
        }
      }
    });

    modalInstance.result.then(function (selectedItem) {
      $scope.selected = selectedItem;
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };

  $scope.data = [{
    "id": 1,
    "title": "About",
    "user": "aschmoe",
    "type": "overview",
    "status": "draft",
    "nodes": [
      {
        "id": 11,
        "title": "The Team",
        "user": "jlyon",
        "type": "page",
        "status": "pending",
        "nodes": [
          {
            "id": 111,
            "title": "El jeffe",
            "user": "aschmoe",
            "type": "link",
            "status": "approved",
            "nodes": []
          }
        ]
      },
      {
        "id": 12,
        "title": "The Mission",
        "user": "jlyon",
        "type": "link",
        "status": "draft",
        "nodes": []
      }
    ],
  }, {
    "id": 2,
    "title": "Projects",
    "user": "aschmoe",
    "type": "overview",
    "status": "draft",
    "nodes": [
      {
        "id": 21,
        "title": "Sex on the beach",
        "user": "jlyon",
        "type": "page",
        "status": "draft",
        "nodes": []
      },
      {
        "id": 22,
        "title": "Sex in a tree",
        "user": "aschmoe",
        "type": "overview",
        "status": "draft",
        "nodes": []
      }
    ],
  }];

  $scope.users = [{
    uid: 1,
    name: 'jlyon',
  },
  {
    uid: 2,
    name: 'aschmoe',
  },
  {
    uid: 3,
    name: 'smaloney',
  }];


  $scope.types = [{
    name: 'Overview',
    key: 'overview',
    icon: 'list',
    color: 'rgb(77, 195, 255)',
  },
  {
    name: 'Page',
    key: 'page',
    icon: 'file',
    color: 'rgb(188, 133, 230)',
  },
  {
    name: 'Event',
    key: 'event',
    icon: 'calendar',
    color: 'rgb(223, 123, 170)',
  },
  {
    name: 'Link',
    key: 'link',
    icon: 'link',
    color: 'rgb(246, 141, 56)',
  },
  {
    name: 'Google Drive',
    key: 'drive',
    icon: 'cloud-download',
    color: 'rgb(178, 118, 54)',
  }];

  $scope.statuses = [{
    name: 'Draft',
    key: 'draft',
    'class': 'danger',
  },
  {
    name: 'Ready',
    key: 'pending',
    'class': 'warning',
  },
  {
    name: 'Approved',
    key: 'approved',
    'class': 'success',
  }];

  $scope.user = 'jeff';


})

