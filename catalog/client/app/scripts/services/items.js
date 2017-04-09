'use strict';

/**
 * @ngdoc service
 * @name itemCatalogApp.items
 * @description
 * # items
 * Service in the itemCatalogApp.
 */
angular.module('itemCatalogApp')
  .service('Item', function Item($resource) {
    var prefix = 'http://localhost:5000/api/';
    var item = $resource(prefix + 'category/:categoryId/item/:itemId',
                         { categoryId: '@id', itemId: '@id' },
                         {
                           query: { method: 'GET', params: { categoryId: '@id' }, isArray: false, url: prefix + 'category/:categoryId/items' },
                           recent: { method: 'GET', isArray: true, url: prefix + 'recent' },
                           update: { method:'PUT' }
                         });
    return item;
  });
