(function() {
	var app = angular.module('app.workOrder.dealingOrder', []);

	app.controller('dealingOrderCtrl', ['$scope', 'netManager', 'SweetAlert', '$timeout', '$state', '$stateParams',
		function($scope, netManager, SweetAlert, $timeout, $state, $stateParams) {
			//数据模型
			$scope.where = {
				currentPage: 1,
				pageSize: 10
			};
			$scope.pageCount = 1;
			
			//分页查询
			$scope.handlePagination = function(page) {
				$scope.isLoad = true;
				$stateParams.currentPage = page;
				$scope.where.currentPage = page;
				if($scope.where.startTime != null) {
					$scope.where.startTime = moment($scope.where.startTime).format('YYYY-MM-DD')
				};
				if($scope.where.endTime != null) {
					$scope.where.endTime = moment($scope.where.endTime).format('YYYY-MM-DD')
				};
				netManager.get('/workOrder/newOrderList', $scope.where).then(function(res) {
					$scope.tableList = res.data.list;
					$scope.asinList = res.data.asinList;
					$scope.pageCount = res.data.pageCount;
					$scope.fromPage = $state.current.name;
					window.sessionStorage.setItem('customers', angular.toJson(res.data.customers));
					window.sessionStorage.setItem('currentPage', page);
					$timeout(function() {
						$('.footable').trigger('footable_redraw');
					}, 100);
					$scope.isLoad = false;
				})
			}
			$scope.handlePagination($stateParams.currentPage || 1)

			//重置查询条件
			$scope.resetFn = function() {
				$scope.where = {
					currentPage: 1,
					pageSize: 10
				};
				$scope.handlePagination(1)
			}

			//改变处理状态
			$scope.toggleHandleState = function(value) {
				var send = {
					_id: value.id
				};
				netManager.post('/workOrder/handle', send).then(function(res) {
					value.handle = res.data.handle;
				});
			}
			//添加备注文本对象
			$scope.remarkText = {};
			//操作备注
			$scope.operateRemark = function(index) {
				var targetElements = document.querySelectorAll('.addRemarkList');
				if(targetElements[index].style.display === 'none') {
					$scope.remarkText.remark = '';
					targetElements[index].style.display = 'block';
				} else {
					//清空原文本
					$scope.remarkText.remark = '';
					targetElements[index].style.display = 'none';
				}
			}
			//保存备注
			$scope.saveRemark = function(value, index) {
				var targetElements = document.querySelectorAll('.addRemarkList');
				var sendRemark = {
					_id: value.id,
					content: $scope.remarkText.remark
				};
				if($scope.remarkText.remark != '' && $scope.remarkText.remark !== undefined) { //备注为空时不能保存
					netManager.post("/workOrder/saveRemark", sendRemark).then(function(res) {
						if(res.status === 200) {
							//页面信息同步
							value.remarks = res.data;
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