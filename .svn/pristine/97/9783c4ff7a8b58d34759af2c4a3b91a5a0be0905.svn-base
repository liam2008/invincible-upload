(function () {
    var app = angular.module('app.workOrder.dealedOrder', []);

    app.controller('dealedOrderCtrl', ['$scope', 'netManager', 'SweetAlert',
        function ($scope, netManager, SweetAlert) {
            //初始化传递参数
            $scope.initData = {
                startDate: moment().subtract('1','months').format('YYYY-MM-DD'),
                endDate: moment().format('YYYY-MM-DD')
            };

            $scope.optionData = {
                currentPage: 1,
                itemsPerPage: 10,
                startDate: moment($scope.initData.startDate).format('YYYY-MM-DD'),
                endDate: moment($scope.initData.endDate).format('YYYY-MM-DD')
            };

            console.log('$scope.optionData', $scope.optionData);

            $scope.typeList = [
                {id:1,name:'评论异常'},
                {id:2,name:'发现跟单'},
                {id:3,name:'Lightning Deals'},
                {id:4,name:'销售权限'},
                {id:5,name:'品牌更改'},
                {id:6,name:'店铺IP问题'},
                {id:0,name:'其他'}
            ];

            $scope.stateList = [
                {id:0,name:'待处理'},
                {id:1,name:'已跟进'},
                {id:2,name:'已完结'}
            ];


            //渲染页面
            init();

            //init
            function init() {
                getserverData();
            }

            //分页设置
            $scope.pageChanged = function () {
                getserverData();
            };

            // 重新获取数据条目
            function getserverData() {
                $scope.isLoad = true;
                var sendData = angular.extend({}, $scope.optionData,{
                    startDate:moment($scope.optionData.startDate).format('YYYY-MM-DD'),
                    endDate:moment($scope.optionData.endDate).format('YYYY-MM-DD')
                });
                console.log('sendData', sendData);
                netManager.get('/workOrder/dealtList', sendData).then(function (res) {
                    console.log('res', res.data);
                    $scope.tableList = res.data.list;
                    $scope.totalItems = res.data.totalItems;
                }, function (err) {
                    console.error(err);
                });
            }

            //点击
            $scope.checkFn = function () {
                getserverData();
            };

            //重置
            $scope.resetFn = function () {
                $scope.optionData = {
                    startDate: moment().subtract('1','months').format('YYYY-MM-DD'),
                    endDate: moment().format('YYYY-MM-DD')
                };
            }

        }
    ]);
}());