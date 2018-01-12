(function () {
    var app = angular.module('app.base.goodsManage', []);

    app.controller('goodsManageCtrl', ['$scope', 'netManager', 'DTOptionsBuilder', 'DTColumnDefBuilder', 'SweetAlert', '$filter','notify',
        function ($scope, netManager, DTOptionsBuilder, DTColumnDefBuilder, SweetAlert, $filter,notify) {
            $scope.dtOptionsNew = DTOptionsBuilder.newOptions();

            $scope.productState = Smartdo.PRODUCT_STATE;

            //渲染页面
            notify.config({
                duration:2000
            });

            init();

            //点击编辑
            $scope.edit = function (index) {
                console.log('index', index);
                $scope.index = index;
                var editItem = $scope.tableOption.tableList[index];
                $scope.modalData = {
                    'asin': editItem.asin,
                    'sellerSku': editItem.sellerSku,
                    'shop': editItem.shop,
                    'nameCN': editItem.nameCN,
                    'price': editItem.price,
                    'team': editItem.team,
                    'state': String(editItem.state),
                    'projectedSales': editItem['projectedSales'],
                    'storeSku': editItem['storeSku'],
                    'productId': editItem['productId'],
                    'shelfTime': editItem['shelfTime'] || null
                }
            };

            //编辑保存数据
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
                            console.log('$scope.modalData', $scope.modalData);
                            var comfirmData = {
                                "asin": $scope.modalData.asin,
                                "sellerSku": $scope.modalData.sellerSku,
                                "shopId": $scope.modalData.shop.shopId,
                                "nameCN": $scope.modalData.nameCN,
                                "productId": $scope.modalData.productId,
                                "price": Number($scope.modalData.price) || 0,
                                "teamId": $scope.modalData.team.teamId,
                                "state": Number($scope.modalData.state) || 0,
                                "projectedSales": Number($scope.modalData['projectedSales']) || 0,
                                "shelfTime": $scope.modalData['shelfTime'] ? moment($scope.modalData['shelfTime']).format('YYYY-MM-DD') : null
                            };
                            console.log('comfirmData', comfirmData);
                            netManager.post('/base/update', comfirmData).then(function (res) {
                                notify({
                                    message: '编辑成功',
                                    classes: 'alert-success',
                                    templateUrl: 'views/common/notify.html',
                                    duration: 200
                                });
                                angular.extend($scope.tableOption.tableList[$scope.index], $scope.modalData,{shelfTime:comfirmData.shelfTime});
                                var editIndex = ($scope.tableOption.currentPage-1)*$scope.tableOption.itemsPerPage+$scope.index;
                                angular.extend($scope.tableOption.initList[editIndex], $scope.modalData,{shelfTime:comfirmData.shelfTime});
                            }, function (err) {
                                console.error(err);
                                notify({
                                    message: '编辑失败,'+ err.data.description,
                                    classes: 'alert-danger',
                                    templateUrl: 'views/common/notify.html',
                                    duration: 200
                                });
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
                        FBA: $scope.addGoods.fba ? Number($scope.addGoods.fba) : null,
                        fnsku: $scope.addGoods.fnsku || null,
                        productId: $scope.addGoods.productId,
                        name: $scope.addGoods.name || null,
                        shopId: $scope.addGoods.shop.shopId,
                        teamId: $scope.addGoods.team.teamId,
                        state: Number($scope.addGoods.state),
                        projectedSales: $scope.addGoods['projectedSales'] || null,
                        price: Number($scope.addGoods.price) || null
                    };
                    console.log('addGoodsData', addGoodsData);
                    netManager.post('/base/saveMerchandise', addGoodsData).then(function (res) {
                        if (res.status === 200) {
                            notify({
                                message: '添加成功',
                                classes: 'alert-success',
                                templateUrl: 'views/common/notify.html',
                                duration: 200
                            });
                            init();
                            $scope.addGoods = null;
                        }
                    }, function (err) {
                        notify({
                            message: '添加失败,'+ err.data.description,
                            classes: 'alert-danger',
                            templateUrl: 'views/common/notify.html',
                            duration: 200
                        });
                        $scope.formAdd.submitted = false;
                        console.err(err.code);
                    });
                }
            };
            $scope.addGoods = addGoods;

            //删除
            $scope.delete = function (index) {
                SweetAlert.swal({
                        title: "你确定删除吗?",
                        text: "你将删除此条数据!",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonText: "确定",
                        cancelButtonText: "取消",
                        closeOnConfirm: true,
                        closeOnCancel: true
                    },
                    function (isConfirm) {
                        if (isConfirm) {
                            var id = $scope.tableOption.tableList[index].id;
                            netManager.delete('/base/deleteMerd/' + id).then(function (res) {
                                $scope.tableOption.tableList.splice(index,1);
                                var editIndex = ($scope.tableOption.currentPage-1)*$scope.tableOption.itemsPerPage+index;
                                $scope.tableOption.initList.splice(editIndex,1);
                                notify({
                                    message: '删除成功',
                                    classes: 'alert-success',
                                    templateUrl: 'views/common/notify.html',
                                });
                            }, function (err) {
                                console.error('error', err.data.description);
                                notify({
                                    message: '删除失败,'+ err.data.description,
                                    classes: 'alert-danger',
                                    templateUrl: 'views/common/notify.html',
                                });
                            });
                        }
                    });
            };

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
                if ($('#editRow').css('display') === 'block') {
                    $scope.modalData.shop = shop;
                } else {
                    $scope.addGoods.shop = shop;
                }
            };

            //所属小组选择
            $scope.chooseTeam = function (team) {
                if ($('#editRow').css('display') === 'block') {
                    $scope.modalData.team = team;
                } else {
                    $scope.addGoods.team = team;
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
                        var country, addr;
                        if (val.shop.name) {
                            country = val.shop.name.split('-')[2]
                        } else {
                            country = "US"
                        }
                        addr = Smartdo.SIDE_ADDR[country];
                        val.url = 'http://www.amazon.' + addr + '/dp/' + val['asin'];
                    });

                    var tableOption = new Table();
                    tableOption.init(data.list);
                    $scope.tableOption = tableOption;

                    $scope.stockList = data.stockList;
                    $scope.shopNames = shopNames;

                    $scope.rights = data.rights;

                    $scope.teamList = res.data.teamList;

                    $scope.isLoad = false;
                }, function (err) {
                    console.error(err);
                });
            }


            //table 方法
            function Table(){
                this.initList= [];//初始化数
                this.searchList=[];//保存搜索出来
                this.tableList=[];//呈现在页面的数据
                this.itemsPerPage= 10;
                this.totalItems= 0;
                this.currentPage= 1;
                this.searchData=''
            }
            Table.prototype = {
                constructor:Table,
                pageChangeFn: function () {
                    var skip = (this.currentPage - 1) * this.itemsPerPage;
                    if(this.searchData){//有搜索内容
                        this.tableList = angular.copy(this.searchList).splice(skip, this.itemsPerPage);
                        this.totalItems = this.searchList.length;
                    }else{//没有搜索内容
                        this.tableList = angular.copy(this.initList).splice(skip, this.itemsPerPage);
                        this.totalItems = this.initList.length;
                    }
                },
                searchFn: function () {
                    if(!this.searchData){//没有搜索内容
                        this.currentPage = 1;
                    }
                    this.searchList =  $filter('filter')(angular.copy(this.initList), this.searchData);
                    this.pageChangeFn();
                },
                init: function (renderList) {
                    this.initList = renderList;
                    this.pageChangeFn();
                }
            };

        }
    ]);
}());