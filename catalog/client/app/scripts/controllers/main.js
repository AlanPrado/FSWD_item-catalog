'use strict';

/**
 * @ngdoc function
 * @name itemCatalogApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the itemCatalogApp
 */
angular.module('itemCatalogApp')
  .controller('MainCtrl', function ($scope, $state, $window, Common, Item) {
    $scope.items = [];

    var loadItems = function () {
      Item.recent(function (response) {
        $scope.items = response;
      }, function (response) {
        Common.alert.setErrorMessage(response.data.message);
      });
    };

    $scope.selectItem = function (item) {
      $state.go('item', { 'categoryId': item.categoryId, 'itemId': item.id }, { notify: true });
    };

    $scope.selectCategory = function (item) {
      $state.go('category', { 'categoryId': item.categoryId }, { notify: true });
    };

    (function init() {
      Common.setTag('home');
      loadItems();
    })();
  });
