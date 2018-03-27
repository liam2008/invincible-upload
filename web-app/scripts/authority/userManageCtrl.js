(function() {
	var app = angular.module('app.authority.userManage', []);
	app.controller('userManageCtrl', ['$scope', 'netManager', 'DTOptionsBuilder',
		function($scope, netManager, DTOptionsBuilder) {
			// 数据表格配置
			$scope.dtOptions = DTOptionsBuilder.newOptions()
				.withDOM('<"html5buttons"B>lTfgitp')
				.withButtons([{
					text: '添加用戶',
					action: function() {
						$scope.activeUser = {};
						$scope.$digest();
						$('#userModal').modal('show')
					}
				}])
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
			// 获取用户列表
			$scope.getUsers = function() {
				netManager.get('/users').then(function(res) {
					$scope.userList = res.data
				})
			};
			$scope.getUsers();
			// 获取小组列表
			netManager.get('/team/opt').then(function(res) {
				$scope.teamList = res.data
			});
			// 获取角色列表
			netManager.get('/roles').then(function(res) {
				$scope.roleList = [];
				for(var i = 0; i < res.data.length; i++) {
					$scope.roleList.push({
						_id: res.data[i]['_id'],
						name: res.data[i]['name'],
						type: res.data[i]['type']
					})
				}
			});
			// 用户保存
			$scope.active = function(val) {
				$scope.activeItem = val;
				$scope.activeUser = JSON.parse(JSON.stringify(val));
				console.log(val)
				if(val['role']) {
					for(var i = 0; i < $scope.roleList.length; i++) {
						if($scope.roleList[i]['_id'] == val['role']['_id']) {
							$scope.activeUser.role = $scope.roleList[i];
							break
						}
					}
				};
				if(val['team'] && val['role']['type'] == 'director') {
					$scope.activeUser.teams = [];
					for(var i = 0; i < $scope.teamList.length; i++) {
						if(JSON.stringify(val['team']).indexOf($scope.teamList[i]['_id']) != -1) {
							$scope.activeUser.teams.push($scope.teamList[i])
						}
					}
				} else {
					for(var i = 0; i < $scope.teamList.length; i++) {
						if(val['team'] && val['team']['_id'] == $scope.teamList[i]['_id']) {
							$scope.activeUser.team = $scope.teamList[i];
							break
						}
					}
				};
				$('#userModal').modal('show')
			};
			$scope.save = function() {
				if(!$scope.myForm.$valid) return;
				var user = {
					name: $scope.activeUser['name'],
					name_en: $scope.activeUser['name_en'],
					account: $scope.activeUser['account'],
					role: $scope.activeUser['role'] ? $scope.activeUser['role']['_id'] : '',
					team: $scope.activeUser['team'] ? $scope.activeUser['team']['_id'] : '',
					password: $scope.activeUser['password'] ? CryptoJS.MD5($scope.activeUser['password']).toString(CryptoJS.enc.Base64) : ''
				};
				if($scope.activeUser['role']['type'] == 'director') {
					user.team = [];
					var teams = $scope.activeUser['teams'] || [];
					for(var i = 0; i < teams.length; i++) {
						user.team.push(teams[i]['_id'])
					}
				};
				if($scope.activeUser['_id']) {
					netManager.put('/users/' + $scope.activeUser['_id'], user).then(function(res) {
						$scope.getUsers();
						swal('提示', '更新成功！', 'success');
						$('#userModal').modal('hide')
					})
				} else {
					netManager.post('/users', user).then(function(res) {
						$scope.getUsers();
						swal('提示', '添加成功！', 'success');
						$('#userModal').modal('hide')
					}).catch(function(res) {
						swal('错误', res.data.error, 'error')
					})
				}
			}

		}
	])
})();