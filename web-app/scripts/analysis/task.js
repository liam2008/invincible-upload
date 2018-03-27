(function() {
	var app = angular.module('app.analysis.task', []);
	app.controller('taskCtrl', ['$scope', 'netManager', 'DTOptionsBuilder', "SweetAlert",
		function($scope, netManager, DTOptionsBuilder, SweetAlert) {
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
				})
				.withOption('order', [
					[0, 'desc']
				]);
			$scope.where = {
				classify: 'amws'
			};
			netManager.get('/appraise/reviewSite').then(function(res) {
				$scope.reviewSite = res.data.site || []
			});
			$scope.handlePagination = function(page) {
				$scope.where.currentPage = page;
				netManager.get('/appraise/reviewContent', $scope.where).then(function(res) {
					$scope.reviewList = res.data.content;
					$scope.taskList = res.data.task;
					$scope.where.taskId = $scope.where.taskId || res.data.task[0];
					$scope.pageCount = 0 || Math.ceil(res.data.pageTotal / 10)
				})
			}
			$scope.handlePagination(1)

			//添加任务或清空
			$scope.active = function(show) {
				if($scope.where.classify == 'walmart') {
					$scope.reviewTask = [{
						site: $scope.reviewSite[$scope.reviewSite.length - 1]["value"]
					}]
				} else {
					$scope.reviewTask = [{
						site: $scope.reviewSite[0]["value"]
					}]
				}
			};

			//提交
			$scope.submitSave = function() {
				//验证
				var inputEl = document.querySelectorAll('input[valid]');
				for(var i = 0; i < inputEl.length; i++) {
					if(inputEl[i].getAttribute('valid').search('required') >= 0) {
						if(inputEl[i].value.trim() != '') inputEl[i].style.borderColor = '#e5e6e7';
						else {
							inputEl[i].value = '';
							inputEl[i].style.borderColor = '#ed5565';
							inputEl[i].placeholder = '不能为空！';
							return;
						}
					}
				};
				var num = 0;
				SweetAlert.swal({
					title: "提示",
					text: "您确认添加任务吗？",
					type: "info",
					showCancelButton: true,
					closeOnConfirm: false,
					confirmButtonText: "确认",
					cancelButtonText: "取消"
				}, function(isConfirm) {
					num++;
					if(isConfirm && num == 1) {
						netManager.post('/appraise/setReviewDescTask', {
							content: $scope.reviewTask
						}).then(function(res) {
							swal('提示', '添加成功！', 'success');
							console.log($scope.reviewTask);
							delete $scope.reviewTask;
							$("#addModal").modal("hide");
						}, function(err) {
							swal('提示', '添加失败!', 'error');
							console.error(err);
						})
					}
				});
			};
			$scope.remove = function(index) {
				$scope.reviewTask.length > 1 ? $scope.reviewTask.splice(index, 1) : swal('提示', '至少保留一条数据', 'warning')
			};

			function s2ab(s) {
				if(typeof ArrayBuffer !== 'undefined') {
					var buf = new ArrayBuffer(s.length);
					var view = new Uint8Array(buf);
					for(var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
					return buf;
				} else {
					var buf = new Array(s.length);
					for(var i = 0; i != s.length; ++i) buf[i] = s.charCodeAt(i) & 0xFF;
					return buf;
				}
			}

			var genExcel = function(excelData) {
				var wopts = {
					bookType: 'xlsx',
					bookSST: false,
					type: 'binary'
				}; //这里的数据是用来定义导出的格式类型
				var wb = {
					SheetNames: ['Sheet1'],
					Sheets: {},
					Props: {}
				};
				wb.Sheets['Sheet1'] = XLSX.utils.json_to_sheet(excelData);
				saveAs(new Blob([s2ab(XLSX.write(wb, wopts))], {
					type: "application/octet-stream"
				}), "review" + '.' + (wopts.bookType == "biff2" ? "xls" : wopts.bookType));
			}

			$scope.excel = function() {
				netManager.get('/appraise/reviewExcel', $scope.where).then(function(res) {
					var data = res.data || {};
					var content = data.content || [];
					genExcel(content);
					console.log("content", content)
				})
			}

			$scope.handleTask = function(item) {
				$('#taskModal').modal('show')
				$scope.handleSubmitTask = function(val) {
					item.taskId = val;
					$scope.where.taskId = val;
					$scope.handlePagination(1);
					$('#taskModal').modal('hide')
				}
			}
			$scope.handleClassify = function() {
				delete $scope.where.taskId;
				$scope.handlePagination(1)
			}

		}
	])
})();