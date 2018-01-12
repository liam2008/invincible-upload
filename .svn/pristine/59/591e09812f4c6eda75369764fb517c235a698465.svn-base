/**
 * INSPINIA - Responsive Admin Theme
 *
 */
(function (document, angular, $) {
    var app = angular.module('app',[
        'ui.router',                    // Routing
        'oc.lazyLoad',                  // ocLazyLoad
        'ui.bootstrap',                 // Ui Bootstrap
        'pascalprecht.translate',       // Angular Translate
        'ngIdle',                       // Idle timer
        'ngSanitize'                    // ngSanitize
    ]);

    app.config([
        '$locationProvider',
        '$httpProvider',
        function ($locationProvider, $httpProvider, $resourceProvider) {
            $httpProvider.interceptors.push([
                '$q',
                '$location',
                '$window',
                function ($q, $location, $window) {
                    return {
                        'request': function (config) {
                            config.headers = config.headers || {};
                            if ($window.localStorage.token) {
                                config.headers.Authorization = 'Bearer ' + $window.localStorage.token;
                            }
                            return config || $q.when(config);
                        },
                        'responseError': function (response) {
                            return $q.reject(response);
                        }
                    };
                }
            ]);
        }
    ]);

    angular.element(document).ready(function(){
        app.run([
            '$rootScope',
            '$state',
            '$templateCache',
            'netManager',
            'permissionFn',
            function ($rootScope, $state, $templateCache, netManager, permissionFn) {
                $rootScope.$state = $state;
                $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
                    if (toState.name === 'login' || toState.name === 'unauthorized' || toState.name === 'main.summary') {//登陆页面和没有授权页面不用取权限
                        return;
                    }
                    var routerName = toState.name;
                    var permissionId = permissionFn.mapRouterToPermission()[routerName];
                    if (angular.isString(permissionId) && !permissionFn.hasPermission(permissionId)) {
                        $state.go('unauthorized');
                        return;
                    }
                });
            }
        ]);

        angular.bootstrap(document, ['app']);
    });
})(document, angular, $);