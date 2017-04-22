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
  .service('CRSFService', function ($http, $rootScope, $cookies) {
    return {
      refreshToken: function () {
        $cookies.remove('XSRF-TOKEN');
        return $http({
          method: 'GET',
          url: $rootScope.serverUrl + '/api/auth/initialize'
        });
      }
    }
  })
  .run(function ($http, $timeout, $cookies, $rootScope, $window, CRSFService) {
    $rootScope.serverUrl = 'http://localhost:5000';
    $rootScope.clientId = '<your-client-id>';
    // allow flask session cookie be provided
    // with each request when working with flask
    $http.defaults.withCredentials = true;

    CRSFService.refreshToken().then(function () {
      $http.defaults.headers.common["X-XSRF-TOKEN"] = $cookies.get('XSRF-TOKEN');
    });

    $window.initGapi = function () {
      function init() {
        gapi.client.init({
          client_id: $rootScope.clientId,
          scope: 'email profile'
        });
      }
      $rootScope.$apply(init);
    };
  })
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

  function handleClientLoad() {
     gapi.load('client:auth2', init);
  }

  function init () {
    window.initGapi();
  }
