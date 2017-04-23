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
    // allow session cookie be sent on each request
    $http.defaults.withCredentials = true;

    return {
      refreshToken: function () {
        $cookies.remove('XSRF-TOKEN');
        return $http({
          method: 'GET',
          url: $rootScope.serverUrl + '/api/auth/initialize'
        }).then(function () {
            var token = $cookies.get('XSRF-TOKEN');
            $http.defaults.headers.post["X-XSRF-TOKEN"] = token;
            $http.defaults.headers.put["X-XSRF-TOKEN"] = token;
            $http.defaults.headers.delete = { "X-XSRF-TOKEN": token };
        });
      }
    }
  })
  .run(function ($http, $rootScope, $window, CRSFService) {
    $rootScope.serverUrl = 'http://localhost:5000';
    $rootScope.clientId = '<your-client-id>';

    CRSFService.refreshToken();

    $window.initGapi = function () {
      function init() {
        gapi.auth2.init({
          client_id: $rootScope.clientId,
          cookiepolicy: 'single_host_origin'
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

  function init () {
    gapi.load('auth2', window.initGapi);
  }
