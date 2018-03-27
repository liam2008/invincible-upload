(function() {
	var app = angular.module('app.base.storeLog', []);
	app.controller('storeLogCtrl', ['$scope', 'netManager', 'DTOptionsBuilder', 'SweetAlert',
		function($scope, netManager, DTOptionsBuilder, SweetAlert) {
			//控制加载load-icon
			$scope.isLoad = true;
			$scope.productState = Smartdo.PRODUCT_STATE;
			$scope.dtOptions = DTOptionsBuilder.newOptions().withOption('order', [
				[6, 'desc']
			]);
			$scope.dtOptionsLog = DTOptionsBuilder.newOptions();

			//初始页面
			init();

			//点击登记
			$scope.register = function(item) {
				$scope.registerHouse = "";
				$scope.editItemJournals = item.journals;
				console.log("item.journals", $scope.editItemJournals)
				$('#registerLog').modal('show');
				$scope.activeItem = item;
				$scope.registerData = {
					id: item.id,
					sku: item.sku,
					name: item.name,
					stock: item.stock || 0,
					time: moment().format('YYYY-MM-DD'),
					unit: item.unit || '',
					note: item.note || '',
					enter: item.enter || 0,
					output: item.output || 0
				};
				$scope.registerForm.submitted = false;
			};
			
			/*需求：登记出入库页面，当前库存量根据仓库的不同而变化
			 *思路：
			 * 1、下拉列表中被选中的文本值
			 * 2、与该商品所在的所有仓库作比较（含有该商品的仓库、不含该商品的仓库[包含“请选择”]）作比较
			 * 3、改变对应的当前库存的值
			 * @ $scope.editItemJournals：Array :该商品所在的所有仓库
			 * @ $scope.registerData.stock：Number :当前库存量
			 */
			$scope.toggleHouse = function() {
				var selectEle= document.getElementById("registerHouse");
				//被选中的文本：String
				var txt=selectEle.options[selectEle.options.selectedIndex].text;
				//分为两种情况：一含有该商品的所有仓库，二不含该商品的仓库
				var judge = $scope.editItemJournals.some(function(value) {
					if(value.house === txt) {return true;}
				});
				if(judge) {//含有
					$scope.editItemJournals.forEach(function(value,index) {
						if(txt === value.house) {
							$scope.registerData.stock = value.stock;
						}
					});
				}else {//不含有
					if(txt === "请选择") {//默认
							$scope.registerData.stock = $scope.activeItem.stock;
						}else{//不含仓
							$scope.registerData.stock = 0;
						}
				}
					
			}
			
			//保存登记数据
			$scope.saveERegister = function() {
				if($scope.registerData.enter || $scope.registerData.output) {
					$scope.registerForm.submitted = true;
					if($scope.registerForm.$valid && $scope.registerData.time) {
						SweetAlert.swal({
								title: "你确定登记数据吗?",
								text: "你将登记此条数据!",
								type: "warning",
								showCancelButton: true,
								confirmButtonText: "确定",
								cancelButtonText: "取消",
								closeOnConfirm: true,
								closeOnCancel: true
							},
							function(isConfirm) {
								if(isConfirm) {
									$scope.registerData.house = $scope.registerHouse;
									$scope.registerData.time = moment($scope.registerData.time).format('YYYY-MM-DD')
									console.log("sendData", $scope.registerData)
									netManager.post('/stores/register', $scope.registerData).then(function(res) {
										$scope.activeItem.unit = res.data.unit;
										$scope.activeItem.stock = res.data.stock;
										$scope.activeItem.updatedAt = res.data.updatedAt;

										swal("保存成功!", "success");
										init();
										$('#registerLog').modal('hide');
									}, function(err) {
										swal("保存失败", err.description, "error");
										console.error(err.code);
									});
								}
							});
					}
				} else {
					SweetAlert.swal("保存失败", '请填写入库或出库数量', "warning");
				}

			};

			//点击出入库日志
			$scope.journal = function(id) {
				$scope.checkHouse = '';
				$scope.journalData = {
					startTime: '2017-10-01',
					endTime: moment().format('YYYY-MM-DD'),
					id: id
				};
				var sendData = {
					id: id,
					startTime: '2017-10-01',
					endTime: $scope.journalData.endTime
				};
				netManager.get('/stores/journal', sendData).then(function(res) {
					$scope.journalList = res.data;
					console.log("journalList", res);
				}, function(err) {
					SweetAlert.swal("保存失败", err.description, "error");
					console.error(err.data);
				});
			};

			//查询日志
			$scope.checkLog = function() {
				var sendData = {
					id: $scope.journalData.id,
					house: $scope.checkHouse,
					startTime: moment($scope.journalData.startTime).format('YYYY-MM-DD'),
					endTime: moment($scope.journalData.endTime).format('YYYY-MM-DD')
				};
				console.log("checkHouse", sendData);
				netManager.get('/stores/journal', sendData).then(function(res) {
					$scope.journalList = res.data;
				}, function(err) {
					SweetAlert.swal("保存失败", err.description, "error");
					console.error(err.data);
				});
			};
			
			//查看库存明细
			/*思路：
			 * 1、点击  当前条目的查看明细
			 * 2、传参获取  当前条目的库存信息
			 * 3、用表格 展示 当前条目的库存信息
			 */
			$scope.readDetails = function(item) {
				$("#storeDetails").modal('show');
				$scope.storeDetailsList = item.journals;
			}

			//初始化页面
			function init() {
				$scope.isLoad = true;
				netManager.get('/stores/list').then(function(res) {
					$scope.tableData = res.data.productList;
					$scope.houseList = res.data.houseSelect;
					$scope.isLoad = false;
					console.log('tableData', res);
				}, function(err) {
					console.error(err.data);
				});
			}
		}
	]);

}());