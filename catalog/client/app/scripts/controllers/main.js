'use strict';

/**
 * @ngdoc function
 * @name itemCatalogApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the itemCatalogApp
 */
angular.module('itemCatalogApp')
  .controller('MainCtrl', function ($scope, Common) {
    (function init() {
      Common.setTag('home');
    })();
  });
