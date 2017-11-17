(function () {
    var app = angular.module('app.authority.rolesManage',[]);
    app.controller('rolesManageCtrl', ['$scope', 'netManager', 'DTOptionsBuilder', 'SweetAlert', '$q',
        function ($scope, netManager, DTOptionsBuilder, SweetAlert, $q) {
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

            //渲染页面
            init();

            //编辑
            var editData = {};
            $scope.toggle = function (scope) {
                scope.toggle();
            };
            $scope.editData = editData;

            //点击编辑
            initRolesData();
            $scope.edit = function ($index) {
                init().then(function () {
                    var routes = $scope.showList[$index]['management'];
                    var management = [];
                    if (routes.length === 1 && routes[0] === "*") {//admin权限
                        $scope.showList.forEach(function (val, key) {
                            management.push(val['_id']);
                        });
                    } else {
                        management = routes;
                    }
                    console.log('management', management);
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
                    $scope.editData.navList = formatRenderData($scope.editData.routes);
                });
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
                                routes: formateToServer($scope.editData.navList),
                                management: ($scope.editData.management.length === $scope.showList.length) ? ['*'] : $scope.editData.management
                            };
                            console.log('saveData', saveData);
                            netManager.put('/roles/' + addrId, saveData).then(function (res) {
                                swal("保存成功!", "success");
                                init();
                            }, function (err) {
                                console.err(err.code);
                                swal("保存失败!", err.data.description, "error");
                            });
                        }
                    });
            };

            //选择权限
            $scope.changeAuthority = function (valItem) {
                if (valItem.nodes && valItem.nodes.length > 0) {//父
                    valItem.nodes.map(function (val, key) {
                        val.selected = valItem.selected;
                    });
                } else {//子
                    var id = valItem.id;
                    var parent = id.replace(/(\.[^\.]+)$/, '');
                    var len = 0;
                    $scope.navList.map(function (val, key) {
                        if (val.id === parent) {
                            val.nodes.map(function (valItem, key) {
                                valItem.selected === true && ++len;
                            });
                            if (val.nodes.length === len) {
                                val.selected = true;
                            } else {
                                val.selected = false;
                            }
                            return;
                        }
                    });
                }
            };

            //保存角色
            $scope.saveRoles = function () {
                $scope.addRoles.submitted = true;
                if ($scope.formAdd.$valid && $scope.addRoles.department ) {
                    var saveUserData = {
                        type: $scope.addRoles.type,
                        name: $scope.addRoles.name,
                        routes: formateToServer($scope.addRoles.navList),
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

            //新建角色内容
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
                        department:'',
                        collapseAll: function () {
                            this.collapsedAll = true;
                        },
                        expandAll: function () {
                            this.collapsedAll = false;
                        }
                    };
                    $scope.addRoles.navList = formatRenderData($scope.addRoles.routes);
                    $scope.addRoles.departmentList = res.data;
                    $scope.isLoad = false;
                }, function (err) {
                    console.error(err);
                });
            }

            /***
             * 改造后台传来的格式
             * @param routes 接收的权限路由
             */
            function formatRenderData(routes) {
                var navList = angular.copy($scope.$parent.navList);
                if (routes.length === 1 && routes[0] === '*') {
                    return navList;
                } else if (routes.length === 0) {
                    navList.map(function (val, key) {
                        val.selected = false;
                        if (val.nodes.length) {
                            for (var i = 0, len = val.nodes.length; i < len; i++) {
                                val.nodes[i].selected = false;
                            }
                        }
                    });
                    return navList;
                } else {
                    navList.map(function (val, key) {
                        var selIndex = 0;
                        for (var i = 0; i < val.nodes.length; i++) {
                            for (var j = 0; j < routes.length; j++) {
                                if (val.nodes[i].id === routes[j]) {
                                    val.nodes[i].selected = true;
                                    selIndex++;
                                    break;
                                } else {
                                    val.nodes[i].selected = false;
                                    val.selected = false;
                                }
                            }
                        }
                        if (selIndex === val.nodes.length) {
                            val.selected = true;
                        }
                    });
                    return navList;
                }
            }

            /***
             * 改造发给后台的格式
             * @param navList 需要保存的navList
             * @returns {*}
             */
            function formateToServer(navList) {
                var formateData = [];
                var selPar = 0;//总栏目数
                for (var i = 0, ilen = navList.length; i < ilen; i++) {
                    for (var j = 0, jlen = navList[i].nodes.length; j < jlen; j++) {
                        selPar++;
                        navList[i].nodes[j].selected && formateData.push(navList[i].nodes[j].id);
                    }
                }
                return (formateData.length === selPar) ? ['*'] : formateData;
            }
        }
    ]);
}());

