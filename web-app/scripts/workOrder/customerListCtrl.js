(function () {
    var app = angular.module('app.workOrder.customerList', []);

    app.controller('customerListCtrl', ['$scope', 'netManager', 'DTOptionsBuilder', 'DTColumnDefBuilder', 'SweetAlert',
        function ($scope, netManager, DTOptionsBuilder, DTColumnDefBuilder, SweetAlert) {
            $scope.productState = Smartdo.PRODUCT_STATE;
            $scope.dtOptions = DTOptionsBuilder.newOptions()
                .withDOM('<"html5buttons"B>lTfgitp')
                .withButtons([
                    {extend: 'excel', title: '客服任务分配表'},
                    {extend: 'copy', title: '客服任务分配表'}
                ]);

            //初始化数据
            $scope.typeList = [
                {id: 1, name: '评论异常'},
                {id: 2, name: '发现跟单'},
                {id: 3, name: 'Lightning Deals'},
                {id: 4, name: '销售权限'},
                {id: 5, name: '品牌更改'},
                {id: 6, name: '店铺IP问题'},
                {id: 0, name: '其他'}
            ];

            $scope.dtInstance = {};
            $scope.chooseData = {};

            //渲染页面
            init();

            //添加商品
            $scope.add = function () {
                $scope.formAdd.submitted = true;
                if ($scope.formAdd.$valid) {
                    var sendData = {
                        operateTeam: $scope.chooseData.operateTeam ? angular.fromJson($scope.chooseData.operateTeam).id : null,
                        WOType: $scope.chooseData.WOType ? $scope.chooseData.WOType : null,
                        customerID: angular.fromJson($scope.chooseData.customer).id
                    };
                    console.log('sendData', sendData);
                    netManager.post('/workOrder/saveCustomer', sendData).then(function (res) {
                        swal("保存成功!", "success");
                        $scope.formAdd.submitted = false;
                        init();
                    }, function (err) {
                        console.error(err.code);
                        swal("保存失败", err.data.description, "error");
                    });
                }
            };

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
                            var postData = {
                                WOCustomerID: $scope.tableData[index].WOCustomerID
                            };
                            console.log('postData', postData);
                            netManager.post('/workOrder/deleteCustomer', postData).then(function (res) {
                                $scope.dtInstance.DataTable.rows(index).remove().draw();
                            }, function (err) {
                                console.error('error', err.data.description);
                                swal("删除失败!", err.data.description, "error")
                            });
                        }
                    });
            };

            //编辑
            $scope.edit = function (index) {
                $scope.index = index;
                $scope.editData = {
                    WOCustomerID: $scope.tableData[index].WOCustomerID,
                    operateTeam: $scope.tableData[index].operateTeam == "全部" ? null : $scope.tableData[index].operateTeam,
                    WOType: $scope.tableData[index].WOType == "全部" ? null : $scope.tableData[index].WOType,
                    customer: $scope.tableData[index].customer
                };

                var teamContent = '全部',customerContent="全部";
                if($scope.editData.operateTeam){
                    teamContent = $scope.editData.operateTeam.name
                }

                if($scope.editData.customer){
                    customerContent = $scope.editData.customer.name
                }

                $('[name="formEdit"]').find('.chosen-single').eq(0).text(teamContent);
                $('[name="formEdit"]').find('.chosen-single').eq(2).text(customerContent);
            };

            //保存编辑
            $scope.saveEdit = function () {
                $scope.formEdit.submitted = true;
                if ($scope.formEdit.$valid) {
                    var sendData = {
                        WOCustomerID: $scope.editData.WOCustomerID,
                        operateTeam: $scope.editData.operateTeam ? $scope.editData.operateTeam.id : null,
                        WOType: $scope.editData.WOType,
                        customerID: $scope.editData.customer ? $scope.editData.customer.id : null
                    };
                    console.log('editData', sendData);
                    netManager.post('/workOrder/updateCustomer', sendData).then(function (res) {
                        swal("编辑成功!", "success");
                        console.log('$scope.editData', $scope.editData);
                        angular.extend($scope.tableData[$scope.index], {
                            WOCustomerID: $scope.editData.WOCustomerID,
                            operateTeam: $scope.editData.operateTeam === null ? "全部" : angular.fromJson($scope.editData.operateTeam),
                            WOType: $scope.editData.WOType === null ? "全部" : $scope.editData.WOType,
                            customer: angular.fromJson($scope.editData.customer)
                        });
                        $scope.formEdit.submitted = false;
                        $('#editRow').modal('hide');
                    }, function (err) {
                        console.error(err);
                        swal("保存失败!", err.data.description, "error");
                    });
                }
            };

            //初始化页面
            function init() {
                $scope.isLoad = true;
                console.log('chooseData', $scope.chooseData);
                netManager.get('/workOrder/customerList', $scope.chooseData).then(function (res) {
                    console.log('res', res.data);
                    $scope.teamList = res.data.team;
                    $scope.customersList = res.data.customers;
                    $scope.tableData = res.data.list;
                    $scope.isLoad = false;
                }, function (err) {
                    console.error(err);
                });
            }
        }
    ]);
}());