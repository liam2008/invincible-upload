(function() {
	var app = angular.module('app.base.stockManage', []);

	app.controller('stockManageCtrl', ['$scope', 'netManager', 'DTOptionsBuilder', 'SweetAlert',
		function($scope, netManager, DTOptionsBuilder, SweetAlert) {
			$scope.dtOptions = DTOptionsBuilder.newOptions()
				.withDOM('<"html5buttons"B>lTfgitp')
				.withButtons([{
						extend: 'excel',
						title: '产品库存管理'
					},
					{
						extend: 'copy',
						title: '产品库存管理'
					},
					{
						text: '添加产品库存',
						action: function(e, dt, node, config) {
							//初始化
							$scope.addStore = {};
							$scope.formAdd.submitted = false;
							$scope.$digest();
							//根据权限是否弹出添加框
							if($scope.authority.add) {
								$('#addGoodModule').modal('show');
							}else {
								swal('提示','您权限不够，不能添加','error');
							}
							
						}
					}
				]);

			//渲染页面
			init();

			//编辑页面数据
			$scope.edit = function(index) {
				$scope.index = index;
				$scope.editData = {
					'store_sku': $scope.tableData[index]['sku'],
					'name_cn': $scope.tableData[index]['name'],
					'id': $scope.tableData[index]['id']
				};
			};

			//修改保存数据
			$scope.saveEdit = function() {
				SweetAlert.swal({
						title: "你将编辑数据?",
						text: "你确定编辑此条数据!",
						type: "warning",
						showCancelButton: true,
						confirmButtonText: "确定",
						cancelButtonText: "取消",
						closeOnConfirm: false
					},
					function(isConfirm) {
						if(isConfirm) {
							var confirmData = {
								'store_sku': $scope.editData['store_sku'],
								'name_cn': $scope.editData['name_cn'],
								'id': $scope.editData['id']
							};
							//由于前后台的数据格式不一样，为了更新不产生请求
							var updateView = {
								'sku': $scope.editData['store_sku'],
								'name': $scope.editData['name_cn'],
								'id': $scope.editData['id']
							};
							netManager.post('/base/updateProduct', confirmData).then(function(res) {
								if(res.status === 200) {
									swal("保存成功!", "success");
									console.log("$scope.tableDataEdit", $scope.tableData)
									angular.extend($scope.tableData[$scope.index], updateView);
								}
							}, function(error) {
								swal("保存失败", error.description, "error");
							});
						}
					});
			};

			//添加商品
			var addStore = {};
			$scope.saveStore = function() {
				$scope.formAdd.submitted = true;
				if($scope.formAdd.$valid) {
					var sendData = {
						'store_sku': $scope.addStore['store_sku'],
						'name_cn': $scope.addStore['name_cn']
					};
					console.log('sendData', sendData);
					netManager.post('/base/saveProduct', sendData).then(function(res) {
						if(res.status === 200) {
							$('#addGoodModule').modal('hide');
							swal("保存成功!", "success");
							init();
						}
					}, function(err) {
						console.error(err.code);
						swal("保存失败", "err.description", "error");
					});
				}
			};
			$scope.addStore = addStore;

			//查看记录
			var logData = {};
			logData.dtOptions = DTOptionsBuilder.newOptions().withOption();
			logData.checkLog = function(value) {
				$scope.checkHouse = "";
				$scope.logData.id = value.id;
				$scope.logData.startDate = "2017-10-01";
				$scope.logData.endDate = moment().format('YYYY-MM-DD');
				/* 由于后台返回的数据不一定会有house字段，为了避免代码执行时出现属性未声明的报错*/
				var houseId = value.house ? value.house._id : '';
				
				renderLogData(value.id, $scope.logData.startDate, $scope.logData.endDate, houseId);
			}; 
			logData.checkDateLog = function() {
				var startDate = moment($scope.logData.startDate).format('YYYY-MM-DD');
				var endDate = moment($scope.logData.endDate).format('YYYY-MM-DD');
				renderLogData($scope.logData.id, startDate, endDate);
			};
			$scope.logData = logData;

			//渲染日志页面
			function renderLogData(id, startTime, endTime, houseId) {
				var sendData = {
					id: id,
					startTime: startTime || moment().format('YYYY-MM-DD'),
					endTime: endTime || moment().format('YYYY-MM-DD'),
					house: houseId || ''
				};
				console.log("checkHouse", sendData)
				netManager.get('/stores/journal', sendData).then(function(res) {
					$scope.logData.recordList = res.data;
					console.log('recordList', res)
				});

			}
			
			//主视图仓库搜索
			$scope.queryHouse = function() {
				var sendHouse = {
					house: $scope.mainHouse
				}
				console.log("house", sendHouse);
				netManager.get('/base/product', sendHouse).then(function(res) {
					$scope.tableData = res.data.productList;
				}, function(err) {
					console.error(err);
				});
			}
			//初始化页面
			function init() {
				//控制加载load-icon
				$scope.isLoad = true;
				netManager.get('/base/product').then(function(res) {
					console.log("res", res)
					$scope.tableData = res.data.productList;
					$scope.houseList = res.data.houseSelect;
					//权限控制参数
					$scope.authority = res.data.authority;
					console.log("$scope.authority", $scope.authority)
					$scope.isLoad = false;
				}, function(err) {
					console.error(err);
				});
			}
			
		//ending controller	
		}
	]);

}());