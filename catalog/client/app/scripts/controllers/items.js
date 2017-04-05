'use strict';

/**
 * @ngdoc function
 * @name itemCatalogApp.controller:ItemsCtrl
 * @description
 * # ItemsCtrl
 * Controller of the itemCatalogApp
 */
angular.module('itemCatalogApp')
  .controller('ItemsCtrl', function ($scope, $stateParams, Items, Common) {
    $scope.action = { 'add': false, 'edit': false };
    $scope.itemSelected = null;
    $scope.category = null;

    $scope.addItem = function () {
      $scope.reset();
      $scope.action.add = true;
      $scope.itemSelected = {};
    };

    $scope.isItemFormVisible = function () {
      return $scope.action.add || $scope.action.edit;
    };

    $scope.reset = function () {
      $scope.action.add = false;
      $scope.action.edit = false;
      $scope.itemSelected = null;
    };

    var clear = function () {
      $scope.reset();
      Common.changeUrl('/categories/' + $scope.category.id + '/items', false);
    };

    $scope.cancel = function () {
      clear();
    };

    $scope.selectItem = function (item) {

    };

    var loadItemsByCategory = function (categoryId) {
      Items.query({categoryId: categoryId},
        function (response) {
          $scope.category = response;
          if ($stateParams.itemId === undefined) {
            $scope.action.add = true;
          } else {
            $scope.action.edit = true;
            selectItem(response);
          }
        }, function (response) {
          Common.alert.setErrorMessage(response.data.message);
        });
    };

    loadItemsByCategory($stateParams.categoryId);
  });
