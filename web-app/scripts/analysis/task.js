(function() {
	var app = angular.module('app.analysis.task', []);
	app.controller('taskCtrl', ['$scope', 'netManager', 'DTOptionsBuilder',
		function($scope, netManager, DTOptionsBuilder) {
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
			$scope.where = {};
			$scope.pageCount = 1;
			$scope.handlePagination = function(page) {
				if(page >= 1 && page <= $scope.pageCount) {
					$scope.where.currentPage = page;
					netManager.get('/appraise/reviewContent', $scope.where).then(function(res) {
						$scope.reviewList = res.data.content;
						$scope.taskList = res.data.task;
						$scope.pageCount = Math.ceil(res.data.pageTotal / 10)
					})
				}
			}
			$scope.handlePagination(1)
			$scope.active = function(show) {
				$scope.activeShow = show;
				$scope.activeItem = {};
			}

			$scope.submitSave = function() {
				var list = [];
				var str = $scope.activeItem.content.split('\n');
				var item = str[0].toLowerCase().split('	');
				if(item[0] == 'asin' && item[1] == 'side' && item[2] == '品牌') {
					delete $scope.err;
					for(var i = 1; i < str.length; i++) {
						list.push({
							asin: str[i].split('	')[0],
							side: str[i].split('	')[1],
							brand: str[i].split('	')[2]
						})
					}
					netManager.post('/appraise/setReviewDescTask', {
						content: list
					}).then(function(res) {
						if(res.data) $scope.active(null)
					})
				} else {
					$scope.err = '格式错误！请重新输入'
				}
			}

			$scope.handleTask = function(item) {
				$('#taskModal').modal('show')
				$scope.handleSubmitTask = function(val) {
					item.taskId = val;
					console.log(item)
					$('#taskModal').modal('hide')
				}
			}
			$scope.handleDelTask = function(item) {
				delete item.taskId
			}

		}
	])
})();