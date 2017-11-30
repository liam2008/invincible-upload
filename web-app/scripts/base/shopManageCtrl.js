(function () {
    var app = angular.module('app.base.shopManage',[]);
    app.controller('shopManageCtrl', ['$scope', 'netManager', 'DTOptionsBuilder', 'SweetAlert',
        function ($scope, netManager, DTOptionsBuilder, SweetAlert) {
            $scope.productState = Smartdo.PRODUCT_STATE;
            $scope.dtOptions = DTOptionsBuilder.newOptions()
                .withDOM('<"html5buttons"B>lTfgitp')
                .withButtons([
                    {
                        text: '增加店铺',
                        action: function (e, dt, node, config) {
                            $('#addShopModal').modal('show')
                        }
                    }
                ]);

            //初始页面
            init();

            //修改保存数据
            $scope.saveData = function () {
                if (checkFormat($scope.shopName)) {
                    SweetAlert.swal({
                            title: "你确定修改吗?",
                            text: "你将修改此条数据!",
                            type: "warning",
                            showCancelButton: true,
                            confirmButtonText: "确定",
                            cancelButtonText: "取消",
                            closeOnConfirm: false
                        },
                        function (isConfirm) {
                            if (isConfirm) {
                                console.log($scope.shopName);
                                netManager.post('/base/updateShops', {
                                    name: $scope.shopName,
                                    id: $scope.id,
                                    sellerId:$scope.sellerId
                                }).then(function (res) {
                                    if (res.status === 200) {
                                        swal("保存成功!", "success");
                                        init();
                                    }
                                }, function (err) {
                                    swal("保存失败", err.description, "error");
                                    console.error(err.code);
                                });

                            }
                        });
                } else {
                    swal("格式出错!", "warning");
                }
            };

            //增加店铺
            $scope.addShop = function () {
                console.log('addShopName',$scope.addShopName);
                if(!$scope.addShopName){
                    swal("店铺名称不能为空!", "warning");
                    return;
                }
                if (checkFormat($scope.addShopName)) {
                    SweetAlert.swal({
                            title: "你确定增加吗?",
                            text: "你将增加店铺!",
                            type: "warning",
                            showCancelButton: true,
                            confirmButtonText: "确定",
                            cancelButtonText: "取消",
                            closeOnConfirm: false
                        },
                        function (isConfirm) {
                            if (isConfirm) {
                                netManager.post('/base/addShops', {name: $scope.addShopName,sellerId:$scope.addSellerId}).then(function (res) {
                                    if (res.status === 200) {
                                        swal("保存成功!", "success");
                                        init();
                                    }
                                }, function (err) {
                                    swal("保存失败", err.description, "error");
                                    console.error(err.code);
                                });

                            }
                        });
                } else {
                    swal("格式出错!,正确格式参考", "warning");
                }
            };

            //检查格式
            function checkFormat(str) {
                var reg = /^AMAZON\-[0-9a-zA-Z]+\-(US|UK|JP|DE)$/ig;
                return reg.test(str);
            }

            //初始化页面
            function init(){
                //渲染页面
                netManager.get('/base/shops').then(function (res) {
                    $scope.tableData = res.data;
                    $scope.edit = function (index) {
                        $scope.shopName = res.data[index].name;
                        $scope.id = res.data[index].id;
                        $scope.sellerId = res.data[index].sellerId;
                    };
                    $scope.isLoad = false;
                }, function (err) {
                    console.error(err);
                });
            }
        }
    ]);

}());