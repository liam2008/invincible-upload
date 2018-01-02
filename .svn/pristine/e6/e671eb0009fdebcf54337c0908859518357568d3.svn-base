(function () {
    var app = angular.module('app.workOrder.createOrder', []);

    app.controller('createOrderCtrl', ['$scope','netManager','SweetAlert',
        function ($scope,netManager,SweetAlert) {
            //初始化数据
            $scope.createTime = moment().subtract(1, 'months').format('YYYY-MM-DD h:mm:ss');

            $scope.typeList = [
                {id:3,name:'Lightning Deals'},
                {id:4,name:'销售权限'},
                {id:5,name:'品牌更改'},
                {id:6,name:'店铺IP问题'},
                {id:0,name:'其他'}
            ];

            init();

            //提交
            $scope.post = function(){
                $scope.formAdd.submitted = true;
                if($scope.formAdd.$valid){
                    var postData={
                        operateTeam: $scope.initData.operateTeam,
                        WOType: $scope.initData.WOType,
                        content: $scope.initData.content
                    };
                    console.log('postData', postData);
                    netManager.post('/workOrder/createOrder',postData).then(function (res) {
                        swal("保存成功!", 'success');
                        $scope.formAdd.submitted = false;
                        $scope.initData = null;
                    }, function (err) {
                        swal("保存失败!", err.data.description, 'error');
                    });
                }
            };

            //初始化
            function init(){
                netManager.get('/workOrder/orderReady').then(function (res) {
                    console.log('res', res.data);
                    $scope.teamList = res.data.team;
                }, function (err) {
                    console.error(err);
                });
            }

            //取消
            $scope.cancel = function(){
                $scope.formAdd.submitted = false;
                $scope.initData = null;
            }
        }
    ]);
}());