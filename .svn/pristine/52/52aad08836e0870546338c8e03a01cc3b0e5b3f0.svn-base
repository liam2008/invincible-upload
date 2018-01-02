(function() {
	var app = angular.module('app.sample.buy', []);
	app.controller('buyCtrl', ['$scope', 'netManager', 'DTOptionsBuilder',
		function($scope, netManager, DTOptionsBuilder) {
			$scope.where = {
				currentPage: 1
			}
			$scope.pageCount = [1]
			$scope.sampleList = [1, 2, 3]
			$scope.handlePagination = function(page) {
				console.log(page)
			}
			$scope.active = function(show, item) {
				$scope.activeShow = show;
				$scope.activeItem = item;

			}
		}
	])
})();