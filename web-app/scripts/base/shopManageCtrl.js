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
                            //初始化
                            $scope.addShopData = {};
                            $scope.formAdd.submitted = false;
                            $scope.$digest();
                            $('#addShopModal').modal('show')
                        }
                    }
                ]);

            //初始页面
            init();

            //点击编辑
            $scope.edit = function (index) {
                $scope.index = index;
                $scope.editData = {
                    name:$scope.tableData[index].name,
                    id:$scope.tableData[index].id,
                    sellerId:$scope.tableData[index].sellerId
                };
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
                        closeOnConfirm: false
                    },
                    function (isConfirm) {
                        if (isConfirm) {
                            var confirmData =  {
                                name: $scope.editData.name,
                                id: $scope.editData.id,
                                sellerId:$scope.editData.sellerId
                            };
                            netManager.post('/base/updateShops',confirmData).then(function (res) {
                                if (res.status === 200) {
                                    swal("保存成功!", "success");
                                    angular.extend($scope.tableData[$scope.index],confirmData);
                                }
                            }, function (err) {
                                swal("保存失败", err.description, "error");
                                console.error(err.code);
                            });
                        }
                    });
            };

            //增加店铺
            $scope.addShop = function () {
                $scope.formAdd.submitted = true;
                if($scope.formAdd.$valid){
                    var sendData = {
                        name:$scope.addShopData.name || null,
                        sellerId:$scope.addShopData.sellerId || null
                    };
                    console.log('sendData', sendData);
                    netManager.post('/base/addShops',sendData).then(function (res) {
                        if (res.status === 200) {
                            $('#addShopModal').modal('hide');
                            swal("保存成功!", "success");
                            init();
                        }
                    }, function (err) {
                        swal("保存失败", err.description, "error");
                        console.error(err.code);
                    });
                }
            };

            //初始化页面
            function init(){
                netManager.get('/base/shops').then(function (res) {
                	$scope.tableData = res.data.list;
                	$scope.authority = res.data.rights;
                	
                	if(!$scope.authority.add){
                		delete $scope.dtOptions['buttons'][0];
                	}
                    $scope.isLoad = false;
                }, function (err) {
                    console.error(err);
                });
            }
        }
    ]);

}());