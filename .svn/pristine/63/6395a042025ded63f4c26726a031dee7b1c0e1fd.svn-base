(function () {
    var app = angular.module('app.rank.sellerRank',[]);

    app.controller('sellerRankCtrl', ['$scope', 'netManager', 'DTOptionsBuilder','DTColumnDefBuilder', 'SweetAlert',
        function ($scope, netManager, DTOptionsBuilder,DTColumnDefBuilder, SweetAlert) {

            //数据
            var sellerData = {};
            sellerData.mainList = [];
            sellerData.detailList = [];
            $scope.sellerData = sellerData;

            //操作
            var sellerAction = {};
            sellerAction.viewDetail = function(id){
                netManager.get('/sellerRank/popupList',{'_id':id}).then(function (res) {
                    $scope.sellerData.detailList = res.data;
                }, function (err) {
                    console.error(err);
                });
            };
            sellerAction.checkData = function(){
                init();
            };
            sellerAction.searchData = function(){
                init();
            };
            $scope.sellerAction = sellerAction;

            //分页设定
            var pageData = {
                'maxSize': 5
            };
            pageData.currentPage = 1;
            pageData.pageChanged = function(){
                init();
            };
            $scope.pageData = pageData;

            //排序设置
            var orderData = {};
            orderData.list = [{
                "title" : "Month Rank",
                "value" : "MonthRank",
                "isShow": true,
                "orderReverse":true
            },{
                "title" : "Year Rank",
                "value" : "YearRank",
                "isShow": false,
                "orderReverse":false
            },{
                "title" : "Lifetime Rank",
                "value" : "LifetimeRank",
                "isShow": false,
                "orderReverse":false
            }];
            orderData.itemInfo = {
                orderPredicate : "MonthRank",//排序的值
                orderReverse : true//正反序
            };
            orderData.setOrder = function($index){
                orderData.list.map(function(val,key){
                    if(key === $index){
                        val.isShow = true;
                        val.orderReverse = !val.orderReverse;

                        orderData.itemInfo.orderPredicate = val.value;
                        orderData.itemInfo.orderReverse = val.orderReverse;
                    }else{
                        val.isShow = false;
                    }
                });

                init();
            };
            $scope.orderData = orderData;

            //验证
            $scope.regName = ['Positive','Neutral','Negative','Count'];

            //初始化默认数据
            $scope.sellerData.From = 'usa';
            init();

            //初始化页面
            function init() {
                $scope.isLoad = true;
                var regUrl = {
                    'usa':'ATVPDKIKX0DER',
                    'uk':'A1F83G8C2ARO7P',
                    'japan':'A1VC38T7YXB528',
                    'germany':'A1PA6795UKMFR9',
                    'canada':'A2EUQ1WTGCTBG2',
                    'france':'A13V1IB3VIYZZH',
                    'italy':'APJ6JRA9NG5V4',
                    'india':'A21TJRUUN4KGV',
                    'spain':'A1RKKUPIHCS9HS',
                    'mexico':'A1AM78C64UM0Y8',
                    'china':'AAHKV2X7AFYLW',
                    'brazil':'A2Q3Y263D00KWC'
                };
                var regMain = {
                    'usa':'https://www.amazon.com/sp',
                    'uk':'https://www.amazon.co.uk/sp',
                    'japan':'https://www.amazon.co.jp/sp',
                    'germany':'https://www.amazon.de/sp',
                    'canada':'https://www.amazon.ca/sp',
                    'france':'https://www.amazon.fr/sp',
                    'italy':'https://www.amazon.it/sp',
                    'india':'https://www.amazon.in/sp',
                    'spain':'https://www.amazon.es/sp',
                    'mexico':'https://www.amazon.com.mx/sp',
                    'china':'https://www.amazon.cn/sp',
                    'brazil':'https://www.amazon.com.br/gp/aag/main'
                };
                /*改造排列传值*/
                var sortData = {};
                if(!orderData.itemInfo.orderPredicate){
                    sortData = '';
                } else{
                    sortData[orderData.itemInfo.orderPredicate] = orderData.itemInfo.orderReverse? 1: -1
                }
                var sendData = {
                    'From':$scope.sellerData['From'],
                    'IsFba':$scope.sellerData['IsFba'],
                    'allKeyword':$scope.sellerData['seaContent'],
                    'current':$scope.pageData.currentPage,
                    'sort':angular.toJson(sortData),
                    'month':$scope.sellerData.month ? $scope.sellerData.month.format('YYYY-MM') : moment().format('YYYY-MM')
                };
                console.log(sendData);+
                netManager.get('/sellerRank/rankList',sendData).then(function (res) {
                    $scope.sellerData.mainList = res.data.data;

                    $scope.sellerData.mainList.map(function(val,key){
                        val.url = regMain[val.From]+'?ie=UTF8&asin=&isAmazonFulfilled=&isCBA=&marketplaceID='+regUrl[val.From]+'&orderID=&protocol=current&seller='+val.SellerId+'&sshmPath='
                    });

                    $scope.pageData.totalItems = res.data.total;
                    $scope.isLoad = false;
                }, function (err) {
                    console.error(err);
                });
            }
        }
    ]);
}());