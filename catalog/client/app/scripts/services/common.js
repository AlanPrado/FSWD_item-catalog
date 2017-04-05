'use strict';

/**
 * @ngdoc service
 * @name itemCatalogApp.common
 * @description
 * # common
 * Service in the itemCatalogApp.
 */
angular.module('itemCatalogApp')
  .service('Common', function Common($rootScope, $timeout, $state, $route, $location) {
    // Select tab 'categories' or 'home'
    var setTag = function (tagName) {
      $rootScope.selectedTag = tagName;
    };

    $rootScope.alert = {
      success: false,
      warning: false,
      error: false,
      message: '',
      type: '',
      isVisible: false,
      closePromise: null,
      defaultTimeClose: 3000,
      setMessage: function (message) {
        this.close();
        this.message = message;
        this.isVisible = true;
        var self = this;
        this.closePromise = $timeout(function() { self.close(); }, this.defaultTimeClose);
      },
      setSuccessMessage: function (message) {
        this.setMessage(message);
        this.success = true;
        this.type = 'Success';
      },
      setWarningMessage: function (message) {
        this.setMessage(message);
        this.warning = true;
        this.type = 'Warning';
      },
      setErrorMessage: function (message) {
        this.setMessage(message || "Server Error");
        this.error = true;
        this.type = 'Error';
      },
      close: function () {
        this.message = '';
        this.type = '';
        this.success = false;
        this.warning = false;
        this.error = false;
        this.isVisible = false;
        $timeout.cancel(this.closePromise);
        this.closePromise = null;
      }
    };

    return {
      'setTag': setTag,
      'alert': $rootScope.alert
    }
  });
