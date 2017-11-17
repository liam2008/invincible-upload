(function () {
    var app = angular.module('app');

    app.controller('userManageCtrl', ['$scope', 'netManager', 'DTOptionsBuilder', 'SweetAlert', '$q',
        function ($scope, netManager, DTOptionsBuilder, SweetAlert, $q) {
            $scope.dtOptions = DTOptionsBuilder.newOptions()
                .withDOM('<"html5buttons"B>lTfgitp')
                .withButtons([
                    {
                        text: '添加用戶',
                        action: function (e, dt, node, config) {
                            $scope.addUser = {};
                            $scope.$digest();
                            $('#addUserModule').modal('show');
                        }
                    }
                ]);

            init();

            //编辑
            var editData = {};
            $scope.edit = function (editItem) {
                console.log('editItem', editItem);
                //得到编辑信息
                $scope.editData = {
                    account: editItem.account,
                    name: editItem.name,
                    selRole: editItem.role['_id'],
                    '_id': editItem['_id']
                };
            };
            $scope.saveEdit = function () {
                SweetAlert.swal({
                        title: "你确定修改吗?",
                        text: "你将修改此条数据!",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonText: "确定",
                        cancelButtonText: "取消",
                        closeOnConfirm: false,
                        closeOnCancel: false
                    },
                    function (isConfirm) {
                        if (isConfirm) {
                            var editData = {
                                account: $scope.editData.account,
                                name: $scope.editData.name,
                                password: $scope.editData.password?CryptoJS.MD5($scope.editData.password).toString(CryptoJS.enc.Base64):null,
                                team: $scope.editData.team,
                                role: $scope.editData.selRole
                            };
                            console.log('eidtData', editData);
                            netManager.put('/users/' + $scope.editData['_id'], editData).then(function (res) {
                                SweetAlert.swal("编辑成功!", "success");
                                init();
                            }, function (err) {
                                console.error(err);
                                SweetAlert.swal("编辑失败!", "error")
                            });
                        }
                    });
            };
            $scope.editData = editData;

            //添加
            var addUser = {};
            $scope.saveUser = function () {
                $scope.formAdd.submitted = true;
                if ($scope.formAdd.$valid && addUser.password === addUser.confirmPassword && $scope.addUser.selRole) {
                    var saveUserData = {
                        account: $scope.addUser.account,
                        name: $scope.addUser.name,
                        password: CryptoJS.MD5(addUser.password).toString(CryptoJS.enc.Base64),
                        role: $scope.addUser.selRole,
                        team: $scope.addUser.team
                    };
                    netManager.post('/users', saveUserData).then(function (res) {
                        if (res.status === 200) {
                            $('#addUserModule').modal('hide');
                            SweetAlert.swal("保存成功!", "success");
                            init();
                        }
                    }, function (err) {
                        console.error(err);
                        SweetAlert.swal("保存失败!", err.data.description, 'error');
                    });
                }
            };
            $scope.addUser = addUser;

            //初始化页面
            function init() {
                netManager.get('/users').then(function (res) {
                    $scope.tableData = res.data;
                    getRoles();
                    $scope.isLoad = false;
                }, function (err) {
                    console.error(err);
                });
            }

            //请求角色
            function getRoles() {
                netManager.get('/roles').then(function (res) {
                    var roles = [];
                    for (var i = 0; i < res.data.length; i++) {
                        roles.push({
                            name: res.data[i].name,
                            value: res.data[i]['_id']
                        });
                    }
                    $scope.roles = roles;
                }, function (err) {
                    console.error(err);
                });
            }

            //请求teams
            function getTeam(){
                $scope.isLoad = true;
                netManager.get('/teams').then(function (res) {
                    $scope.teams = res.data;
                    console.log('$scope.teams', $scope.teams);
                    $scope.isLoad = false;
                }, function (err) {
                    console.error(err);
                });
            }
        }
    ]);

}());