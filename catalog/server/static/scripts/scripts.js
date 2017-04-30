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
  .run(function ($http, $rootScope, $window, CRSFService, Profile) {
    // if app is running in another port different from server,
    // replace <your-client-id> for your google client id
    // and <your-server-address> for the current port of your backend server
    // For debug porposes, consider run grunt serve.
    // For that, remeber you need to install grunt client
    var clientId = angular.element("head meta[name='google-signin-client_id']").attr('content');
    var serverAddress = angular.element("head meta[name='server-address']").attr('content');
    $rootScope.serverUrl = serverAddress === '%%SERVER_ADDRESS%%' ? '<your-server-address>' : serverAddress;
    $rootScope.clientId = clientId === '%%CLIENT_ID%%' ? '<your-client-id>' : clientId;

    CRSFService.refreshToken();

    $window.initGapi = function () {
      function init() {
        gapi.auth2.init({
          client_id: $rootScope.clientId,
          cookiepolicy: 'single_host_origin'
        }).then(function () {
          if (Profile.isSignedIn()) {
            Profile.loadProfile();
          }
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

'use strict';

/**
 * @ngdoc service
 * @name itemCatalogApp.common
 * @description
 * # common
 * Service in the itemCatalogApp.
 */
angular.module('itemCatalogApp')
  .service('Common', function Common($rootScope, $timeout, $state) {
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

'use strict';

/**
 * @ngdoc service
 * @name itemCatalogApp.items
 * @description
 * # items
 * Service in the itemCatalogApp.
 */
angular.module('itemCatalogApp')
  .service('Item', function Item($resource, $rootScope) {
    var prefix = $rootScope.serverUrl + '/api/';
    var item = $resource(prefix + 'category/:categoryId/item/:itemId',
                         { categoryId: '@id', itemId: '@id' },
                         {
                           query: { method: 'GET', params: { categoryId: '@id' }, isArray: false, url: prefix + 'category/:categoryId/items' },
                           recent: { method: 'GET', isArray: true, url: prefix + 'recent' },
                           update: { method:'PUT' }
                         });
    return item;
  });

'use strict';

/**
 * @ngdoc function
 * @name itemCatalogApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the itemCatalogApp
 */
angular.module('itemCatalogApp')
  .controller('MainCtrl', function ($scope, $state, $window, Common, Item) {
    $scope.items = [];

    var loadItems = function () {
      Item.recent(function (response) {
        $scope.items = response;
      }, function (response) {
        Common.alert.setErrorMessage(response.data.message);
      });
    };

    $scope.selectItem = function (item) {
      $state.go('item', { 'categoryId': item.categoryId, 'itemId': item.id }, { notify: true });
    };

    $scope.selectCategory = function (item) {
      $state.go('category', { 'categoryId': item.categoryId }, { notify: true });
    };

    (function init() {
      Common.setTag('home');
      loadItems();
    })();
  });

'use strict';

/**
 * @ngdoc function
 * @name itemCatalogApp.controller:CategoriesCtrl
 * @description
 * # CategoriesCtrl
 * Controller of the itemCatalogApp
 */
angular.module('itemCatalogApp')
  .controller('CategoriesCtrl', function ($rootScope, $scope, $stateParams, $location, $state, Category, Common, Profile) {
    $scope.categories = [];
    $scope.categoryFilter = '';
    $scope.action = { 'add': false, 'edit': false, 'view': false };
    $scope.categorySelected = null;

    $scope.addCategory = function () {
      $scope.reset();
      $scope.action.add = true;
      $scope.categorySelected = {};
    };

    $scope.reset = function () {
      $scope.action.add = false;
      $scope.action.edit = false;
      $scope.action.view = false;
      $scope.categorySelected = null;
    };

    var clear = function () {
      $scope.reset();
      $state.go('categories', {}, { notify: false });
    };

    $scope.selectItem = function (item) {
      if (item) {
        $state.go('item', { 'categoryId': $scope.categorySelected.id, 'itemId': item.id }, { notify: true });
      } else {
        $state.go('items', { 'categoryId': $scope.categorySelected.id}, { notify: true });
      }
    };

    $scope.cancel = function () {
      clear();
    };

    $scope.save = function () {
      var category = new Category({ title: $scope.categorySelected.title });
      var promise = $scope.action.edit ? category.$update({categoryId: $scope.categorySelected.id}) : category.$save();

      promise.then(function (response) {
        loadCategories();
        if ($scope.action.add) {
          Common.alert.setSuccessMessage('Category added!');
          $scope.selectCategory(response);
        } else if ($scope.action.edit) {
          Common.alert.setSuccessMessage('Category updated!');
          $scope.reset();
        }
      }, function (response) {
        Common.alert.setErrorMessage(response.data.message);
      });
    };

    $scope.delete = function () {
      var category = new Category();
      category.$delete({ categoryId: $scope.categorySelected.id })
      .then(function (response) {
        clear();
        loadCategories();
        Common.alert.setSuccessMessage('Category removed!');
      }, function (response) {
        Common.alert.setErrorMessage(response.data.message);
      });
    };

    $scope.isCategoryFormVisible = function () {
      return $scope.action.add || $scope.action.edit || $scope.action.view;
    };

    $scope.isOwner = function () {
      if ($rootScope.profile && $scope.categorySelected) {
        return $rootScope.profile.email === $scope.categorySelected.author && $scope.categorySelected.author !== undefined;
      }
      return false;
    };

    $scope.selectCategory = function (category) {
      $scope.reset();
      var isSignedIn = Profile.isSignedIn();
      $scope.action.edit = true && isSignedIn;
      $scope.action.view = !isSignedIn;
      $scope.categorySelected = angular.copy(category);
      $state.go('category', { 'categoryId': category.id }, { notify: false });
    };

    var loadCategories = function () {
      return Category.query(function (response) {
        $scope.categories = response;

        var categoryId = Number.parseInt($stateParams.categoryId);

        if (!Number.isNaN(categoryId)) {
          for (var i = 0, l = response.length; i < l; i++) {
            if (response[i].id === categoryId) {
              $scope.selectCategory(response[i]);
              break;
            }
          }
        }
      }, function (response) {
        Common.alert.setErrorMessage(response.data.message);
      });
    };

    (function init() {
      Common.setTag('categories');
      loadCategories();
    })();
  });

'use strict';

/**
 * @ngdoc function
 * @name itemCatalogApp.controller:ItemsCtrl
 * @description
 * # ItemsCtrl
 * Controller of the itemCatalogApp
 */
angular.module('itemCatalogApp')
  .controller('ItemsCtrl', function ($scope, $stateParams, $state, Item, Common, Profile, $rootScope) {
    $scope.action = { 'add': false, 'edit': false, 'view': false };
    $scope.itemSelected = null;
    $scope.category = null;

    $scope.addItem = function () {
      $scope.reset();
      $scope.action.add = true;
      $scope.itemSelected = {};
    };

    $scope.isItemFormVisible = function () {
      return $scope.action.add || $scope.action.edit || $scope.action.view;
    };

    $scope.reset = function () {
      $scope.action.add = false;
      $scope.action.edit = false;
      $scope.action.view = false;
      $scope.itemSelected = null;
    };

    var clear = function () {
      $scope.reset();
      $state.go('items', { 'categoryId': $scope.category.id }, { notify: false });
    };

    $scope.cancel = function () {
      clear();
    };

    $scope.selectItem = function (item) {
      $scope.reset();
      var isSignedIn = Profile.isSignedIn();
      $scope.action.edit = true  && isSignedIn;
      $scope.action.view = !isSignedIn;
      $scope.itemSelected = angular.copy(item);
      $state.go('item', { 'categoryId': $stateParams.categoryId, 'itemId': item.id }, { notify: false });
    };

    $scope.save = function () {
      var item = new Item({ categoryId: $scope.category.id,
                            title: $scope.itemSelected.title,
                            description: $scope.itemSelected.description || null });
      var promise = $scope.action.edit
          ? item.$update({ itemId: $scope.itemSelected.id, categoryId: $scope.category.id })
          : item.$save({ categoryId: $scope.category.id });

      var editing = $scope.action.edit;

      promise.then(function (response) {
        loadItemsByCategory(response.categoryId, response.id, editing);

        if (editing) {
          Common.alert.setSuccessMessage('Item updated!');
        } else {
          Common.alert.setSuccessMessage('Item added!');
          $scope.selectItem(response);
        }
      }, function (response) {
        Common.alert.setErrorMessage(response.data.message);
      });
    };

    $scope.isOwner = function () {
      if ($rootScope.profile && $scope.category) {
        return $rootScope.profile.email === $scope.category.author;
      }
      return false;
    };

    $scope.delete = function () {
      var item = new Item();
      item.$delete({ itemId: $scope.itemSelected.id, categoryId: $scope.category.id })
      .then(function (response) {
        clear();
        loadItemsByCategory($scope.category.id, undefined, true);
        Common.alert.setSuccessMessage('Category removed!');
      }, function (response) {
        Common.alert.setErrorMessage(response.data.message);
      });
    };

    var loadItemsByCategory = function (categoryId, itemId, reset) {
      var adding = itemId === undefined;
      return Item.query({categoryId: categoryId},
        function (response) {
          $scope.category = response;
          if (reset) {
            $scope.action.add = false;
            $scope.action.edit = false;
            $scope.action.view = false;
          } else {
            var isSignedIn = Profile.isSignedIn()
            $scope.action.add = adding && isSignedIn;
            $scope.action.edit = !adding && isSignedIn;
            $scope.action.view = !isSignedIn;
          }

          if (!$scope.action.add) {
            var items = response.items;
            var id = Number.parseInt(itemId);
            for (var i = 0, l = items.length; i < l; i++) {
              if (items[i].id === id) {
                $scope.selectItem(items[i]);
                break;
              }
            }
          }
        }, function (response) {
          Common.alert.setErrorMessage(response.data.message);
        });
    };

    (function init() {
      Common.setTag('categories');
      loadItemsByCategory($stateParams.categoryId, $stateParams.itemId);
    })();
  });
