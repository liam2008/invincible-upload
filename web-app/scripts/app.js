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

                            if (data.code === Smartdo.ERROR.TOKEN_EXPIRED           //����
                                || data.code === Smartdo.ERROR.INVALID_TOKEN        //����
                            ) {
                                $window.localStorage.clear();
                                $location.path('/login');
                            }
                            else if (status == 401 || status == 403) {
                                //û��Ȩ��,�ⲿ�ֺ�̨����
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
            function ($rootScope, $state, $templateCache, netManager, angularPermission) {
                $rootScope.$state = $state;
                $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
                    if (toState.name === 'login' || toState.name === 'unauthorized' || toState.name === 'main.summary') {//��½ҳ���û����Ȩҳ�治��ȡȨ��
                        return;
                    }
                    var permission = toState.name;
                    if (angular.isString(permission) && !angularPermission.hasPermission(permission)) {
                        $state.go('unauthorized');
                        return;
                    }
                });

                $rootScope.$on('$stateChangeError', function () {

                });
            }
        ]);
    });
})(document, angular, $);