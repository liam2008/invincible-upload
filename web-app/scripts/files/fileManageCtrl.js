(function() {
	var app = angular.module('app.files.manage', []);
	app.controller('fileManageCtrl', ['$scope', 'netManager', '$http',
		function($scope, netManager, $http) {
			// 筛选条件
			$scope.where = {
				keyword: '',
				currentPage: 1
			};
			// 查询用户
			netManager.get('/files/users').then(function(res) {
				$scope.users = res.data || []
			});
			// 分页查询
			$scope.handlePagination = function(page, type) {
				$scope.where.type = type;
				$scope.where.currentPage = page;
				if(type) delete $scope.where.keyword;
				netManager.get('/files/list', $scope.where).then(function(res) {
					$scope.where.type = type || '';
					$scope.list = res.data.results;
					$scope.pageCount = res.data.pageCount
				});
			};
			$scope.handlePagination(1);
			// 文件上传
			$scope.upload = function(val) {
				var file = val.files[0];
				var fileName = file.name;
				var fileSize = Math.round(file['size'] / 1024) + ' KB';
				var fileType = file.name.substr(file.name.lastIndexOf('.') + 1, 3);

				if(fileSize > 102400) {
					swal('文件太大！', '上传文件请保持在100mb以下', 'warning');
					return
				};
				if(['doc', 'pdf', 'mp4', 'zip'].indexOf(fileType) == -1) {
					swal('格式错误！', '请上传 pdf mp4 word zip 文件类型', 'warning');
					return
				};

				netManager.get('/files/exists', {
					name: fileName
				}).then(function(res) {
					var filePush = function() {
						$scope.isLoad = true;
						var formData = new FormData();
						formData.append('file', file);
						$http.post(App.config.server + '/files/upload', formData, {
							headers: {
								'Content-Type': undefined
							}
						}).then(function(res) {
							if(res.data.name) {
								swal('上传成功', res.data.name, 'success');
								$scope.where = {
									type: '',
									keyword: '',
									currentPage: 1
								};
								$scope.handlePagination(1)
							} else {
								swal('上传失败', fileName, 'warning')
							};
							$scope.isLoad = false;
						}).catch(function(err) {
							$scope.isLoad = false;
							swal('上传失败', fileName, 'warning')
						})
					};
					if(res.data.exists) {
						swal({
							title: "文件已存在？",
							text: "你是否替换该文件！",
							type: 'warning',
							showCancelButton: true,
							closeOnConfirm: false,
							cancelButtonText: '取消',
							confirmButtonColor: "#dd6b55",
							confirmButtonText: "确认"
						}, function(isConfirm) {
							if(isConfirm) {
								swal.close();
								filePush()
							}
						})
					} else {
						filePush()
					};
					val.value = ''
				})
			};
			// 文件重命名
			$scope.rename = function(val) {
				swal({
					title: '文档名称编辑！',
					text: val.name,
					type: 'input',
					showCancelButton: true,
					closeOnConfirm: false,
					cancelButtonText: '取消',
					confirmButtonText: '确认',
					inputPlaceholder: '请输入新文件名'
				}, function(inputValue) {
					if(!inputValue || inputValue === '') {
						swal.showInputError('你需要输入新文件名！')
						return
					};
					netManager.post('/files/update', {
						id: val._id,
						oldName: val.name,
						newName: inputValue
					}).then(function(res) {
						if(res.data.errmsg) {
							swal('文件名已存在！', inputValue, 'warning')
						} else {
							val.name = res.data;
							swal('更改成功', val.name, 'success')
						}
					})
				})
			};
			// 权限设置
			$scope.setModal = function(val) {
				$scope.item = val;
				$scope.active = JSON.parse(JSON.stringify(val));
				$('#setModal').modal('show')
			};
			$scope.updateChange = function(val) {
				var allId = '000000000000000000000000';
				if(val.authorize.length > 1 && val.authorize.indexOf(allId) != -1) {
					val.authorize = [allId]
				}
			};
			$scope.update = function() {
				netManager.post('/files/authorize', $scope.active).then(function(res) {
					if(res.data.ok) {
						swal('设置成功', $scope.active.name, 'success');
						$scope.item.authorize = $scope.active.authorize;
						$scope.item.tips = $scope.active.tips;
						$('#setModal').modal('hide')
					}
				})
			};
			// 文件移除
			$scope.remove = function(val) {
				swal({
					title: "确定删除吗？",
					text: "你将无法恢复该文件！",
					type: 'warning',
					showCancelButton: true,
					closeOnConfirm: false,
					cancelButtonText: '取消',
					confirmButtonColor: "#dd6b55",
					confirmButtonText: "删除"
				}, function() {
					netManager.get('/files/remove?id=' + val._id).then(function(res) {
						if(res.data) {
							swal('删除成功', val.name, 'success')
							$scope.handlePagination(1);
						} else {
							swal('删除失败', val.name, 'warning')
						}
					})
				})
			};

		}
	])
})();