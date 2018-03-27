(function() {
	var app = angular.module('app.margin.gross', []);
	app.controller('grossCtrl', ['$scope', '$http', 'DTOptionsBuilder', '$timeout',
		function($scope, $http, DTOptionsBuilder, $timeout) {
			$scope.loading = true;
			$scope.list = [];
			$scope.day = moment().format('d');

			$scope.where = {
				daterange: {
					startDate: moment().subtract(2, 'days').startOf('months').format('YYYY-MM-DD'),
					endDate: moment().subtract(2, 'days').format('YYYY-MM-DD')
				},
				startDate: moment().subtract(2, 'days').startOf('months').format('YYYY-MM-DD'),
				endDate: moment().subtract(2, 'days').format('YYYY-MM-DD')
			};

			$scope.dtOptions = DTOptionsBuilder.newOptions()
				.withDOM('<"html5buttons"B>lTfgitp')
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
				})
				.withOption('retrieve', true)
				.withOption('scrollX', true)
				.withOption('fixedColumns', {
					leftColumns: 4
				})
				.withOption('order', [
					[3, 'desc']
				])
				.withButtons([{
					extend: 'excel'
				}])

			var loading = function() {
				$http({
					method: 'GET',
					url: App.config.server + '/profit/profitShow',
					params: $scope.where
				}).then(function(res) {
					res.data = JSON.parse(Smartdo.Utils.pakoUnzip(res.data));
					$scope.list = res.data['list'];
					$scope.storeName = res.data['storeName'];
					$scope.teamName = res.data['teamName'];
					$scope.total = res.data['total'];
					$scope.hasTotal = res.data['hasTotal'];
					$timeout(function() {
						$scope.loading = false
					}, 1000)
				})
			}

			loading()
			$scope.load = function() {
				$scope.loading = true;
				var startDate = $scope.where.daterange.startDate;
				var endDate = $scope.where.daterange.endDate;
				$scope.where.startDate = typeof(startDate) == 'string' ? startDate : moment(startDate).format('YYYY-MM-DD');
				$scope.where.endDate = typeof(endDate) == 'string' ? endDate : moment(endDate).format('YYYY-MM-DD');
				loading()
			}

			$scope.info = function(val) {
				$scope.content = {
					sellerSku: val.sku,
					shopName: val.store_name,
					teamName: val.group_name
				};
				$http({
					method: 'GET',
					url: App.config.server + '/profit/profitDetail',
					params: $scope.content
				}).then(function(res) {
					$scope.content.asin = res.data.asin;
					$scope.content.nameCN = res.data.nameCN;
					$scope.content.storeSku = res.data.storeSku;
					$('#modal').modal('show')
				})
			}
		}
	])
})();