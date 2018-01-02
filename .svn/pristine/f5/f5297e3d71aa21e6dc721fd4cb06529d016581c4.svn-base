(function () {
    var app = angular.module('app.workOrder.dealingOrder', []);

    app.controller('dealingOrderCtrl', ['$scope', '$filter', 'netManager', 'SweetAlert', 'DTOptionsBuilder',
        function ($scope, $filter, netManager, SweetAlert, DTOptionsBuilder) {
            //初始化数据
            var initData; //保存tableData
            $scope.tabItem = [false, false, false, false, false];
            $scope.dtOptions = DTOptionsBuilder.newOptions()
                .withDOM('<"html5buttons"B>lTfgitp')
                .withButtons([{
                    extend: 'copy'
                }, {
                    extend: 'excel',
                    title: '待处理订单'
                }]);

            //table实例
            $scope.dtInstance = {};

            //窗口打开状态
            $scope.state = {
                home: true,
                handle: false,
                send: false
            };

            //编辑index
            var editIndex;
            var formEdit;

            init();

            //取消
            $scope.cancelHandle = function () {
                formEdit = false;
                $scope.state.home = true;
                $scope.state.handle = false;
            };

            //点击筛选
            $scope.dataFilter = function (tabItem) {
                for (var i = 0, iLen = $scope.tabItem.length; i < iLen; i++) {
                    if (tabItem == i) {
                        $scope.tabItem[i] = true;
                    } else {
                        $scope.tabItem[i] = false;
                    }
                }
                switch (tabItem) {
                    case 0:
                        $scope.tableData = $filter('filter')(initData, {type: 1});
                        break;
                    case 1:
                        $scope.tableData = $filter('filter')(initData, {type: 2});
                        break;
                    case 2:
                        $scope.tableData = $filter('filter')(initData, {type: 7});
                        break;
                    case 3:
                        $scope.tableData = $filter('filter')(initData, {type: 8});
                        break;
                    case 4:
                        var newData = [];
                        for (var i = 3; i < 7; i++) {
                            var content = $filter('filter')(initData, {type: i});
                            console.log('content'.content);
                            newData = newData.concat(content);
                        }
                        $scope.tableData = newData;
                        break;
                }
            };

            //点击处理
            $scope.handle = function (index) {
                editIndex = index;
                formEdit = true;
                $scope.state.home = false;
                $scope.state.handle = true;
                netManager.get('/workOrder/openOrder', {id: $scope.tableData[editIndex].id}).then(function (res) {
                    console.log('res.data.order', res.data.order);
                    $scope.handleData = res.data.order;
                }, function (err) {
                    console.error(err);
                });
            };

            //完结处理
            $scope.endOrder = function () {
                var dealData = {
                    log: $scope.handleData.addLog,
                    id: $scope.tableData[editIndex].id,
                    state: 2
                };
                console.log('dealData', dealData);
                netManager.post('/workOrder/dealOrder', dealData).then(function (res) {
                    $scope.dtInstance.DataTable.rows(editIndex).remove().draw();
                    $scope.state.home = true;
                    $scope.state.handle = false;
                    formEdit = false;
                }, function (err) {
                    swal("保存失败", err.description, "error");
                    console.error(err);
                });
            };

            //点击转派
            $scope.sendTurn = function (index) {
                $scope.sendData = {};
                $scope.state.home = false;
                $scope.state.send = true;
                $scope.state.handle = false;
                if (index !== undefined) {
                    editIndex = index
                }

                console.log('account', $scope.account);
            };

            //保存转派
            $scope.saveSend = function () {
                $scope.formSend.submitted = true;
                if ($scope.formSend.$valid) {
                    var saveData = {
                        log: ($scope.handleData && $scope.handleData.addLog) ? $scope.handleData.addLog : null,
                        handlerID: $scope.sendData.handler ? angular.fromJson($scope.sendData.handler).id : null,
                        id: $scope.tableData[editIndex].id,
                        state: 1
                    };
                    console.log('saveData', saveData);
                    netManager.post('/workOrder/dealOrder', saveData).then(function (res) {
                        swal("保存成功!", "success");
                        angular.extend($scope.tableData[editIndex], {handler: angular.fromJson($scope.sendData.handler).name});
                        $scope.formSend.submitted = false;
                        $scope.state.home = true;
                        $scope.state.handle = false;
                        $scope.state.send = false;
                    }, function (err) {
                        if(err.description==='INVALID_ARGUMENT'){
                            swal("保存失败", '任务不能转派给自己', "error");
                        }
                        console.error(err);
                    });
                }
            };

            //取消转派
            $scope.cancelSend = function () {
                $scope.formSend.submitted = false;
                if (formEdit) {//从编辑转派过来的取消
                    $scope.state.handle = true;
                    $scope.state.home = false;
                    $scope.state.send = false;
                } else {//从主页转派过来的取消
                    $scope.state.handle = false;
                    $scope.state.home = true;
                    $scope.state.send = false;
                }
            };

            //初始化
            function init() {
                $scope.isLoad = true;
                netManager.get('/workOrder/newOrderList').then(function (res) {
                    console.log('res', res.data);
                    $scope.tableData = res.data.list;
                    $scope.typeCount = formatTypeCount(res.data.typeCount);
                    initData = angular.copy($scope.tableData);
                    $scope.customers = res.data.customers;

                    $scope.isLoad = false;
                }, function (err) {
                    console.error(err);
                });
            }

            //修改tab状态格式
            function formatTypeCount(typeCount) {
                if(typeCount){
                    var data = [];
                    var sumData = 0;
                    for (var i = 3; i < 7; i++) {
                        typeCount[i] && (typeCount[i]=0);
                        sumData+=typeCount[i];
                    }
                    data[0]=typeCount[1];
                    data[1]=typeCount[2];
                    data[2]=typeCount[7];
                    data[3]=typeCount[8];
                    data[4]=sumData;
                    console.log('typeCount', data);
                    return data;
                }
            }

        }
    ]);
}());