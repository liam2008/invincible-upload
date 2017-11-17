(function () {
    var app = angular.module('app');

    app.controller('goodsManageCtrl', ['$scope', 'netManager', 'DTOptionsBuilder', 'SweetAlert',
        function ($scope, netManager, DTOptionsBuilder, SweetAlert) {
            //控制加载load-icon
            $scope.isLoad = true;
            $scope.productState = Smartdo.PRODUCT_STATE;
            $scope.dtOptions = DTOptionsBuilder.newOptions()
                .withDOM('<"html5buttons"B>lTfgitp')
                .withButtons([
                    {extend: 'excel', title: '商品管理'},
                    {extend: 'copy', title: '商品管理'},
                    {
                        text: '添加商品',
                        action: function (e, dt, node, config) {
                            $('#addGoodModule').modal('show')
                        }
                    }
                ]);

            $scope.dtOptionsNew = DTOptionsBuilder.newOptions();

            //渲染页面
            init();

            //修改保存数据
            $scope.saveData = function () {
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
                            var comfirmData = {
                                asin: $("[name='asin']").eq(0).html(),
                                seller_sku: $("[name='seller_sku']").eq(0).html(),
                                shop_name: $("[name='shop_name']").eq(0).html(),
                                projected_sales: $("[name='projected_sales']").eq(0).val(),
                                price: $("[name='price']").eq(0).val(),
                                state: parseInt($("[name='state']").eq(0).val()),
                                team_name: $('[name="teamNames"]').val()
                            };
                            netManager.post('/base/update', comfirmData).then(function (res) {
                                if (res.status === 200) {
                                    res.data ? swal("保存成功!", "success"):swal("保存失败!", "error");
                                    init();
                                }
                            }, function (err) {
                                console.err(err.code);
                                swal("保存失败!", "err.description", "error");
                            });
                        }
                    });
            };

            //添加商品
            var addGoods = {};
            addGoods.saveGoods = function(){
                SweetAlert.swal({
                        title: "你将添加商品",
                        text: "请确保数据无误!",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonText: "确定",
                        cancelButtonText: "取消",
                        closeOnConfirm: false
                    },
                    function (isConfirm) {
                        if (isConfirm) {
                            $("#addGoodModule").modal("hide");
                            var addGoodsData = {
                                asin: $scope.addGoods.asin,
                                seller_sku: $scope.addGoods.sellerSku,
                                FBA: $scope.addGoods.fba,
                                fnsku: $scope.addGoods.fnsku ? $scope.addGoods.fnsku : "",
                                store_sku: $scope.addGoods.storeSku,
                                name: $scope.addGoods.name,
                                shop_name: $scope.addGoods.shopName,
                                team_name: $scope.addGoods.teamName,
                                state: $scope.addGoods.state,
                                projected_sales: $scope.addGoods.projectedSales,
                                price: $scope.addGoods.price
                            };
                            console.log('addGoodsData',addGoodsData);
                            netManager.post('/base/saveMerchandise', addGoodsData).then(function (res) {
                                if (res.status === 200) {
                                    res.data ? swal("保存成功!", "success"):swal("保存失败!", "error");
                                    init();
                                    //清除之前的数据
                                    $scope.addGoods = null;
                                }
                            }, function (err) {
                                console.err(err.code);
                                swal("保存失败", "err.description", "error");
                            });
                        }
                    });

            };
            $scope.addGoods = addGoods;

            //库存sku选择
            $scope.chooseSKU = function($index){
                $scope.addGoods.nameCn = $scope.stockList[$index]['name_cn'];
                $scope.addGoods.storeSku = $scope.stockList[$index]['store_sku'];
            };

            //所属店铺选择
            $scope.chooseShop = function($index){
                $scope.addGoods.shopName = $scope.shopNames[$index]['_id'];
            };

            //初始化页面
            function init() {
                netManager.get('/base/list').then(function (res) {
                    var data = res.data;
                    var teamNames = res.data['team_name'];
                    var shopNames = res.data['shopsNames'];
                    data.list.map(function (val) {
                        val.url = Smartdo.Utils.getUrl(val['shop_name'],val['asin']);
                    });
                    console.log(data.list);
                    $scope.tableData = data.list;
                    $scope.stockList = data.stockList;
                    $scope.teamNames = teamNames;
                    $scope.shopNames = shopNames;
                    $scope.edit = function (index) {
                        index = index || 0;
                        $scope.modalData = data.list[index];
                        $('[name="projected_sales"]').val(data.list[index]['projected_sales']);
                        $('[name="price"]').val(data.list[index]['price']);
                        $('[name="state"]').val(data.list[index]['state']);
                        $('[name="teamNames"]').val(data.list[index]['team_name']);
                    };
                    $scope.isLoad = false;
                }, function (err) {
                    console.error(err);
                });
            }
        }
    ]);
}());