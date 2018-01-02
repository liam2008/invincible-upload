(function () {
    var app = angular.module('app.analysis.keyword', []);

    app.controller('keywordCtrl', ['$scope','$location','netManager','SweetAlert',
        function ($scope,$location,netManager,SweetAlert) {
            //初始化传递参数
            $scope.postData = {
                currentPage:1,
                itemsPerPage:10
            };

            //渲染页面
            init();

            //init
            function init(){
                $scope.postData = {};
                getserverData();
            }

            //分页设置
            $scope.pageChanged = function(){
                getserverData();
            };

            //新建关键字
            $scope.newKeyword = function(){
                $scope.addData = {
                    site:'SI_US',
                    keyword:''
                };
            };

            //保存关键字
            $scope.saveAdd = function(){
                $scope.formAdd.submitted = true;
                console.log('$scope.addData', $scope.addData);
                if($scope.formAdd.$valid){
                    netManager.post('/appraise/keywordTask', $scope.addData).then(function (res) {
                        swal("保存成功!", "success");
                        $scope.formAdd.submitted = false;
                        $('#addTaskModal').modal('hide');
                    }, function (err) {
                        swal("保存失败", err.description, "error");
                        console.error(err);
                    });
                }
            };

            // 重新获取数据条目
            function getserverData(){
                $scope.isLoad = true;
                console.log('postData', $scope.postData);
                netManager.get('/appraise/keyword', $scope.postData).then(function (res) {
                    console.log('res', res.data);
                    var resData = res.data;
                    $scope.postData.keywords = resData.keywords;
                    $scope.tableList = resData.list;
                    $scope.showKeywordSelect = true;
                    $scope.totalItems = resData.totalItems;
                    $scope.taskSide = resData.taskSide;
                    $scope.isLoad = false;
                }, function (err) {
                    console.error(err);
                });
            }

            //点击
             $scope.checkFn = function(){
                 getserverData();
            };

        }
    ]);
}());