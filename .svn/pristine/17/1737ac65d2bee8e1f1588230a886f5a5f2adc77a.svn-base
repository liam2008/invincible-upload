(function () {
    var app = angular.module('app.count.counter',[]);

    app.controller('counterCtrl', ['$scope', 'netManager',
        function ($scope, netManager) {
            /*计算*/
            var count = {};
            count.data = {};

            count.coculate = function () {
                if ($scope.formcount.$valid) {
                    renderPage();
                } else {
                    $scope.formcount.submitted = true;
                }
            };
            count.reset = function () {
                $scope.formcount.submitted = false;
                $scope.count.data = count.data = null;
            };

            $scope.count = count;
            defaultSetting();
            //初始化页面
            renderPage();

            //渲染页面
            function renderPage() {
                //控制加载load-icon
                $scope.isLoad = true;
                var sendData = {
                    "meichandisePrice": $scope.count.data.price,
                    "goodScost": $scope.count.data.cost,
                    "weight": $scope.count.data.weight,
                    "comCoefficient": $scope.count.ratio,
                    "projectedSales": $scope.count.data.valume,
                    "exchangeRate": $scope.count.exchangeRate,
                    "firstFreight": $scope.count.freight
                };
                netManager.post('/count/counted', sendData).then(function (res) {
                    if (res.status === 200) {
                        $scope.renderData = res.data;
                    }
                }, function (err) {
                    console.error(err.code);
                });
                $scope.isLoad = false;
            }

            //默认设定
            function defaultSetting(){
                $scope.count.ratio = '15%';
                $scope.count.exchangeRate = '6.80';
                $scope.count.freight = '40.00';
            }
        }
    ]);

}());