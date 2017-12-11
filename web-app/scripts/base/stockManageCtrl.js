(function () {
    var app = angular.module('app.base.stockManage',[]);

    app.controller('stockManageCtrl', ['$scope', 'netManager', 'DTOptionsBuilder', 'SweetAlert',
        function ($scope, netManager, DTOptionsBuilder, SweetAlert) {
            $scope.dtOptions = DTOptionsBuilder.newOptions()
                .withDOM('<"html5buttons"B>lTfgitp')
                .withButtons([
                    {extend: 'excel', title: '产品库存管理'},
                    {extend: 'copy', title: '产品库存管理'},
                    {
                        text: '添加产品库存',
                        action: function (e, dt, node, config) {
                            //初始化
                            $scope.addStore = {};
                            $scope.formAdd.submitted = false;
                            $scope.$digest();
                            $('#addGoodModule').modal('show')
                        }
                    }
                ]);

            //渲染页面
            init();

            //编辑页面数据
            $scope.edit = function (index) {
                $scope.index = index;
                $scope.editData = {
                    'store_sku':$scope.tableData[index]['store_sku'],
                    'name_cn':$scope.tableData[index]['name_cn'],
                    'id':$scope.tableData[index]['id']
                };
            };

            //修改保存数据
            $scope.saveEdit = function () {
                SweetAlert.swal({
                        title: "你将编辑数据?",
                        text: "你确定编辑此条数据!",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonText: "确定",
                        cancelButtonText: "取消",
                        closeOnConfirm: false
                    },
                    function (isConfirm) {
                        if (isConfirm) {
                            var confirmData = {
                                'store_sku': $scope.editData['store_sku'],
                                'name_cn': $scope.editData['name_cn'],
                                'id': $scope.editData['id']
                            };
                            console.log('send', confirmData);
                            netManager.post('/base/updateProduct', confirmData).then(function (res) {
                                if (res.status === 200) {
                                    swal("保存成功!", "success");
                                    angular.extend($scope.tableData[$scope.index],confirmData);
                                }
                            }, function (error) {
                                swal("保存失败", error.description, "error");
                            });
                        }
                    });
            };

            //添加商品
            var addStore = {};
            $scope.saveStore = function () {
                $scope.formAdd.submitted = true;
                if($scope.formAdd.$valid){
                    var sendData = {
                        'store_sku': $scope.addStore['store_sku'],
                        'name_cn': $scope.addStore['name_cn']
                    };
                    console.log('sendData', sendData);
                    netManager.post('/base/saveProduct', sendData).then(function (res) {
                        if (res.status === 200) {
                            $('#addGoodModule').modal('hide');
                            swal("保存成功!", "success");
                            init();
                        }
                    }, function (err) {
                        console.error(err.code);
                        swal("保存失败", "err.description", "error");
                    });
                }
            };
            $scope.addStore = addStore;

            //查看记录
            var logData = {};
            logData.dtOptions = DTOptionsBuilder.newOptions();
            logData.checkLog = function (id) {
                $scope.logData.id = id;
                $scope.logData.startDate = moment().subtract('1','months').startOf('months').format('YYYY-MM-DD');
                $scope.logData.endDate = moment().format('YYYY-MM-DD');
                renderLogData(id,$scope.logData.startDate,$scope.logData.endDate);
            };
            logData.checkDateLog = function () {
                var startDate = moment($scope.logData.startDate).format('YYYY-MM-DD');
                var endDate = moment($scope.logData.endDate).format('YYYY-MM-DD');
                renderLogData($scope.logData.id, startDate, endDate);
            };
            $scope.logData = logData;

            //渲染日志页面
            function renderLogData(id, startTime, endTime) {
                var sendData = {
                    'id': id,
                    'startTime': startTime || moment().format('YYYY-MM-DD'),
                    'endTime': endTime || moment().format('YYYY-MM-DD')
                };
                console.log('sendData', sendData);
                netManager.post('/base/StoreJournal', sendData).then(function (res) {
                    $scope.logData.recordList = res.data.storeJournalList;
                }, function (err) {
                    console.error(err);
                });

            }

            //初始化页面
            function init() {
                //控制加载load-icon
                $scope.isLoad = true;
                netManager.get('/base/product').then(function (res) {
                    res.data = JSON.parse(Smartdo.Utils.pakoUnzip(res.data));
                    $scope.tableData = res.data.stockList;
                    $scope.isLoad = false;
                }, function (err) {
                    console.error(err);
                });
            }
        }
    ]);


}());