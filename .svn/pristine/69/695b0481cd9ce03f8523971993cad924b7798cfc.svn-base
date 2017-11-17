(function () {
    'use strict';

    var app = angular.module('app.daily.import',[]);
    app.controller('DailyImportController', ['$scope', 'netManager', 'notify',
        function ($scope, netManager, notify) {
            $scope.isreview = false;
            var dd = new Date().getDate() - 1;
            $scope.importDate = new Date().setDate(dd);

            //初始化
            netManager.get('/daily/import').then(function (res) {
                $scope.shopNamelist = res.data;
                $scope.shopName = '';
            }, function (err) {
                console.error(err);
            });

            //预览
            $scope.fnReview = function () {
                var contentHtml = $('#setContnet').val();
                var tableData = Smartdo.Utils.genTSVTable(contentHtml);

                //判断填写的数据和选择店铺名数据
                if (!tableData.length || !$scope.shopName) {
                    notify.config({
                        duration: 2000
                    });
                    notify({
                        message: '请选择店铺名,或输入为空或者格式错误！！！',
                        classes: 'alert-warning',
                        templateUrl: "views/common/notify.html"
                    });
                    return;
                } else {
                    $scope.isreview = true;
                }
                $scope.tableData = tableData;
            };

            //取消
            $scope.fnCancel = function () {
                clearView();
            };

            //确定
            $scope.fnSave = function ($q) {
                var sendData = {
                    time: $('#importDate').val(),
                    dataList: [],
                    shopName: $scope.shopName
                };
                var tableData = $scope.tableData;
                for (var i = 0; i < tableData.length; i++) {
                    sendData.dataList.push({
                        asin: tableData[i]['ASIN'],                   // ASIN
                        seller_sku: tableData[i]['SKU'],          // 卖家SKU
                        sales_volume: tableData[i]['昨日销量'],           // 销售量
                        unit_price: tableData[i]['昨日单价'],             // 销售单价
                        sales_price: tableData[i]['昨日净销售额'],            // 销售额
                        sellable_stock: tableData[i]['可售库存'],         // 可售库存
                        receipting_stock: tableData[i]['待收货库存'],       // 待收货库存
                        transport_stock: tableData[i]['转库中库存']        // 转库中库存
                    });
                }
                netManager.post('/daily/import/confirm', sendData)
                    .then(function (res) {
                        notify.config({
                            duration: 2000
                        });
                        notify({
                            message: '保存成功',
                            classes: 'alert-success',
                            templateUrl: 'views/common/notify.html'
                        });
                        clearView();
                    })
                    .catch(function (err) {
                        notify.config({
                            duration: 2000
                        });
                        notify({
                            message: '服务器连接不上，请联系程序员',
                            classes: 'alert-danger',
                            templateUrl: 'views/common/notify.html'
                        });
                        console.error(err);
                    });
            };

            //清除页面
            function clearView(){
                $('#setContnet').val('');
                $scope.isreview = false;
                $scope.shopName = '';
            }
        }]);
}());
