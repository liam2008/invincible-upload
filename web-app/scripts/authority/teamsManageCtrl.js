(function() {
	var app = angular.module('app.authority.teamsManage', []);

	app.controller('teamsManageCtrl', ['$scope', 'netManager', 'DTOptionsBuilder', 'SweetAlert',
		function($scope, netManager, DTOptionsBuilder, SweetAlert, $q) {
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
					text: '注册小组',
					action: function(e, dt, node, config) {
						$scope.addTeams = {};
						// 成员子项默认添加数组
						$scope.addTeams.details = [];
						// 成员运营级别的绑定
						selectMembers($scope.addTeams.details);
						$scope.flagArray = $scope.addTeams.details;

						$scope.$digest();
						$scope.addTeams.submitted = false;
						$scope.resisterPictureId = document.getElementById('resisterPicture');
						$scope.resisterPictureId.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAMCAYAAACEJVa/AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAZSURBVDhPY/hPBTBqCCYYNQQTDCtD/v8HAMiaLP7P1rDRAAAAAElFTkSuQmCC';
						$('#addTeamsModule').modal('show');
					}
				}])

			init();

			// 选择图片后预览
			$scope.uploadChanged = function(ele) {
				var reader = new FileReader();
				reader.readAsDataURL(ele.files[0]);
				reader.onload = function(e) {
					ele.previousElementSibling.src = e.target.result;
					// 用于做图片上传用的图片的base64码
					$scope.pictureBase64 = e.target.result;
				};
				ele.value = ''
			}

			// 修改
			var editData = {};
			$scope.edit = function(editItem, index) {
				$scope.activeItem = editItem;
				$scope.editItem = JSON.parse(JSON.stringify(editItem));

				// 默认品类列表
				var categoriesNewArray = [];
				var categoriesArray = editItem.categories;
				for(var i = 0; i < categoriesArray.length; i++) {
					for(var j = 0; j < $scope.categorys.length; j++) {
						if($scope.categorys[j]['_id'] === categoriesArray[i]['_id']) {
							categoriesNewArray.push($scope.categorys[j]['_id']);
							break
						}
					}
				}

				// 添加成员列表
				var memberNewArray = [];
				var teamInfoArray = editItem.teamInfo;
				for(var i = 0; i < teamInfoArray.length; i++) {
					memberNewArray.push({
						memberId: teamInfoArray[i]._id,
						member: teamInfoArray[i].name,
						memberLevel: teamInfoArray[i].level,
						role: teamInfoArray[i].role
					});
				}

				$scope.editData = {
					id: $scope.editItem._id,
					name: $scope.editItem.name,
					categories: categoriesNewArray,
					details: memberNewArray
				};
				
				$scope.flagArray = $scope.editData.details;

				$scope.formEdit.submitted = true;
			};

			// 修改框保存
			$scope.saveEdit = function() {
				// 图片类型和是否添加图片判断
				$scope.pictureReviseType = judgeHavePicture("revisePicture");
				// 成员添加
				$scope.addMember = judgeHaveMember('editMember', $scope.editData.details);

				$scope.editData['categories'] = $scope.editData.categories;
				$scope.editData['avatar'] = $scope.pictureBase64;

				if($scope.formEdit.$valid) {
					if($scope.pictureReviseType === 'jpg' || $scope.pictureReviseType === 'noHavePicture') {
						if($scope.addMember === "haveAddMember") {
							// 成员重新赋值
							var memberList = combinationMemberList($scope.editData.details);
							$scope.editData['details'] = memberList;
							var sendEditMessage = {
								avatar: $scope.pictureBase64,
								categories: $scope.editData.categories,
								teamInfo: memberList,
								id: $scope.editData.id,
								name: $scope.editData.name
							}
							console.log("保存", sendEditMessage);
							netManager.post('/team/update', sendEditMessage).then(function(res) {
								if(res.data.success === true) {
									$('#reviseModal').modal('hide');
									swal('更新成功', $scope.editData.name, 'success');
									init();
								} else {
									swal('更新失败', '小组名重复！请重新填写', 'error');
								}
							});
						} else {
							SweetAlert.swal("请选择小组成员!");
						}
					} else {
						SweetAlert.swal("请选择jpg格式的图片!");
					}
				}
				$scope.pictureBase64 = '';
			};
			$scope.editData = editData;

			// 删除 
			$scope.delete = function(deleteItem, index) {
				SweetAlert.swal({
						title: "你确定删除吗?",
						text: "删除数据后，会影响到商品的管理员！",
						type: "warning",
						showCancelButton: true,
						confirmButtonText: "确定",
						cancelButtonText: "取消",
						closeOnConfirm: false,
						closeOnCancel: true
					},
					function(isConfirm) {
						if(isConfirm) {
							var postData = {
								id: deleteItem._id
							};
							netManager.get('/team/remove', postData).then(function(res) {
								console.log(res.data);
								if(res.data.success === true) {
									$scope.tableData.result.splice(index, 1);
									swal('删除成功', deleteItem.name, 'success');
								} else {
									swal('删除失败', deleteItem.name, 'error');
								}
							});
						}
					});
			};

			// 注册小组 
			var addTeams = {};
			$scope.saveTeams = function() {
				// 图片类型和是否添加图片判断
				$scope.pictureRegistryType = judgeHavePicture("registryPicture");
				// 成员添加
				$scope.addMember = judgeHaveMember('registryMember', $scope.addTeams.details);

				$scope.addTeams.submitted = true;
				if($scope.formAdd.$valid) {
					if($scope.pictureRegistryType === 'jpg' || $scope.pictureRegistryType === 'noHavePicture') {
						if($scope.addMember === "haveAddMember") {
							// 组合成员列表
							var memberList = combinationMemberList($scope.addTeams.details);
							var saveTeamData = {
								name: $scope.addTeams.name,
								categories: $scope.addTeams.categories,
								avatar: $scope.pictureBase64,
								teamInfo: memberList
							};
							netManager.post('/team/save', saveTeamData).then(function(res) {
								if(res.data.success === true) {
									$('#addTeamsModule').modal('hide');
									swal('添加成功', saveTeamData.name, 'success');
									init();
								} else {
									swal('添加错误', '小组名重复！请重新填写', 'error');
								}
							});
						} else {
							SweetAlert.swal("请选择小组成员!");
						}
					} else {
						SweetAlert.swal("请选择jpg格式的图片!");
					}
				}
				$scope.pictureBase64 = '';
			};
			var registryPictureId = document.getElementById("registryPicture");
			registryPictureId.previousElementSibling.src = '';
			$scope.addTeams = addTeams;

			//初始化页面
			function init() {
				$scope.isLoad = true;
				netManager.get('/team/list').then(function(res) {
					$scope.categorys = res.data.categories;
					$scope.tableData = res.data;
					console.log($scope.tableData);

					// 运营级别
					$scope.selectLevel = $scope.tableData.selectLevel;

					// 用户选择
					$scope.selectUser = $scope.tableData.selectUser;

					$scope.isLoad = false;
				}, function(err) {
					console.error(err);
				});

			}

			// 图片预览
			$scope.sendSrcToModal = function(src) {
				var imgObj = document.getElementById('orderDetails').getElementsByTagName('img')[0];
				if(src === '') {
					imgObj.alt = '';
				} else {
					imgObj.src = src;
				}
			}

			// 判断图片是不是为空
			function judgeHavePicture(id) {
				var length = document.getElementById(id).files.length;
				if(length !== 0) {
					$scope.name = document.getElementById(id).files[0].name;
					return $scope.type = $scope.name.split(".")[1];
				} else {
					return $scope.type = 'noHavePicture';
				}
			}

			// 判断成员是不是为空
			function judgeHaveMember(memberArray, arrayModel) {
				var length = arrayModel.length;
				var flag = "";
				for(var j = 0; j < length; j++) {
					if(!arrayModel[j].memberId) {
						return flag = "noAddmember";
						break;
					} else {
						flag = "haveAddMember";
					}
				}
				return flag;
			}

			// 组合成员列表用于请求-接口要求
			function combinationMemberList(arrayModel) {
				var combinationMemberArray = []
				for(var g = 0; g < arrayModel.length; g++) {
					combinationMemberArray.push({
						_id: arrayModel[g].memberId,
						level: arrayModel[g].memberLevel
					});
				}
				return combinationMemberArray;
			}

			// 小组成员列表-成员删除
			$scope.removeMember = function(index, model) {
				var objectDetails = [];
				if(model === "edit") {
					objectDetails = $scope.editData.details;
				} else {
					objectDetails = $scope.addTeams.details;
				}
				objectDetails.length > 1 ? objectDetails.splice(index, 1) : swal('提示', '至少保留一条数据', 'warning');
			}

			// 默认选择A级别
			function selectMembers(modelMembers) {
				modelMembers.push({
					memberLevel: $scope.selectLevel[0]
				});
			}

			// 成员选择
			$scope.memberSelect = function(item) {
				$scope.itemListMember = item;
				$('#selectMember').modal('show')
			}
			$scope.chooseMember = function(peopleItem) {
				// 选择后判断是否有重复的成员
				chonseJudge($scope.flagArray, peopleItem.name, peopleItem.role, peopleItem._id)
			}

			// 小组成员添加判断-组长唯一，组员不能重复
			$scope.teamAddMember = function(flag) {
				if(flag === 'registry') {
					// 注册
					if($scope.addTeams.details.length === 1) {
						// 获取第一条记录的值，如果ID为空，则提示添加成员
						if(!$scope.addTeams.details[0].memberId) {
							swal('提示', '请添加成员', 'warning');
						} else {
							$scope.addTeams.details.push({
								memberLevel: $scope.selectLevel[0]
							});
						}
					} else {
						// 有数据的情况下
						complexJudge($scope.addTeams.details);
					}
				} else {
					// 编辑
					if($scope.editData.details.length === 0) {
						// 这个是防止以前的数据造成的影响，可能为空，所以允许添加一条数据
						$scope.editData.details.push({
							memberLevel: $scope.selectLevel[0]
						});
					} else {
						// 有数据的情况下
						complexJudge($scope.editData.details);
					}

				}
			}

			// 复杂的判断
			function complexJudge(arr) {
				if(arr.length === 1) {
					// 获取第一条记录的值，如果ID为空，则提示添加成员
					if(!arr[0].memberId) {
						swal('提示', '请添加成员', 'warning');
					} else {
						arr.push({
							memberLevel: $scope.selectLevel[0]
						});
					}
				} else {
					var editRecord = 0;
					var editArrCopyMemberId = [];
					var editArrCopyRole = [];
					var editMemberIdTemporary = "";
					var editGroupLeaderUniqueness = "";
					for(var i = 0; i < arr.length; i++) {
						// 一旦检测到有一条记录没有添加成员，那么就提示用户增加,增加后才能增加新一条记录
						if(!arr[i].memberId) {
							editRecord = i + 1;
							swal('提示', '第 ' + editRecord + ' 记录没有添加成员，请添加', 'warning');
							editMemberIdTemporary = "0";
							break;
						}
					}
					if(editMemberIdTemporary !== "0") {
						// 判断有重复添加成员吗
						for(var j = 0; j < arr.length; j++) {
							editArrCopyMemberId.push(arr[j].memberId);
							editArrCopyRole.push(arr[j].role);
						}
						// 判断是否重复
						var editRepetitionMemberId = isRepeat(editArrCopyMemberId);
						if(editRepetitionMemberId === "false") {
							editGroupLeaderUniqueness = "judgeUniqueness";
						} else {
							swal('提示', '成员不能重复', 'warning');
						}
					}
					if(editGroupLeaderUniqueness === "judgeUniqueness") {
						// 判断组长唯不唯一
						var editRepetitionRoleGroudLeader = judgeRole(editArrCopyRole);
						if(editRepetitionRoleGroudLeader === "true") {
							arr.push({
								memberLevel: $scope.selectLevel[0]
							});
						} else {
							swal('提示', '一个小组只能有唯一的组长', 'warning');
						}
					}
				}
			}

			// 选择成员时就添加判断
			function chonseJudge(arr, name, role, id) {
				if(arr.length === 1) {
					// 获取第一条记录的值，如果ID为空，则提示添加成员
					$scope.itemListMember.member = name;
					$scope.itemListMember.role = role;
					$scope.itemListMember.memberId = id;
				} else {
					var length = arr.length;
					var flag = "";
					var leaderArray = [];
					for(var i = 0; i < arr.length - 1; i++) {
						if(arr[i].memberId === id) {
							swal('提示', '成员不能重复', 'warning');
							flag = "memberRepetition";
							break;
						}
						flag = "noRepetition";
					}
					if(flag === "noRepetition") {
						for(var i = 0; i < arr.length; i++) {
							if(arr[i].role === role && role === "运营组长") {
								flag = "haveSameLeader";
							}
						}
						if(flag === "haveSameLeader") {
							swal('提示', '组长只能唯一', 'warning');
						}else {
							$scope.itemListMember.member = name;
							$scope.itemListMember.role = role;
							$scope.itemListMember.memberId = id;
						}
					}

				}
			}

			// 数组判断是否有相同元素
			function isRepeat(arr) {
				var hash = {};
				for(var i in arr) {
					if(hash[arr[i]]) {
						return "true";
					}
					hash[arr[i]] = "true";
				}
				return "false";
			}
			// 角色判断
			function judgeRole(arr) {
				var arrCopy = [];
				for(var i = 0; i < arr.length; i++) {
					if(arr[i] === "运营组长") {
						arrCopy.push(arr[i]);
					}
				}
				if(arrCopy.length === 1 || arrCopy.length === 0) {
					return "true";
				} else {
					return "false";
				}
			}

		}
	]);

}());