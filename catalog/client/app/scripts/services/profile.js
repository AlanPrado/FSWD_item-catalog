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

    function loadProfile() {
      $http.get($rootScope.serverUrl + '/api/auth/profile').then(function (response) {
        $rootScope.profile = response.data;
      });
    }

    function signInCallback(authResult) {
      if (authResult['code']) {
        $('.catalog-signin2').hide();

        $http.post(
          $rootScope.serverUrl + '/api/auth/gconnect',
          authResult['code'],
          null
        ).then(function () {
          $window.location.reload();
        });
      }
    }

    function hasAuthInstance() {
      if (gapi.auth2) {
        $window.auth2 = gapi.auth2.getAuthInstance();
        return $window.auth2 !== undefined;
      }

      return false;
    }

    function hideSignOutModal() {
      $('.signout-modal').modal('hide');
    }

    function googleSignOut() {
      return auth2.signOut().then(function () {
        $('.catalog-signin2').show();
      });
    }

    $rootScope.signout = function() {
      if (hasAuthInstance()) {
        $http.post($rootScope.serverUrl + '/api/auth/disconnect').then(function (response) {
          return googleSignOut();
        }).then(function () {
          $rootScope.profile = null;
          hideSignOutModal();
          $window.location.reload();
        });
      }
    }

    function isSignedIn() {
      if (hasAuthInstance()) {
        return auth2.isSignedIn.get() || $rootScope.profile !== undefined;
      }
    }

    $rootScope.showSingOutModal = function () {
      $('.signout-modal').modal('show')
    };

    $('body').on('click', '.catalog-signin2 div', function () {
      if (hasAuthInstance()) {
        auth2.grantOfflineAccess().then(signInCallback);
      }
    });

    $rootScope.cancelSignout = function () {
      hideSingoutModal();
    };

    return {
      'isSignedIn': isSignedIn,
      'loadProfile': loadProfile
    }
  });
