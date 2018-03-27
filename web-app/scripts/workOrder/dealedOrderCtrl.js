(function() {
	var app = angular.module('app.workOrder.dealedOrder', []);

	app.controller('dealedOrderCtrl', ['$scope', 'netManager', 'SweetAlert', '$timeout', '$stateParams',
		function($scope, netManager, SweetAlert, $timeout, $stateParams) {
			//初始化传递参数
			$scope.initData = {
				startDate: moment().subtract('1', 'months').format('YYYY-MM-DD'),
				endDate: moment().format('YYYY-MM-DD')
			};

			$scope.optionData = {
				currentPage: $stateParams.currentPage || 1,
				startDate: moment($scope.initData.startDate).format('YYYY-MM-DD'),
				endDate: moment($scope.initData.endDate).format('YYYY-MM-DD'),
				pageChanged: function() {
					init();
				}
			};

			$scope.typeList = [{
				id: '1',
				name: '出现差评'
			}, {
				id: '2',
				name: '总评价低于预警'
			}, {
				id: '3',
				name: '评论数量变少'
			}, {
				id: '4',
				name: '发现跟卖'
			}, {
				id: '5',
				name: 'ASIN被篡改'
			}, {
				id: '6',
				name: '品牌被篡改'
			}, {
				id: '7',
				name: '标题被篡改'
			}, {
				id: '8',
				name: '简介被篡改'
			}, {
				id: '9',
				name: '描述被篡改'
			}, {
				id: '10',
				name: '主图被篡改'
			}, {
				id: '003',
				name: 'Lightning Deals'
			}, {
				id: '004',
				name: '销售权限'
			}, {
				id: '005',
				name: '品牌更改'
			}, {
				id: '006',
				name: '店铺IP问题'
			}, {
				id: '000',
				name: '其它'
			}];

			$scope.stateList = [{
				id: 0,
				name: '待处理'
			}, {
				id: 1,
				name: '已跟进'
			}, {
				id: 2,
				name: '已完结'
			}];

			//渲染页面
			init();

			//init
			function init() {
				getserverData();
			}

			//分页设置
			$scope.pageChanged = function() {
				getserverData();
			};

			// 重新获取数据条目
			function getserverData() {
				$scope.isLoad = true;
				var sendData = angular.extend({}, $scope.optionData, {
					startDate: moment($scope.optionData.startDate).format('YYYY-MM-DD'),
					endDate: moment($scope.optionData.endDate).format('YYYY-MM-DD'),
					asin: $scope.optionData.asin,
					state: $scope.optionData.state,
					type: $scope.optionData.type,
					currentPage: $scope.optionData.currentPage,
					itemsPerPage: 10
				});
				console.log('sendData', sendData);
				netManager.get('/workOrder/dealtList', sendData).then(function(res) {
					console.log('restableList', res.data);
					$scope.tableList = res.data.list;
					$scope.totalItems = res.data.totalItems;
					window.sessionStorage.setItem('currentPage', $scope.optionData.currentPage);
					$timeout(function() {
						$('.footable').trigger('footable_redraw');
					}, 100);
				}, function(err) {
					console.error(err);
				});
			}

			//点击查询
			$scope.checkFn = function() {
				getserverData();
			};

			//重置
			$scope.resetFn = function() {
				$stateParams.currentPage = 1;
				$scope.optionData = {
					startDate: moment().subtract('1', 'months').format('YYYY-MM-DD'),
					endDate: moment().format('YYYY-MM-DD'),
					currentPage: $stateParams.currentPage
				};
				getserverData();
			}

			//添加备注文本
			$scope.remarkText = {};

			//操作备注
			$scope.operateRemark = function(index) {
				var targetElements = document.querySelectorAll('.addRemarkList');
				if(targetElements[index].style.display === 'none') {
					//显现
					$scope.remarkText.remark = '';
					targetElements[index].style.display = 'block';
				} else {
					//隐藏
					$scope.remarkText.remark = '';
					targetElements[index].style.display = 'none';
				}
			}

			//保存备注
			$scope.saveRemark = function(tableItem, index) {
				var targetElements = document.querySelectorAll('.addRemarkList');
				var sendRemark = {
					_id: tableItem.ID,
					content: $scope.remarkText.remark
				};
				console.log("sendRemark", sendRemark)
				if($scope.remarkText.remark !== '' && $scope.remarkText.remark !== undefined) { //备注为空时不能保存
					netManager.post("/workOrder/saveRemark", sendRemark).then(function(res) {
						if(res.status === 200) {
							//页面信息同步
							tableItem.remarks = res.data;
							console.log("resRemark", res);
							//清空并关闭文本框
							$scope.remarkText.remark = '';
							targetElements[index].style.display = 'none';
						}
					}, function(err) {
						console.error("saveRemark", err);
					});
				}
			}

		}
	]);
}());