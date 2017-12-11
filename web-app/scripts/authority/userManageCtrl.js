(function () {
    var app = angular.module('app.authority.userManage', []);

    app.controller('userManageCtrl', ['$scope', 'netManager', 'DTOptionsBuilder', 'SweetAlert', '$q',
        function ($scope, netManager, DTOptionsBuilder, SweetAlert, $q) {
            $scope.dtOptions = DTOptionsBuilder.newOptions()
                .withDOM('<"html5buttons"B>lTfgitp')
                .withButtons([
                    {
                        text: '添加用戶',
                        action: function (e, dt, node, config) {
                            $scope.formAdd.submitted = false;
                            $scope.addUser = {};
                            $scope.$digest();
                            $('#addUserModule').modal('show');
                        }
                    }
                ]);

            //弹出框定义
            $scope.dtOptionsNew = DTOptionsBuilder.newOptions();

            init();

            //编辑
            var editData = {};
            $scope.edit = function (editItem, index) {
                console.log('editItem', editItem);
                //得到编辑信息
                $scope.editData = {
                    account: editItem.account,
                    name: editItem.name,
                    role: editItem.role || {},
                    team: editItem.team || {},
                    password: editItem.password,
                    '_id': editItem['_id']
                };

                console.log('$scope.editData', $scope.editData);

                //编辑的位数
                $scope.index = index;
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
                        closeOnCancel: true
                    },
                    function (isConfirm) {
                        if (isConfirm) {
                            var editData = {
                                account: $scope.editData.account || "",
                                name: $scope.editData.name || "",
                                password: $scope.editData.password ? CryptoJS.MD5($scope.editData.password).toString(CryptoJS.enc.Base64) : "",
                                team: $scope.editData.team['_id'] || "",
                                role: $scope.editData.role['_id'] || ""
                            };
                            console.log('eidtData', editData);
                            netManager.put('/users/' + $scope.editData['_id'], editData).then(function (res) {
                                SweetAlert.swal("编辑成功!", "success");

                                console.log('before', $scope.tableData[$scope.index]);
                                //刷新编辑之后的数据
                                angular.extend($scope.tableData[$scope.index], $scope.editData);
                                console.log('after', $scope.tableData[$scope.index]);
                            }, function (err) {
                                console.error('error', err.data.description);
                                SweetAlert.swal("编辑失败!", err.data.description, "error")
                            });
                        }
                    });
            };
            $scope.editData = editData;

            //添加
            var addUser = {};
            $scope.saveUser = function () {
                $scope.formAdd.submitted = true;
                if ($scope.formAdd.$valid && addUser.password === addUser.confirmPassword) {
                    var saveUserData = {
                        account: $scope.addUser.account,
                        name: $scope.addUser.name,
                        password: $scope.addUser.password ? CryptoJS.MD5($scope.addUser.password).toString(CryptoJS.enc.Base64) : "",
                        role: $scope.addUser.role['_id'],
                        team: $scope.addUser.team? $scope.addUser.team['_id']:null
                    };
                    console.log('saveUserData', saveUserData);
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
                    console.log('tableData', res.data);
                    $scope.tableData = res.data;
                    getTeam();
                    getRoles();
                    $scope.isLoad = false;
                }, function (err) {
                    console.error(err);
                });
            }

            //请求角色
            function getRoles() {
                netManager.get('/roles').then(function (res) {
                    console.log('role', res.data);
                    var roles = [];
                    for (var i = 0; i < res.data.length; i++) {
                        roles.push({
                            'name': res.data[i].name,
                            '_id': res.data[i]['_id'],
                            'type': res.data[i]['type']
                        });
                    }
                    $scope.roles = roles;
                    console.log('roles', roles);
                }, function (err) {
                    console.error(err);
                });
            }

            //请求teams
            function getTeam() {
                $scope.isLoad = true;
                netManager.get('/teams').then(function (res) {
                    $scope.teams = res.data;
                    console.log('$scope.teams', $scope.teams);
                    $scope.isLoad = false;
                }, function (err) {
                    console.error(err);
                });
            }

            //团队选择
            $scope.chooseTeam = function (teamData) {
                console.log('teamData', teamData);
                if ($('#editRow').css('display') === 'block') {
                    $scope.editData.team = teamData;
                } else {
                    $scope.addUser.team = teamData;
                }
            };

            //选择角色
            $scope.chooseRole = function (roleData) {
                console.log('roleData', roleData);
                if ($('#editRow').css('display') === 'block') {
                    $scope.editData.role = roleData;
                } else {
                    $scope.addUser.role = roleData;
                }
            }
        }
    ]);

}());