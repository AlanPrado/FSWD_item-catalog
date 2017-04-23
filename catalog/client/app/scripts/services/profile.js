'use strict';

/**
 * @ngdoc service
 * @name itemCatalogApp.security
 * @description
 * # security
 * Service in the itemCatalogApp.
 */
angular.module('itemCatalogApp')
  .service('Profile', function Profile($rootScope, $window, $state, $http) {
    function updateProfile() {
      // TODO: update profile on load, on sign and on sign out
    }

    function signInCallback(authResult) {
      if (authResult['code']) {
        $('.catalog-signin2').hide();

        $http.post(
          $rootScope.serverUrl + '/api/auth/gconnect',
          authResult['code'],
          null
        ).then(function () {
          updateProfile();
        });
      }
    }

    function signOut() {
      var auth2 = gapi.auth2.getAuthInstance();
      auth2.signOut().then(function () {
        $('#catalog-signin2').show();
      });
    }

    var isSignedIn = function() {
      var auth2 = gapi.auth2;
      return auth2 && !auth2.getAuthInstance().isSignedIn.get();
    }

    $('body .catalog-signin2').on('click', 'div', function () {
      gapi.auth2.getAuthInstance().grantOfflineAccess().then(signInCallback);
    });

    return {
      'isSignedIn': isSignedIn
    }
  });
