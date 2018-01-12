(function () {
    var app = angular.module('app.workOrder.dealingOrder', []);

    app.controller('dealingOrderCtrl', ['$scope', 'netManager', 'SweetAlert', '$timeout', '$state','$stateParams',
        function ($scope, netManager, SweetAlert, $timeout, $state,$stateParams) {
            //初始化数据
            $scope.tabItem = [false, false, false, false, false];

            $scope.currentPage = $stateParams.currentPage || 1;

            $scope.pageChanged = function () {
                init();
            };

            init();

            //点击筛选
            $scope.dataFilter = function (index) {
                for (var i = 0, iLen = $scope.tabItem.length; i < iLen; i++) {
                    if (index == i) {
                        $scope.tabItem[i] = !$scope.tabItem[i];
                    } else {
                        $scope.tabItem[i] = false;
                    }
                }
                if($scope.tabItem[index]){
                    switch (index) {
                        case 0:
                            $scope.WOType = 1;
                            break;
                        case 1:
                            $scope.WOType = 2;
                            break;
                        case 2:
                            $scope.WOType = 7;
                            break;
                        case 3:
                            $scope.WOType = 8;
                            break;
                        case 4:
                            $scope.WOType = 0;
                            break;
                        default :
                            $scope.WOType = null;
                            break;
                    }
                    $scope.totalItems = $scope.typeCount[index];
                }else{
                    $scope.WOType = null;
                    $scope.totalItems = $scope.allCount;
                    $stateParams.currentPage = 1;
                    $scope.currentPage = 1;
                }
                init();
            };

            //初始化
            function init() {
                $scope.isLoad = true;
                var sendData = {
                    currentPage:$scope.currentPage,
                    WOType: $scope.WOType,
                    pageSize: 10
                };
                console.log('send', sendData);
                netManager.get('/workOrder/newOrderList', sendData).then(function (res) {
                    console.log('res', res.data);
                    $scope.tableList = res.data.list;
                    $scope.typeCount = formatTypeCount(res.data.typeCount);
                    $scope.fromPage = $state.current.name;

                    if($scope.allCount===undefined){
                        var allCount = 0;
                        for (var key in $scope.typeCount) {
                            allCount += $scope.typeCount[key];
                        }
                        $scope.allCount = allCount;
                        $scope.totalItems = allCount;
                    }

                    console.log('$scope.totalItems', $scope.totalItems);

                    $timeout(function () {
                        $('.footable').trigger('footable_redraw');
                    }, 100);

                    window.sessionStorage.setItem('customers', angular.toJson(res.data.customers));
                    window.sessionStorage.setItem('currentPage', $scope.currentPage);
                    $scope.isLoad = false;
                }, function (err) {
                    console.error(err);
                });
            }

            //修改tab状态格式
            function formatTypeCount(typeCount) {
                if (typeCount) {
                    var data = [];
                    var sumData = 0;
                    for (var i = 3; i < 7; i++) {
                        sumData += typeCount[i];
                    }
                    data[0] = typeCount[1];
                    data[1] = typeCount[2];
                    data[2] = typeCount[7];
                    data[3] = typeCount[8];
                    data[4] = sumData + typeCount[0];
                    console.log('typeCount', data);
                    return data;
                }
            }

        }
    ]);
}());