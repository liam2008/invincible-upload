(function () {
    var app = angular.module('app');
    app.controller('rolesManageCtrl', ['$scope', 'netManager', 'DTOptionsBuilder', 'SweetAlert','$q',
        function ($scope, netManager, DTOptionsBuilder, SweetAlert,$q) {
            $scope.dtOptions = DTOptionsBuilder.newOptions();
            //渲染页面
            init();

            //编辑
            var editData = {};
            $scope.toggle = function (scope) {
                scope.toggle();
            };
            $scope.collapseAll = function () {
                $scope.$broadcast('angular-ui-tree:collapse-all');
                editData.collapsedAll = true;
            };
            $scope.expandAll = function () {
                $scope.$broadcast('angular-ui-tree:expand-all');
                editData.collapsedAll = false;
            };

            //点击编辑
            $scope.edit = function ($index) {
                init().then(function(){
                    $scope.editData = {
                        collapsedAll:true,
                        type:$scope.showList[$index].type,
                        name:$scope.showList[$index].name,
                        routes:$scope.showList[$index].routes,
                        addrid:$scope.showList[$index]['_id']
                    };
                    formatRenderData($scope.editData.routes);
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
                        closeOnCancel: false
                    },
                    function (isConfirm) {
                        if (isConfirm) {
                            var saveData = {};
                            var serverData = [];
                            var navList = $scope.navList;
                            var selPar = 0;//总栏目数
                            for (var i = 0, ilen = navList.length; i < ilen; i++) {
                                for (var j = 0, jlen = navList[i].nodes.length; j < jlen; j++) {
                                    selPar++;
                                    navList[i].nodes[j].selected && serverData.push(navList[i].nodes[j].id);
                                }
                            }
                            if (serverData.length === selPar) {
                                serverData = ['*'];
                            }
                            saveData.routes = serverData;
                            netManager.put('/roles/'+addrId, saveData).then(function (res) {
                                swal("保存成功!", "success");
                                init();
                            }, function (err) {
                                console.err(err.code);
                                swal("保存失败!", "err.description", "error");
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

            $scope.editData = editData;

            //初始化页面
            function init() {
                var dfd = $q.defer();
                $scope.isLoad = true;
                netManager.get('/roles').then(function (res) {
                    $scope.showList = res.data;
                    $scope.isLoad = false;
                    dfd.resolve();
                }, function (err) {
                    console.error(err);
                    dfd.reject();
                });
                return dfd.promise;
            }

            //改造后台传来的格式
            function formatRenderData(routes) {
                if (routes.length === 1 && routes[0] === '*') {
                    $scope.navList = angular.copy($scope.$parent.navList);
                } else if (routes.length) {
                    $scope.navList.map(function (val, key) {
                        for (var i = 0; i < val.nodes.length; i++) {
                            for (var j = 0; j < routes.length; j++) {
                                if (val.nodes[i].id === routes[j]) {
                                    val.nodes[i].selected = true;
                                    return;
                                } else {
                                    val.nodes[i].selected = false;
                                    val.selected = false;
                                }
                            }
                        }
                    });
                }
            }
        }
    ]);
}());

