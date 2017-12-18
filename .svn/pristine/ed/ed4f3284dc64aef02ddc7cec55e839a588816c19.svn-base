(function () {
    var app = angular.module('app.analysis.reivew', []);

    app.controller('reviewCtrl', ['$scope', 'netManager', 'DTOptionsBuilder','$filter',
        function ($scope, netManager, DTOptionsBuilder,$filter) {
            $scope.productState = Smartdo.PRODUCT_STATE;
            $scope.dtOptions = DTOptionsBuilder.newOptions()
                .withDOM('<"html5buttons"B>lTfgitp')
                .withButtons([
                    {extend: 'excel', title: 'reivew分析'},
                    {extend: 'copy', title: 'reivew分析'}
                ]);

            //渲染页面
            init();

            //点击编辑
            $scope.showDetial = function (asinItem) {
                $scope.detailDisplay = true;
                $scope.asinItem = asinItem;//把数据保存下来
                $scope.asinData = {//初始化
                    'asin': asinItem.asin,
                    'side': asinItem.side,
                    verifiedPurchase: "",
                    date: {
                        startDate: moment().subtract(1, 'months'),
                        endDate: moment()
                    }
                };
                var sendData = {//发送
                    'asin': $scope.asinData.asin,
                    'side': $scope.asinData.side,
                    'verifiedPurchase': $scope.asinData.verifiedPurchase,
                    'startDate': moment($scope.asinData.date.startDate).format('YYYY-MM-DD'),
                    'endDate': moment($scope.asinData.date.endDate).format('YYYY-MM-DD')
                };
                console.log('sendData', sendData);
                getReviewData(sendData);
            };

            //点击查询
            $scope.checkReview = function () {
                var sendData = {//发送
                    'asin': $scope.asinItem.asin,
                    'side': $scope.asinItem.side,
                    'verifiedPurchase': $scope.asinData.verifiedPurchase,
                    'startDate': moment($scope.asinData.date.startDate).format('YYYY-MM-DD'),
                    'endDate': moment($scope.asinData.date.endDate).format('YYYY-MM-DD')
                };
                console.log('sendData', sendData);
                getReviewData(sendData);
            };

            //点击返回
            $scope.prePage = function () {
                $scope.detailDisplay = false;
            };

            //初始化页面
            function init() {
                netManager.get('/appraise/EVALTotal').then(function (res) {
                    //列表数据
                    $scope.asinList = res.data.list;
                    $scope.asinList.map(function (val, index) {
                        var country = val.side || 'US';
                        var addr = Smartdo.SIDE_ADDR[country];
                        val.url = 'http://www.amazon.' + addr + '/dp/' + val['asin'];
                    });

                    //站点选择数据
                    $scope.taskSide = res.data.taskSide;

                    //细节展示是否显示
                    $scope.detailDisplay = false;

                    console.log('res-first', res.data);
                }, function (err) {
                    console.error(err);
                });
            }

            //线图
            $scope.lineOptions = {
                legend: {
                    display: true,
                    position: 'top',
                    datasetFill: false,
                    onClick: function (e, legendItem) {
                        var index = legendItem.datasetIndex;
                        var ci = this.chart;
                        var len = ci.data.datasets.length;
                        //debugger;
                        var meta = ci.getDatasetMeta(index);
                        meta.clickTimes = ci.getDatasetMeta(index).clickTimes ? ++ci.getDatasetMeta(index).clickTimes : 1;

                        if (meta.clickTimes % 2 === 0) {
                            for (var i = 0; i < len; i++) {
                                ci.getDatasetMeta(i).hidden = false;
                            }
                        } else {
                            for (var i = 0; i < len; i++) {
                                if (i === index) {
                                    ci.getDatasetMeta(index).hidden = false;
                                } else {
                                    ci.getDatasetMeta(i).hidden = true;
                                }
                            }
                        }

                        ci.update();

                        var meta = ci.getDatasetMeta(index);

                        // See controller.isDatasetVisible comment
                        meta.hidden = meta.hidden === null ? !ci.data.datasets[index].hidden : null;
                    }
                },
                scales: {
                    yAxes: [
                        {
                            id: 'y-axis-1',
                            type: 'linear',
                            display: true,
                            position: 'left',
                            ticks: {
                                beginAtZero:true,
                                stepSize:1,
                                min:0
                            }
                        }
                    ]
                },
                elements: {
                    line: {
                        fill: false
                    }
                },
                tooltips: {
                    mode: 'nearest'
                }
            };

            //点击星星
            $scope.filterStar = function(starNum){
                //仅仅改变的是表格内容
                var initData = angular.copy($scope.keepData);
                $scope.reviewList = $filter('filter')(initData, {star:starNum});
                console.log('$scope.reviewList', $scope.reviewList);
            };

            /***
             * 查询review数据
             * @param sendData
             */
            function getReviewData(sendData) {
                netManager.get('/appraise/EVALDetail', sendData).then(function (res) {
                    //表格
                    $scope.reviewList = res.data.details;

                    //保存数据
                    $scope.keepData = $scope.reviewList;

                    //线图
                    var lineReview = res.data.lineReview;
                    var allPv = [];//全部数据，购买+非购买
                    var data = [];
                    for (var i = 0, iLen = lineReview.lineTime.length; i < iLen; i++) {
                        if(!lineReview.isPv[i]){
                            lineReview.isPv[i] = 0;
                        }
                        if(!lineReview.isNotPv[i]){
                            lineReview.isNotPv[i] = 0;
                        }
                        allPv.push(lineReview.isPv[i] + lineReview.isNotPv[i])
                    }
                    data.push(allPv, lineReview.isPv, lineReview.isNotPv);
                    console.log('data', data);
                    $scope.lineData = {
                        series: ['全部', '购买', '非购买'],
                        data: data,
                        labels: lineReview.lineTime
                    };

                    console.log('lineData', res.data);

                    //星
                    console.log('$scope.starDivide', $scope.starDivide);
                    $scope.starDivide = res.data.starDivide;

                }, function (err) {
                    console.error(err);
                });
            }

            //添加爬虫
            $scope.addTask = function(){
                $scope.formAdd.submitted = false;
                $scope.taskData = {//初始化
                    side:'SI_US',
                    asin:''
                };
            };

            //保存任务
            $scope.saveTask = function(){
                $scope.formAdd.submitted = true;
                if($scope.formAdd.$valid){
                    var sendData = {
                        side:$scope.taskData.side,
                        asin:$scope.taskData.asin
                    };
                    console.log('sendData', sendData);
                    netManager.post('/appraise/EVALTask', sendData).then(function (res) {
                        if (res.status === 200) {
                            $('#addTaskModal').modal('hide');
                            swal("保存成功!", "success");
                            init();
                        }
                    }, function (err) {
                        console.error(err.code);
                        swal("保存失败", "err.description", "error");
                    });
                }
            };
        }
    ]);
}());