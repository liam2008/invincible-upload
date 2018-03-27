(function () {
    var app = angular.module('app');

    app.controller('mainController', [
        '$scope',
        '$state',
        'account',
        'netManager',
        'SweetAlert',
        'shareData',
        'permissionFn',
        mainController
    ]);

    app.controller('loginController', [
        '$scope',
        '$location',
        'netManager',
        'SweetAlert',
        loginController
    ]);

    app.controller('unauthorizedController', [
        '$scope',
        '$interval',
        '$state',
        unauthorizedController
    ]);

    function loginController($scope, $location, netManager, SweetAlert) {
        $scope.username = "";
        $scope.password = "";
        $scope.loginFailure = false;

        $scope.onFocus = function () {
            $scope.loginFailure = false;
        };

        $scope.submit = function () {
            if ($scope.username.length < 1) {
                return;
            }

            var password = $scope.password || "";
            var passwd = CryptoJS.MD5(password.toString()).toString(CryptoJS.enc.Base64);

            netManager.login({
                username: $scope.username,
                password: passwd
            }).then(function (result) {
                if (result.ableLogin == true) {
                    $location.path('/main/summary');
                } else { //页面不跳转
                    if (result.needChangePassword) { //密码简单
                        SweetAlert.swal({
                                title: "您的密码即将过期，请尽快修改密码！",
                                text: "马上修改密码？",
                                type: "warning",
                                showCancelButton: true,
                                confirmButtonText: "修改",
                                cancelButtonText: "取消",
                                closeOnConfirm: true,
                                closeOnCancel: true
                            },
                            function (isConfirm) {
                                if (isConfirm) { //修改密码
                                    $('#editPassword').modal('show');
                                } else { //取消
                                    $location.path('/main/summary');
                                }
                            });
                    } else { //密码错误
                        $scope.loginFailure = true;
                    }
                }
            }).catch(function (e) {
                switch (e.data.code) {
                    case '1027':
                        alert('该用户已被冻结，若有问题请联系管理员，谢谢！');
                        break;
                    case '1028':
                        alert('该用户已被删除，若有问题请联系管理员，谢谢！');
                        break;
                }
            });

            //修改密码
            var passwordData = {};
            $scope.passwordData = passwordData;
            $scope.resetPassword = function () {
                $scope.passwordData.submitted = true;
                if (passwordData.newPassword === passwordData.confirmPassword) {
                    var resetPasswordData = {
                        curr_password: CryptoJS.MD5($scope.passwordData.password).toString(CryptoJS.enc.Base64),
                        password: CryptoJS.MD5($scope.passwordData.confirmPassword).toString(CryptoJS.enc.Base64)
                    };
                    console.log('resetPasswordData', resetPasswordData);
                    netManager.put('/me/password', resetPasswordData).then(function (res) {
                        SweetAlert.swal({
                                title: "保存成功？",
                                type: "success",
                                closeOnConfirm: true,
                                closeOnCancel: true
                            },
                            function () {
                                $location.path('/main/summary');
                            });
                    }, function (err) {
                        SweetAlert.swal("保存失败!", err.data.description, 'error');
                    });
                }
            }
        };
    }

    function unauthorizedController($scope, $interval, $state) {
        $scope.counts = 5;
        var timer = $interval(function () {
            $scope.counts--;
            if ($scope.counts <= 0) {
                $interval.cancel(timer);
                $state.go('main.summary');
            }
        }, 1000);
    }

    function mainController($scope,$state,account, netManager, SweetAlert, shareData, permissionFn) {
        //定义默认参数
        account = account || {};
        $scope.account = angular.copy(account);
        var role = account.role || {};
        $scope.account.scope = role.name || "普通用户";
        $scope.navigatorMenuItem = '概述';

        //导航栏
        $scope.navList = permissionFn.navListFn(shareData.permissionList);
        $scope.getClickNavigatorMenuItemTitle = function (id) {
            $state.go(id);
            if (id === 'main.summary') {
                $scope.navigatorMenu = '';
                $scope.navigatorMenuItem = '概述';
            } else {
                for (var i = 0, iLen = $scope.navList.length; i < iLen; i++) {
                    for (var j = 0, jLen = $scope.navList[i].nodes.length; j < jLen; j++) {
                        if ($scope.navList[i].nodes[j].id === id) {
                            $scope.navigatorMenu = $scope.navList[i].title;
                            $scope.navigatorMenuItem = $scope.navList[i].nodes[j].title;
                            return;
                        }
                    }
                }
            }
        };


        //登出
        $scope.logout = function () {
            netManager.logout();
        };

        //改变密码
        var passwordData = {};
        $scope.passwordData = passwordData;
        $scope.resetPassword = function () {
            $scope.passwordData.submitted = true;
            if (passwordData.newPassword === passwordData.confirmPassword) {
                SweetAlert.swal({
                        title: "你确定修改吗?",
                        text: "你将修改此条密码!!!",
                        type: "warning",
                        confirmButtonText: "确定",
                        cancelButtonText: "取消",
                        closeOnConfirm: false,
                        closeOnCancel: false
                    },
                    function (isConfirm) {
                        if (isConfirm) {
                            var resetPasswordData = {
                                curr_password: CryptoJS.MD5($scope.passwordData.password).toString(CryptoJS.enc.Base64),
                                password: CryptoJS.MD5($scope.passwordData.confirmPassword).toString(CryptoJS.enc.Base64)
                            };
                            netManager.put('/me/password', resetPasswordData).then(function (res) {
                                swal("保存成功!", 'success');
                            }, function (err) {
                                swal("保存失败!", err.data.description, 'error');
                            });
                        }
                    });
            }
        };
    }
}());