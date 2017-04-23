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

    function signInCallback(authResult) {
      if (authResult['code']) {
        $('.catalog-signin2').hide();

        $http.post(
          $rootScope.serverUrl + '/api/auth/gconnect',
          authResult['code'],
          null
        ).then(function (response) {
          debugger;
        });
        // debugger;
        // // Hide the sign-in button now that the user is authorized, for example:
        // $('#catalog-signin2').hide();
        // // Send the code to the server
        // $.ajax({
        //   type: 'POST',
        //   url: $rootScope.serverUrl + '/api/auth/gconnect?state=%%STATE%%',
        //   // Always include an `X-Requested-With` header in every AJAX request,
        //   // to protect against CSRF attacks.
        //   headers: {
        //     'X-Requested-With': 'XMLHttpRequest'
        //   },
        //   contentType: 'application/octet-stream; charset=utf-8',
        //   success: function(result) {
        //     // Handle or verify the server response.
        //     debugger;
        //   },
        //   processData: false,
        //   data: authResult['code']
        // });
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

    // var renderSignInBtn = function () {
    //   if (isSignedIn()) {
    //     // gapi.signin2.render('catalog-signin2', {
    //     //     'theme': 'dark',
    //     //     'scope': 'profile email',
    //     //     'onsuccess': signInCallback,
    //     //     'client_id': $rootScope.clientId
    //     //   });
    //     return true;
    //   }
    //   return false;
    // }
    return {
      //'renderSignInBtn': renderSignInBtn,
      'isSignedIn': isSignedIn
    }
  });
