(function () {
    var app = angular.module('app.authority.rolesManage', []);
    app.controller('rolesManageCtrl', ['$scope', 'netManager', 'DTOptionsBuilder', 'SweetAlert', '$q', 'shareData','permissionFn',
        function ($scope, netManager, DTOptionsBuilder, SweetAlert, $q, shareData,permissionFn) {
            $scope.dtOptions = DTOptionsBuilder.newOptions()
                .withDOM('<"html5buttons"B>lTfgitp')
                .withButtons([
                    {
                        text: '添加角色',
                        action: function (e, dt, node, config) {
                            initRolesData();
                            $scope.$digest();
                            $('#addRolesModule').modal('show');
                        }
                    }
                ]);

            //状态

            var editing = false;

            //渲染页面
            init();

            //编辑
            var editData = {};
            $scope.toggle = function (scope) {
                scope.toggle();
            };
            $scope.editData = editData;

            //点击编辑
            $scope.edit = function ($index) {
                editing = true;
                $scope.index = $index;
                var getManageMent = $scope.showList[$index]['management'];
                var management = [];
                if (getManageMent.length === 1 && getManageMent[0] === "*") {//admin权限
                    $scope.showList.forEach(function (val, key) {
                        management.push(val['_id']);
                    });
                } else {
                    management = getManageMent;
                }
                console.log('$scope.showList[$index].routes', $scope.showList[$index].routes);
                $scope.editData = {
                    scope: angular.element(document.getElementById('editRow')).scope(),
                    collapsedAll: true,
                    type: $scope.showList[$index].type,
                    name: $scope.showList[$index].name,
                    routes: $scope.showList[$index].routes,
                    addrid: $scope.showList[$index]['_id'],
                    subordList: angular.copy($scope.showList),//角色列表
                    management: management,//下属列表
                    collapseAll: function () {
                        this.collapsedAll = true;
                    },
                    expandAll: function () {
                        this.collapsedAll = false;
                    }
                };
                $scope.editData.navList = permissionFn.navListFn($scope.editData.routes);
            };

            //保存编辑
            $scope.saveEdit = function (addrId) {
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
                            var saveData = {
                                routes: permissionFn.encodePermission($scope.editData.navList),
                                management: ($scope.editData.management.length === $scope.showList.length) ? ['*'] : $scope.editData.management
                            };
                            console.log('saveData', saveData);
                            netManager.put('/roles/' + addrId, saveData).then(function (res) {
                                swal("保存成功!", "success");
                                angular.extend($scope.showList[$scope.index],saveData);
                                editing = false;
                                //init();
                            }, function (err) {
                                console.err(err.code);
                                swal("保存失败!", err.data.description, "error");
                            });
                        }
                    });
            };

            //选择权限
            $scope.changeAuthority = function (valItem) {
                if (valItem.nodes && valItem.nodes.length > 0) {//  父
                    valItem.selected = valItem.all;//点击父的的selected也会变化
                    valItem.nodes.map(function (val, key) { //会改变$scope.editData.navList中的值
                        val.selected = valItem.all;
                    });
                } else {//通过子判断父的selected和all  子
                    var id = valItem.id;
                    var parent = id.replace(/(\.[^\.]+)$/, '');
                    var len = 0;
                    var navList;
                    if (editing) {
                        navList = $scope.editData.navList;
                    } else {
                        navList = $scope.addRoles.navList;
                    }
                    navList.map(function (val, key) {//检测 点击子元素控制父元素
                        if (val.id === parent) {
                            val.nodes.map(function (valItem, key) {
                                valItem.selected === true && ++len;
                            });
                            if (len > 0) {
                                val.selected = true;
                                if (val.nodes.length === len) {
                                    val.all = true;
                                } else {
                                    val.all = false;
                                }
                            } else {
                                val.selected = false;
                            }
                            return;
                        }
                    });
                }
            };

            //新建角色
            function initRolesData() {
                $scope.isLoad = true;
                netManager.get('/roles/department').then(function (res) {
                    $scope.addRoles = {
                        type: '',
                        name: '',
                        routes: [],
                        management: [],
                        submitted: false,
                        collapsedAll: true,
                        scope: angular.element(document.getElementById('addRolesModule')).scope(),
                        department: '',
                        navList:angular.copy(shareData.navList),
                        collapseAll: function () {
                            this.collapsedAll = true;
                        },
                        expandAll: function () {
                            this.collapsedAll = false;
                        }
                    };
                    $scope.addRoles.navList = permissionFn.navListFn($scope.addRoles.navList);
                    $scope.addRoles.departmentList = res.data;
                    $scope.isLoad = false;
                }, function (err) {
                    console.error(err);
                });
            }

            //保存角色
            $scope.saveRoles = function () {
                $scope.addRoles.submitted = true;
                if ($scope.formAdd.$valid && $scope.addRoles.department) {
                    var saveUserData = {
                        type: $scope.addRoles.type,
                        name: $scope.addRoles.name,
                        routes: permissionFn.encodePermission($scope.addRoles.navList),
                        department: $scope.addRoles.department,
                        management: $scope.addRoles.management
                    };
                    console.log('saveUserData', saveUserData);
                    netManager.post('/roles', saveUserData).then(function (res) {
                        $('#addRolesModule').modal('hide');
                        SweetAlert.swal("保存成功!", "success");
                        init();
                    }, function (err) {
                        console.error(err);
                        SweetAlert.swal("保存失败!", 'error');
                    });
                }
            };

            //初始化页面
            function init() {
                var dfd = $q.defer();
                $scope.isLoad = true;
                netManager.get('/roles').then(function (res) {
                    console.log('showList', res.data);
                    $scope.showList = res.data;
                    $scope.isLoad = false;
                    dfd.resolve();
                }, function (err) {
                    console.error(err);
                    dfd.reject();
                });
                return dfd.promise;
            }

        }
    ]);
}());

