(function () {
    var app = angular.module('app.daily.list', []);
    app.controller('DailyListController', ['$scope', 'DTOptionsBuilder', 'netManager', '$filter',
        function ($scope, DTOptionsBuilder, netManager, $filter) {
            $scope.dtOptions = DTOptionsBuilder.newOptions()
                .withDOM('<"html5buttons"B>lTfgitp')
                .withOption('bFilter', false)
                .withButtons([
                    {extend: 'excel', title: '每日信息'},
                    {extend: 'copy', title: '每日信息'}
                ]);

            //初始化数据
            var dd = new Date();
            if (dd.getHours() < 17) {
                dd.setDate(dd.getDate() - 2);
            } else {
                dd.setDate(dd.getDate() - 1);
            }
            $scope.dateData = {
                startDate: moment(dd).format('YYYY-MM-DD'),
                endDate: moment().format('YYYY-MM-DD')
            };

            init();

            $scope.chechNum = function () {
                init();
            };

            /**
             * 添加数据isDanger数据
             * @param val
             */
            function formatData(val) {
                var $startVal = $scope.dateData.startDate;
                var $endVal = $scope.dateData.endDate;
                var gap = new Date($endVal).getDate() - new Date($startVal).getDate();
                val.map(function (val) {
                    val.isDanger = val.salesVolume < (gap + 1) * val.projectedSales ? true : false;
                    val.url = Smartdo.Utils.getUrl(val['shopName'], val['asin']);
                });
                $scope.dataList = val;
            }

            //初始化
            function init() {
                var sendData = {
                    timeRange: moment($scope.dateData.startDate).format('YYYY-MM-DD') + '~' + moment($scope.dateData.endDate).format('YYYY-MM-DD')
                };
                console.log('sendData', sendData);
                $scope.isLoad = true;
                netManager.get('/daily/list', sendData)
                    .then(function (res) {
                        if (res.data.results.length > 0) {
                            $scope.initData = res.data.results;
                            $scope.dataList = res.data.results;
                            formatData($scope.dataList);
                        } else {
                            $scope.dataList = [];
                        }
                        $scope.isLoad = false;
                    })
                    .catch(function (err) {
                        console.error(err);
                    });
            }

            //search
            //插件方法：/*$scope.dtInstance.DataTable.search(query).draw();*/
            $scope.dtInstance = {};
            $scope.searchFn = function () {
                if ($scope.dataList.length) {
                    $scope.hadSearch = true;
                    var query = String($scope.searchData).replace(/^\s+|\s+$/g, '');
                    console.log('before', $scope.dataList);
                    $scope.dataList = $filter('filter')($scope.initData, query);
                    var footerData = {
                        salesVolume: 0,
                        salesPrice: 0,
                        sellableStock: 0,
                        receiptingStock: 0,
                        transportStock: 0
                    };
                    $scope.dataList.forEach(function (val, index) {
                        footerData.salesVolume += val.salesVolume;
                        footerData.sellableStock += val.sellableStock;
                        footerData.receiptingStock += val.receiptingStock;
                        footerData.transportStock += val.transportStock;
                        footerData.salesPrice += val.salesPrice;
                    });

                    $scope.footerData = footerData;
                }
            };

            //清除数据
            $scope.clearFn = function () {
                if ($scope.hadSearch) {
                    $scope.hadSearch = true;
                    $scope.dataList = $scope.initData;
                }
            }

        }
    ]);
}());