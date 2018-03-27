(function () {
    var app = angular.module('app.workOrder.turnOrder', []);

    app.controller('turnOrderCtrl', ['$scope', 'netManager','$stateParams','$state',
        function ($scope, netManager,$stateParams,$state) {
            var id = $stateParams.id;
            var log = $stateParams.log;

            $scope.customers = angular.fromJson(window.sessionStorage.getItem('customers'));

            //保存转派
            $scope.saveSend = function () {
                $scope.formSend.submitted = true;
                if ($scope.formSend.$valid) {
                    var saveData = {
                    	id: id,
                        log: log,
                        handlerID:$scope.handlerID,
                        remark: $scope.remark,
                        state: 1
                    };
                    netManager.post('/workOrder/dealOrder', saveData).then(function (res) {
                        $state.go('main.workOrder.dealingOrder',{'currentPage':window.sessionStorage.getItem('currentPage')});
                    }, function (err) {
                        if (err.description === 'INVALID_ARGUMENT') {
                            swal("保存失败", '任务不能转派给自己', "error");
                        }
                        console.error(err);
                    });
                }
            };

            //取消转派
            $scope.cancelSend = function () {
                $state.go('main.workOrder.dealingOrder',{'currentPage':window.sessionStorage.getItem('currentPage')});
            };

        }
    ]);
}());