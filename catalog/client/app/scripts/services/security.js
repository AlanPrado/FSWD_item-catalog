'use strict';

/**
 * @ngdoc service
 * @name itemCatalogApp.security
 * @description
 * # security
 * Service in the itemCatalogApp.
 */
angular.module('itemCatalogApp')
  .service('Security', function Security($rootScope, $window, $state, $http) {

    function signInCallback(authResult) {
      if (authResult['code']) {
        debugger;
        // Hide the sign-in button now that the user is authorized, for example:
        $('#catalog-signin2').hide();
        // Send the code to the server
        $.ajax({
          type: 'POST',
          url: $rootScope.serverUrl + '/api/auth/gconnect?state=%%STATE%%',
          // Always include an `X-Requested-With` header in every AJAX request,
          // to protect against CSRF attacks.
          headers: {
            'X-Requested-With': 'XMLHttpRequest'
          },
          contentType: 'application/octet-stream; charset=utf-8',
          success: function(result) {
            // Handle or verify the server response.
            debugger;
          },
          processData: false,
          data: authResult['code']
        });
      }
    }

    function signOut() {
      var auth2 = gapi.auth2.getAuthInstance();
      auth2.signOut().then(function () {
        $('#catalog-signin2').show();
      });
    }

    var renderSignInBtn = gapi.signin2.render('catalog-signin2', {
        'theme': 'dark',
        'onsuccess': signInCallback
      });

    return {
      'renderSignInBtn': renderSignInBtn
    }
  });
