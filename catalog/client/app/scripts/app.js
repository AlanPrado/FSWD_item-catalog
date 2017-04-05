'use strict';

/**
 * @ngdoc overview
 * @name itemCatalogApp
 * @description
 * # itemCatalogApp
 *
 * Main module of the application.
 */
angular
  .module('itemCatalogApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ui.router'
  ])
  .config(function ($routeProvider, $stateProvider) {
    var categoriesState = {
      name: 'categories',
      url: '/categories',
      templateUrl: 'views/categories.html',
      controller: 'CategoriesCtrl'
    };

    var categoryState = {
      name: 'category',
      url: '/category/{categoryId}',
      templateUrl: 'views/categories.html',
      controller: 'CategoriesCtrl'
    };

    var itemsState = {
      name: 'items',
      url: '/category/{categoryId}/items',
      templateUrl: 'views/items.html',
      controller: 'ItemsCtrl'
    };

    var itemState = {
      name: 'item',
      url: '/category/{categoryId}/item/{itemId}',
      templateUrl: 'views/items.html',
      controller: 'ItemsCtrl'
    };

    var homeState = {
      name: 'home',
      url: '/',
      templateUrl: 'views/main.html',
      controller: 'MainCtrl'
    };

    $stateProvider.state(categoriesState);
    $stateProvider.state(categoryState);
    $stateProvider.state(itemsState);
    $stateProvider.state(itemState);
    $stateProvider.state(homeState);
  });
