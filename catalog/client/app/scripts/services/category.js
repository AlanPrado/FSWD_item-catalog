'use strict';

/**
 * @ngdoc service
 * @name itemCatalogApp.Category
 * @description
 * # Category
 * Service in the itemCatalogApp.
 */
angular.module('itemCatalogApp')
  .service('Category', function Category($resource) {
    var prefix = 'http://localhost:5000/api/';
    var category = $resource(prefix + 'category/:categoryId',
                             { categoryId: '@id' },
                             {
                               query: { method: 'GET', params: {}, isArray: true, url: prefix + 'categories' },
                               update: { method:'PUT' }
                             });
    return category;
  });
