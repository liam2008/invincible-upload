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
                            console.log(response);
                            var status = response.status;
                            var data = response.data;

                            if (data.code === Smartdo.ERROR.TOKEN_EXPIRED           //过期
                                || data.code === Smartdo.ERROR.INVALID_TOKEN        //错误
                            ) {
                                $window.localStorage.clear();
                                $location.path('/login');
                            }
                            else if (status == 401 || status == 403) {
                                //没有权限,这部分后台控制
                                //$location.path('/xxx');
                                return $q.reject(response);
                            }

                            console.error("responseError: ", data);
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
            'angularPermission',
            'shareData',
            function ($rootScope, $state, $templateCache, netManager, angularPermission,shareData) {
                $rootScope.$state = $state;
                $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
                    if (toState.name === 'login' || toState.name === 'unauthorized' || toState.name === 'main.summary') {//登陆页面和没有授权页面不用取权限
                        return;
                    }
                    var routerName = toState.name;
                    var permissionId = angularPermission.getPermissionId(routerName);
                    if (angular.isString(permissionId) && !angularPermission.hasPermission(permissionId)) {
                        $state.go('unauthorized');
                        return;
                    }
                });
            }
        ]);

        angular.bootstrap(document, ['app']);
    });
})(document, angular, $);