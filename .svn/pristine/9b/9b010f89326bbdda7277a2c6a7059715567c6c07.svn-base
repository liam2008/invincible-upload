(function() {
	var app = angular.module('app.files.manage', []);
	app.controller('fileManageCtrl', ['$scope', '$http', '$timeout',
		function($scope, $http, $timeout) {
			$scope.keyword = '';
			$scope.list = [];
			$http.get(App.config.server + '/files/fileManager').then(function(res) {
				$scope.list = res.data;
			})

			$scope.search = function() {
				$scope.searchList = [];
				for(var i = 0; i < $scope.list.length; i++) {
					if($scope.list[i]['name'].indexOf($scope.keyword) != -1 || $scope.list[i]['type'] == $scope.keyword) {
						$scope.searchList.push($scope.list[i])
					}
				}
			}

			$scope.upload = function(val) {
				if(val.files[0]['name'].indexOf('@') == -1) {
					var formData = new FormData();
					formData.append('file', val.files[0]);
					$http.post(App.config.server + '/files/fileManager/uoload', formData, {
						headers: {
							'Content-Type': undefined
						}
					}).then(function(res) {
						if(res.data) {
							val.value = '';
							$scope.list.push(res.data);
							swal('上传成功', res.data.name, "success");
						}
					})
				} else {
					swal('命名冲突', '文件名不能包含@', 'warning')
				}
			}

			$scope.update = function(val) {
				swal({
					title: '文档名称编辑！',
					text: val.name,
					type: 'input',
					showCancelButton: true,
					closeOnConfirm: false,
					cancelButtonText: '取消',
					confirmButtonText: '确认',
					animation: 'slide-from-top',
					inputPlaceholder: '请输入新文件名'
				}, function(inputValue) {
					if(inputValue === false) return;
					if(inputValue === '') {
						swal.showInputError('你需要输入一些话！')
						return
					};
					if(inputValue.indexOf('@') === -1) {
						val.newname = inputValue;
						$http.post(App.config.server + '/files/fileManager/update', val).then(function(res) {
							if(res.data) {
								val.href = res.data.href;
								val.name = res.data.name;
								swal('重命名成功', inputValue, 'success')
							}
						})
					} else {
						swal('命名冲突', '文件名不能包含@', 'warning')
					}
				})
			}

			$scope.remove = function(val) {
				swal({
					title: '是否删除文件?',
					type: 'warning',
					showCancelButton: true,
					closeOnConfirm: false,
					cancelButtonText: '取消',
					confirmButtonText: '确认'
				}, function() {
					$http.post(App.config.server + '/files/fileManager/remove', val).then(function(res) {
						if(res.data) {
							$scope.list.splice($scope.list.indexOf(val), 1);
							swal('删除成功', val.name, 'success');
						}
					})
				})
			}
		}
	])
})();