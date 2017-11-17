(function () {
    var app = angular.module('app.count.formula',[]);

    app.controller('formulaCtrl', ['$scope', 'netManager', 'SweetAlert',
        function ($scope, netManager, SweetAlert) {
            //初始化
            init();

            //编辑
            $scope.edit = function ($index) {
                if ($scope.formula.selEdit[$index]) {//编辑之后保存
                    SweetAlert.swal({
                            title: "你确定编辑数据?",
                            text: "你将编辑此条数据!",
                            type: "warning",
                            showCancelButton: true,
                            confirmButtonText: "确定",
                            cancelButtonText: "取消"
                        },
                        function (isConfirm) {
                            if (isConfirm) {
                                var updateData = {
                                    'name': $scope.formula.defaultList[$index].name,
                                    '_id': $scope.formula.defaultList[$index]['_id'],
                                    'explain': $scope.formula.defaultList[$index]['explain']
                                };
                                console.log('updateData', updateData);
                                netManager.post('/count/updateFormula', updateData).then(function (res) {
                                    if (res.status === 200) {
                                        if (!res.data) {
                                            swal("编辑失败", "编辑失败,请重新编辑保存", "error");
                                            init();
                                        }
                                    }
                                }, function (error) {
                                    console.error(error.code);
                                    swal("编辑失败", error.description, "error");
                                });
                            }
                        });
                }
                //切换
                $scope.formula.selEdit[$index] = !$scope.formula.selEdit[$index];
            };

            //删除
            $scope.deleteItem = function ($index) {
                SweetAlert.swal({
                        title: "你确定删除数据?",
                        text: "你将删除此条数据!",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonText: "确定",
                        cancelButtonText: "取消"
                    },
                    function (isConfirm) {
                        if (isConfirm) {
                            var deleteData = {
                                '_id': $scope.formula.defaultList[$index]['_id']
                            };
                            console.log('deleteData', deleteData);
                            netManager.post('/count/deleteFormula', deleteData).then(function (res) {
                                if (res.status === 200) {
                                    res.data ? swal("删除成功!", "success") : swal("删除失败!", "error");
                                    init();
                                }
                            }, function (error) {
                                console.error(error.code);
                                swal("删除失败", error.description, "error");
                            });
                        }
                    });
            };

            //添加
            $scope.addItem = function () {
                if (!$scope.formula.explain) {
                    SweetAlert.swal("添加内容不能为空!");
                    return;
                }
                var addData = {
                    'name': $scope.formula.selOption,
                    'explain': $scope.formula.explain
                };
                console.log('addItem', addData);
                netManager.post('/count/saveFormula', addData).then(function (res) {
                    if (res.status === 200) {
                        res.data ? SweetAlert.swal("保存成功!", "success") : SweetAlert.swal("保存失败!", "error");
                        init();
                        $scope.formula.selected = $scope.formula.selOption;
                    }
                }, function (error) {
                    console.error(error.code);
                    SweetAlert.swal("保存失败", error.description, "error");
                });

            };

            //页面刷新
            function init() {
                var formula = {};
                //控制编辑、保存切换
                formula.selEdit = [];
                formula.optList = [];
                formula.regName = {
                    'merFriFreight': '商品头程运费（RMB￥）',
                    'commission': '佣金（USD$）',
                    'fulfillmentCost': 'Fulfillment cost（USD$）',
                    'platformCost': '平台费用（USD$）',
                    'cost': '成本（RMB￥）',
                    'netReceipts': '实收（RMB￥）',
                    'profit': '毛利 (RMB￥）',
                    'profitRate': '毛利率',
                    'dailyProfit': '日毛利（RMB￥）',
                    'monthTurnover': '月营业额（USD$）',
                    'monthProfit': '月利润（USD$）'
                };
                $scope.formula = formula;
                var a = 'meichandisePrice';
                $scope.isLoad = true;
                netManager.get('/count/listFormula').then(function (res) {
                    var regList = [];
                    for(var key in $scope.formula.regName){
                        regList.push(key);
                    };
                    res.data.map(function (val, key) {
                        var index = regList.indexOf(val.name);
                        index != -1 && regList.splice(index, 1);
                    });
                    $scope.formula.optList = regList;
                    if (regList.length === 0) {
                        $scope.formula.isDisable = true;
                    }
                    $scope.formula.defaultList = res.data;
                }, function (error) {
                    console.error(error.code);
                });
                $scope.isLoad = false;
            }

        }
    ]);
}());