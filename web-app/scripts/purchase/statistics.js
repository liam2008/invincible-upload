(function() {
	var app = angular.module('app.purchase.statistics', []);
	app.controller('statisticsCtrl', ['$scope', 'netManager', '$http', 'DTOptionsBuilder',
		function($scope, netManager, $http, DTOptionsBuilder) {
			$scope.dtOptions = DTOptionsBuilder.newOptions()
				.withDOM('<"html5buttons"B>lTfgitp')
				.withButtons([])
				.withOption('language', {
					"sProcessing": "处理中...",
					"sLengthMenu": "显示 _MENU_ 项结果",
					"sZeroRecords": "没有匹配结果",
					"sInfo": "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
					"sInfoEmpty": "显示第 0 至 0 项结果，共 0 项",
					"sInfoFiltered": "(由 _MAX_ 项结果过滤)",
					"sSearch": "搜索:",
					"sEmptyTable": "表中数据为空",
					"sLoadingRecords": "载入中...",
					"oPaginate": {
						"sFirst": "首页",
						"sPrevious": "上页",
						"sNext": "下页",
						"sLast": "末页"
					}
				});

			$scope.loading = function() {
				$http({
					method: 'GET',
					url: App.config.server + '/purchase/purTotal',
					params: {
						date: $('#datetime').val() || moment().format('YYYY-MM-DD')
					}
				}).then(function(res) {
					$scope.list = res.data
				})
			};
			$scope.loading();
			$scope.supplierModal = function(item) {
				netManager.get('/supplier/supplierList').then(function(res) {
					$scope.supplierList = res.data;
					$('#supplierModal').modal('show')
				});
				$scope.submitSupplier = function(supplier) {
					$scope.where.supplierId = supplier.supplierId;
					$scope.where.supplierName = supplier.supplierName;
					$('#supplierModal').modal('hide')
				}
			};
			$scope.removeSupplier = function(item) {
				delete $scope.where.supplierId;
				delete $scope.where.supplierName
			};
		}
	])
})();