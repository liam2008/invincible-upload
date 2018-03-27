(function() {
	var app = angular.module('app.margin.group', []);
	app.controller('groupCtrl', ['$scope', '$http', 'DTOptionsBuilder',
		function($scope, $http, DTOptionsBuilder) {
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
				.withOption('order', [
					[2, 'desc']
				])
				.withOption('iDisplayLength', 25)
				.withButtons([{
					extend: 'copy'
				}, {
					extend: 'excel',
					title: 'ExampleFile'
				}, {
					extend: 'pdf',
					title: 'ExampleFile'
				}, {
					extend: 'print',
					customize: function(win) {
						$(win.document.body).addClass('white-bg');
						$(win.document.body).find('table').addClass('compact').css('font-size', '10px')
					}
				}]);

			var loading = function() {
				$http({
					method: 'GET',
					url: App.config.server + '/profit/teamProfitShow',
					params: $scope.where
				}).then(function(res) {
					$scope.list = res.data['list'];
					$scope.total = res.data['total'];
					$scope.hasTotal = res.data['hasTotal']
				})
			}

			loading()
			$scope.load = function() {
				var startDate = $scope.where.daterange.startDate;
				var endDate = $scope.where.daterange.endDate;
				$scope.where.startDate = typeof(startDate) == 'string' ? startDate : moment(startDate).format('YYYY-MM-DD');
				$scope.where.endDate = typeof(endDate) == 'string' ? endDate : moment(endDate).format('YYYY-MM-DD');
				loading()
			}
		}
	])
})();