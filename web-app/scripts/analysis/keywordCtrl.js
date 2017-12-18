(function () {
    var app = angular.module('app.analysis.keyword', []);

    app.controller('keywordCtrl', ['$scope','$location','netManager',
        function ($scope,$location,netManager) {

            /*//渲染页面
            init();

            //init
            function init(){
                $scope.postData = {};
                getserverData();
            }

            //页面定义
            $scope.paginationConf = {
                currentPage: $location.search().currentPage ? $location.search().currentPage : 1,
                totalItems: 0,
                itemsPerPage: 9,
                pagesLength: 10,
                perPageOptions: [10, 20, 30, 40, 50],
                onChange: function(){
                    getserverData();
                }
            };

            // 重新获取数据条目
            function getserverData(){
                $scope.isLoad = true;
                console.log('$scope.postData', $scope.postData);
                netManager.get('/appraise/keyword', $scope.postData).then(function (res) {
                    $scope.keywords = res.data.keywords;
                    $scope.tableList = res.data.dataList;
                    $scope.paginationConf.totalItems = res.data.totalItems;
                    $scope.isLoad = false;
                }, function (err) {
                    console.error(err);
                });
            }

            //点击
             $scope.checkFn = function(){
                 getserverData();
            };*/


            //模拟
            $scope.paginationConf = {
                currentPage: 1,
                totalItems: 800,
                itemsPerPage: 9,
                pagesLength: 10,
                perPageOptions: [10, 20, 30, 40, 50],
                onChange: function(){
                    console.log('currentPage', $scope.paginationConf.currentPage);
                }
            };


        }
    ]);
}());