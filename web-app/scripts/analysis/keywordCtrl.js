(function () {
    var app = angular.module('app.analysis.keyword', []);

    app.controller('keywordCtrl', ['$scope','$location','netManager','$q','$timeout',
        function ($scope,$location,netManager,$q,$timeout) {
            //初始化传递参数
            $scope.postData = {
                currentPage:1,
                itemsPerPage:10
            };

            //渲染页面
            init();

            //init
            function init(){
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
                var addData = {
                    keyword:$scope.addData.keyword,
                    site:$scope.addData.site
                };
                console.log('addData', addData);
                if($scope.formAdd.$valid){
                    netManager.post('/appraise/keywordTask',addData).then(function (res) {
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
                    //初始化关键字列表
                    $scope.keywords = resData.keywords;
                    $scope.postData.keyword = resData.keywords[0];
                    $scope.tableList = resData.list;
                    $scope.totalItems = resData.totalItems;
                    $scope.taskSide = resData.taskSide;
                    $scope.isLoad = false;
                }, function (err) {
                    console.error(err);
                });
            }

            //关闭
            $scope.close = function(){
                $scope.formAdd.submitted = false;
            };

            //点击
             $scope.checkFn = function(){
                 getserverData();
            };

            //点击导出excel
            $scope.exprotExcel = function(){
               $scope.postData.isExcel = true;
               netManager.get('/appraise/keywordExcel', $scope.postData).then(function (res) {
                   $timeout(function(){
                       genExcel(res.data.list);
                   },0);
                   console.log("res.data.list", res.data.list)
               }, function (err) {
                   console.error(err);
               });
			

                function s2ab(s) {
                    if (typeof ArrayBuffer !== 'undefined') {
                        var buf = new ArrayBuffer(s.length);
                        var view = new Uint8Array(buf);
                        for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
                        return buf;
                    } else {
                        var buf = new Array(s.length);
                        for (var i = 0; i != s.length; ++i) buf[i] = s.charCodeAt(i) & 0xFF;
                        return buf;
                    }
                }

                function genExcel(excelData) {
                    var wopts = { bookType: 'xlsx', bookSST: false, type: 'binary' };//这里的数据是用来定义导出的格式类型
                    var wb = { SheetNames: ['Sheet1'], Sheets: {}, Props: {} };
                    console.log('XLSX.utils', XLSX.utils);
                    wb.Sheets['Sheet1'] = XLSX.utils.json_to_sheet(excelData);
                    saveAs(new Blob([s2ab(XLSX.write(wb, wopts))], { type: "application/octet-stream" }), "关键字" + '.' + (wopts.bookType=="biff2"?"xls":wopts.bookType));
                    console.log("success")
                }

            };
        }
    ]);
}());