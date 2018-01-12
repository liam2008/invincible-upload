(function() {
	var app = angular.module('app.sample.loan', []);
	app.controller('loanCtrl', ['$scope', 'netManager', 'DTOptionsBuilder',
		function($scope, netManager, DTOptionsBuilder) {
			//数据模型
			$scope.where = {};
			$scope.pageCount = 1;
			//分页查询
			$scope.handlePagination = function(page) {
				$scope.where.currentPage = page;
				if($('#daterange').val()) {
					$scope.where.startTime = $('#daterange').val().split(' 至 ')[0];
					$scope.where.endTime = $('#daterange').val().split(' 至 ')[1];
				} else {
					delete $scope.where.startTime
					delete $scope.where.endTime
				}
				netManager.get('/samples/buys', $scope.where).then(function(res) {
					$scope.sampleList = res.data.list;
					$scope.pageCount = res.data.pageCount
				})
			}
			$scope.handlePagination(1)
		}
	])
})();