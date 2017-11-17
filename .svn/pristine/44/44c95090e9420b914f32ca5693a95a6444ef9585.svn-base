(function () {
    var app = angular.module('app');
    app.controller('DailyListController', ['$scope', 'DTOptionsBuilder', 'netManager', 'notify',
        function ($scope, DTOptionsBuilder, netManager, notify) {
            $scope.isLoad = true;
            $scope.dtOptions = DTOptionsBuilder.newOptions()
                .withDOM('<"html5buttons"B>lTfgitp')
                .withButtons([
                    {extend: 'excel', title: '每日信息'},
                    {extend: 'copy', title: '每日信息'}
                ]);

            netManager.get('/daily/list')
                .then(function (res) {
                    tableData(res.data.results);
                    $scope.isLoad = false;
                })
                .catch(function (err) {
                    console.error(err);
                });

            var dd = new Date();
            if (dd.getHours() < 17) {
                dd.setDate(dd.getDate() - 2);
            } else {
                dd.setDate(dd.getDate() - 1);
            }
            $scope.startDate = dd;
            $scope.endDate = dd;
            $scope.chechNum = function () {
                var $startVal = $('[ng-model="startDate"]').val();
                var $endVal = $('[ng-model="endDate"]').val();
                var startDate = new Date($startVal).getTime();
                var endDate = new Date($endVal).getTime();
                if (!startDate || startDate > endDate) {
                    notify({
                        message: '结束日期比起始日期小或者起始日期不存在',
                        classes: 'alert-warning',
                        templateUrl: 'views/common/notify.html'
                    });
                    return;
                } else {
                    var postData = $startVal + '~' + $endVal;
                    netManager.get('/daily/list', {timeRange: postData})
                        .then(function (res) {
                            tableData(res.data.results);
                            $scope.startDate = $startVal;
                            $scope.endDate = $endVal;
                        }).catch(function (err) {
                            console.error(err);
                        });
                }
            };

            /**
             * 添加数据table数据
             * @param val
             */
            function tableData(val) {
                var $startVal = $('[ng-model="startDate"]').val();
                var $endVal = $('[ng-model="endDate"]').val();
                var gap = new Date($endVal).getDate() - new Date($startVal).getDate();
                val.map(function (val, index) {
                    val.isDanger = val.sales_volume < (gap + 1) * val.projected_sales ? true : false;
                    val.url = Smartdo.Utils.getUrl(val['shop_name'],val['asin']);
                });
                $scope.dataList = val;
            }

            $scope.Smartdo = Smartdo;
        }
    ]);
}());