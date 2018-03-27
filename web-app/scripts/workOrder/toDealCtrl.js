(function () {
    var app = angular.module('app.workOrder.toDeal', []);

    app.controller('toDealCtrl', ['$scope', '$filter', 'netManager','$stateParams','$state',
        function ($scope, $filter, netManager,$stateParams,$state) {
            var id = $stateParams.id;
            $scope.fromPage = $stateParams.fromPage;

            init();

            //完结处理
            $scope.endOrder = function () {
                var dealData = {
                    log: $scope.handleData.log,
                    id: id,
                    state: 2
                };
                console.log('dealData', dealData);
                netManager.post('/workOrder/dealOrder', dealData).then(function (res) {
                    $state.go($scope.fromPage,{'currentPage':window.sessionStorage.getItem('currentPage')});
                }, function (err) {
                    swal("保存失败", err.description, "error");
                    console.error(err);
                });
            };

            //取消转派
            $scope.cancel = function () {
                $state.go($scope.fromPage,{'currentPage':window.sessionStorage.getItem('currentPage')});
            };

            //转派
            $scope.sendTurn = function(){
                $state.go('main.workOrder.turnOrder',{id:id,log:$scope.handleData.log});
            };

            //初始化
            function init() {
                if($scope.fromPage=="main.workOrder.dealingOrder"){
                    $scope.ativeTab = 0
                }else{
                    $scope.ativeTab = 1
                }
                netManager.get('/workOrder/openOrder', {id: $stateParams.id}).then(function (res) {
                    $scope.handleData = res.data;
                })
            }


        }
    ]);
}());