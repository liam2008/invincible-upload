(function () {
    var app = angular.module('app.base.goodsManage', []);

    app.controller('goodsManageCtrl', ['$scope', 'netManager', 'DTOptionsBuilder', 'SweetAlert',
        function ($scope, netManager, DTOptionsBuilder, SweetAlert) {
            $scope.productState = Smartdo.PRODUCT_STATE;
            $scope.dtOptions = DTOptionsBuilder.newOptions()
                .withDOM('<"html5buttons"B>lTfgitp')
                .withButtons([
                    {extend: 'excel', title: '商品管理'},
                    {extend: 'copy', title: '商品管理'},
                    {
                        text: '添加商品',
                        action: function (e, dt, node, config) {
                            $scope.addGoods = {};
                            $scope.formAdd.submitted = false;
                            $scope.$digest();
                            $('#addGoodModule').modal('show')
                        }
                    }
                ]);

            $scope.dtOptionsNew = DTOptionsBuilder.newOptions();

            //渲染页面
            init();

            //点击编辑
            $scope.edit = function (index) {
                $scope.index = index;
                var editItem = $scope.tableData[index];
                $scope.modalData = {
                    'asin': editItem.asin,
                    'sellerSku': editItem.sellerSku,
                    'shop': editItem.shop,
                    'nameCN': editItem.nameCN,
                    'price': editItem.price,
                    'teamName': editItem.teamName,
                    'state': String(editItem.state),
                    'projectedSales': editItem['projectedSales'],
                    'storeSku': editItem['storeSku'],
                    'productId': editItem['productId']
                }
            };

            //修改保存数据
            $scope.saveData = function () {
                SweetAlert.swal({
                        title: "你确定修改吗?",
                        text: "你将修改此条数据!",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonText: "确定",
                        cancelButtonText: "取消",
                        closeOnConfirm: true,
                        closeOnCancel: true
                    },
                    function (isConfirm) {
                        if (isConfirm) {
                            $scope.teamList.forEach(function (val) {
                                if (val.name === $scope.modalData.teamName) {
                                    $scope.modalData.teamId = val['_id'];
                                    return;
                                }
                            });
                            console.log('$scope.modalData', $scope.modalData);

                            var comfirmData = {
                                "asin": $scope.modalData.asin,
                                "sellerSku": $scope.modalData.sellerSku,
                                "shopId": $scope.modalData.shop.shopId,
                                "nameCN": $scope.modalData.nameCN,
                                "productId": $scope.modalData.productId,
                                "price": Number($scope.modalData.price) || 0,
                                "teamId": $scope.modalData.teamId,
                                "state": Number($scope.modalData.state) || 0,
                                "projectedSales": Number($scope.modalData['projectedSales']) || 0
                            };
                            console.log('teamId', $scope.modalData.teamId);
                            console.log('comfirmData', comfirmData);
                            netManager.post('/base/update', comfirmData).then(function (res) {
                                swal("保存成功!", "success");
                                angular.extend($scope.tableData[$scope.index],$scope.modalData);
                            }, function (err) {
                                console.err(err);
                                swal("保存失败!", err.data.description, "error");
                            });
                        }
                    });
            };

            //添加商品
            var addGoods = {};
            $scope.saveGoods = function () {
                $scope.formAdd.submitted = true;
                if ($scope.formAdd.$valid) {
                    $("#addGoodModule").modal("hide");
                    var addGoodsData = {
                        asin: $scope.addGoods.asin,
                        sellerSku: $scope.addGoods.sellerSku,
                        FBA: $scope.addGoods.fba?Number( $scope.addGoods.fba):null,
                        fnsku: $scope.addGoods.fnsku || null,
                        productId: $scope.addGoods.productId,
                        name: $scope.addGoods.name || null,
                        shopId: $scope.addGoods.shopId,
                        teamId: $scope.addGoods.teamId,
                        state: Number($scope.addGoods.state),
                        projectedSales: $scope.addGoods['projectedSales'] || null,
                        price: Number($scope.addGoods.price) || null
                    };
                    console.log('addGoodsData', addGoodsData);
                    netManager.post('/base/saveMerchandise', addGoodsData).then(function (res) {
                        if (res.status === 200) {
                            res.data ? swal("保存成功!", "success") : swal("保存失败!", "error");
                            init();
                            //清除之前的数据
                            $scope.addGoods = null;
                        }
                    }, function (err) {
                        console.err(err.code);
                        swal("保存失败", "err.description", "error");
                    });
                }
            };
            $scope.addGoods = addGoods;

            //库存sku选择
            $scope.chooseSKU = function (stockItem) {
                console.log('stockItem', stockItem);
                //多了一项中文名
                if ($('#editRow').css('display') === 'block') {
                    $scope.modalData.nameCN = stockItem['name_cn'];
                    $scope.modalData.storeSku = stockItem['store_sku'];
                    $scope.modalData.productId = stockItem['_id'];
                } else {
                    $scope.addGoods.skuName = stockItem['name_cn'];
                    $scope.addGoods.storeSku = stockItem['store_sku'];
                    $scope.addGoods.productId = stockItem['_id'];
                }
            };

            //所属店铺选择
            $scope.chooseShop = function (shop) {
                $scope.addGoods.shopName = shop['name'];
                $scope.addGoods.shopId = shop['_id'];
            };

            //所属小组选择
            $scope.chooseTeam = function (team) {
                if ($('#editRow').css('display') === 'block') {
                    $scope.modalData.teamName = team.name;
                    $scope.modalData.teamId = team['_id'];
                } else {
                    $scope.addGoods.teamName = team.name;
                    $scope.addGoods.teamId = team['_id'];
                }
            };

            //初始化页面
            function init() {
                $scope.isLoad = true;
                netManager.get('/base/list').then(function (res) {
                    res.data = JSON.parse(Smartdo.Utils.pakoUnzip(res.data));
                    var data = res.data;
                    console.log('res.data', res.data);
                    var shopNames = res.data['shopsNames'];
                    data.list.map(function (val) {
                        var country,addr;
                        if(val.shop.name){
                            country = val.shop.name.split('-')[2]
                        }else{
                            country = "US"
                        }
                        var addr = Smartdo.SIDE_ADDR[country];
                        val.url = 'http://www.amazon.' + addr + '/dp/' + val['asin'];
                    });
                    $scope.tableData = data.list;
                    console.log('tableData', $scope.tableData);
                    $scope.stockList = data.stockList;
                    $scope.shopNames = shopNames;
                    $scope.isLoad = false;
                }, function (err) {
                    console.error(err);
                });

                //取小组
                netManager.get('/teams').then(function (res) {
                    console.log('teamList', res.data);
                    $scope.teamList = res.data;
                }, function (err) {
                    console.error(err);
                });

            }
        }
    ]);
}());