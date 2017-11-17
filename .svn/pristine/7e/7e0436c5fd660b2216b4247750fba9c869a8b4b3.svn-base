(function() {
	var app = angular.module('app');
	app.controller('grossMarginCtrl', ['$scope', 'netManager', 'DTOptionsBuilder',
		function($scope, netManager, DTOptionsBuilder) {
			$scope.list = [];
			$scope.where = {
				daterange: {
					startDate: moment().format('YYYY-MM-DD'),
					endDate: moment().format('YYYY-MM-DD')
				}
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

			netManager.get('/daily/profitShow', $scope.where).then(function(res) {
				$scope.list = res.data
			});

			$scope.load = function() {
				var startDate = $scope.where.daterange.startDate;
				var endDate = $scope.where.daterange.startDate;
				$scope.where.startDate = typeof(startDate) == 'string' ? startDate : startDate.format('YYYY-MM-DD');
				$scope.where.endDate = typeof(endDate) == 'string' ? endDate : endDate.format('YYYY-MM-DD');
				netManager.get('/daily/profitShow', $scope.where).then(function(res) {
					$scope.list = res.data
				});
			}
		}
	])
})();