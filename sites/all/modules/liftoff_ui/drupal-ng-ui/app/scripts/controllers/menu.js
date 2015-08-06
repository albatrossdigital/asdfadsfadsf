'use strict';

angular.module('drupalNgUiApp')
.controller('MenuCtrl', [
  '$stateParams', '$scope', '$filter', '$http', 'Menu', 'User', '$timeout', '$modal',
  function($stateParams, $scope, $filter, $http, Menu, User, $timeout, $modal) {

  $scope.menuName = $stateParams.menuName != undefined ? $stateParams.menuName : 'main-menu';

  $scope.treeOptions = {
    dropped: function(event) {
      var siblings = event.dest.nodesScope.$modelValue;
      var index = event.dest.index;
      var nodeData = siblings[index];
      var $parent = event.dest.nodesScope.depth() > 0 ? event.dest.nodesScope.$parent.$modelValue : {id: 0, weight: 0};
      nodeData.parent = $parent.id;
      if (siblings.length == 1) {
        nodeData.weight = $parent.weight;
      }
      else if (index == 0) {
        nodeData.weight = parseInt(siblings[1].weight) - 3;
      }
      else if (index >= siblings.length-1) {
        nodeData.weight = parseInt(siblings[siblings.length-1].weight) + 3;
      }
      else if (parseInt(siblings[index+1].weight) - parseInt(siblings[index-1].weight) > 1) {
        nodeData.weight = parseInt(siblings[index-1].weight) + 1;
      }
      else {
        var weight = parseInt(siblings[index-1].weight) + 5;
        nodeData.weight = weight;
        for (var i=index+1; i<siblings.length; i++) {
          weight += 5;
          siblings[i].weight = weight;
          console.log(weight);
        }
      }
      $scope.itemSave({
        id: nodeData.id,
        parent: nodeData.parent,
        weight: nodeData.weight
      })
      console.log(nodeData.weight);
    },
  };

  $scope.remove = function(scope) {
    scope.remove();
  };

  $scope.itemNew = function(scope, type) {
    var nodeData = scope.$modelValue;
    if (nodeData == undefined) {
      nodeData = {nodes: $scope.data};
    }
    nodeData.nodes.push({
      id: 'new',
      title: '',
      menu_name: $scope.menuName,
      type: type,
      parent: nodeData.id,
      weight: !nodeData.nodes.length ? nodeData.weight : parseInt(nodeData.nodes[nodeData.nodes.length-1].weight)+5,
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

  $scope.itemSave = function(item) {
    var menuItem = Menu.save(item, function(data) {
      if (item.id == undefined || item.id == 'new') {
        item.id = data.id;
        console.log(item);
        console.log(data);
      }
    });
  }

  $scope.itemSaveProp = function(id, prop, val) {
    var data = {
      'id': id,
    }
    data[prop] = val;
    $scope.itemSave(data);
  }



  $scope.visible = function(item) {
    if ($scope.query && $scope.query.length > 0
      && item.title.indexOf($scope.query) == -1) {
      return false;
    }
    return true;
  };


  $scope.data = Menu.query({menu_name: $scope.menuName});
  $scope.users = User.query();


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
    key: 'gdrive',
    icon: 'cloud-download',
    color: 'rgb(178, 118, 54)',
  }];

  $scope.statuses = [{
    name: 'Draft',
    key: 'draft',
    'class': 'danger',
  },
  {
    name: 'Needs Review',
    key: 'needs_review',
    'class': 'warning',
  },
  {
    name: 'Approved',
    key: 'published',
    'class': 'success',
  }];

  $scope.user = 1;


}]);
