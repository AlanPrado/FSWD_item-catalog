'use strict';

/**
 * @ngdoc service
 * @name itemCatalogApp.Category
 * @description
 * # Category
 * Service in the itemCatalogApp.
 */
angular.module('itemCatalogApp')
  .service('Category', function Category($resource, $rootScope) {
    var prefix = $rootScope.serverUrl + '/api/';
    var category = $resource(prefix + 'category/:categoryId',
                             { categoryId: '@id' },
                             {
                               query: { method: 'GET', params: {}, isArray: true, url: prefix + 'categories' },
                               update: { method:'PUT' }
                             });
    return category;
  });
