(function() {
	var app = angular.module('app.base.goodsManage', []);

	app.controller('goodsManageCtrl', ['$scope', 'netManager', 'DTOptionsBuilder', 'DTColumnDefBuilder', 'SweetAlert', '$filter', 'notify', '$timeout',
		function($scope, netManager, DTOptionsBuilder, DTColumnDefBuilder, SweetAlert, $filter, notify, $timeout) {
			$scope.dtOptionsNew = DTOptionsBuilder.newOptions();

			//渲染页面
			notify.config({
				duration: 2000
			});

			init();
			
			// 管理员下拉框显示请选择
			$scope.selectMember = true;
			$scope.editSelectMember = true;
			$scope.editAdministratorStyle = false;

			//点击编辑
			$scope.edit = function(index) {
				$scope.index = index;
				var editItem = $scope.tableOption.tableList[index];
				console.log("编辑的数据",editItem)

				// 根据小组名找该小组的成员绑定到select中
				$scope.teamObject = {};
				$scope.teamObject = administratorSelect(editItem.team.name);
				if(!editItem.manager) {
					
				}else {
					// 根据管理员_id动态的选择该成员
					var administrator = "";
					for(var o = 0; o < $scope.teamObject.members.length; o++) {
						if($scope.teamObject.members[o]._id === editItem.manager._id) {
							administrator = $scope.teamObject.members[o]._id;
							break;
						}
					}
				}

				$scope.modalData = {
					'asin': editItem.asin,
					'sellerSku': editItem.sellerSku,
					'shop': editItem.shop,
					'nameCN': editItem.nameCN,
					'price': editItem.price,
					'team': editItem.team,
					'state': String(editItem.state.num),
					'projectedSales': editItem['projectedSales'],
					'storeSku': editItem['storeSku'],
					'productId': editItem['productId'],
					'shelfTime': editItem['shelfTime'] || null,
					'editAdministrator': administrator
				};
				//console.log($scope.modalData);
				$scope.editForm.submitted = false;
			};

			//编辑保存数据
			$scope.saveData = function() {
				// 验证管理员是否为空
				$scope.editForm.submitted = true;
				if($scope.editForm.$valid) {
					SweetAlert.swal({
						title: "你确定修改吗?",
						text: "你将修改此条数据!",
						type: "warning",
						showCancelButton: true,
						confirmButtonText: "确定",
						cancelButtonText: "取消",
						closeOnConfirm: false,
						closeOnCancel: true
					},
					function(isConfirm) {
						if(isConfirm) {
							//console.log('$scope.modalData', $scope.modalData);
							var comfirmData = {
								"asin": $scope.modalData.asin,
								"sellerSku": $scope.modalData.sellerSku,
								"shopId": $scope.modalData.shop.shopId,
								"nameCN": $scope.modalData.nameCN,
								"productId": $scope.modalData.productId,
								"price": Number($scope.modalData.price) || 0,
								"teamId": $scope.modalData.team.teamId,
								"state": $scope.modalData.state || 0,
								"projectedSales": Number($scope.modalData['projectedSales']) || 0,
								"shelfTime": $scope.modalData['shelfTime'] ? moment($scope.modalData['shelfTime']).format('YYYY-MM-DD') : null,
								"manager": $scope.modalData.editAdministrator
							};
							//console.log('comfirmData', comfirmData);
							//console.log('Smartdo.PRODUCT_STATE', Smartdo.PRODUCT_STATE);
							netManager.post('/base/update', comfirmData).then(function(res) {
								angular.extend($scope.tableOption.tableList[$scope.index], $scope.modalData, {
									shelfTime: comfirmData.shelfTime
								});
								$scope.tableOption.tableList[$scope.index].state = {
									name: Smartdo.PRODUCT_STATE[comfirmData.state],
									num: comfirmData.state
								};
								var editIndex = ($scope.tableOption.currentPage - 1) * $scope.tableOption.itemsPerPage + $scope.index;
								angular.extend($scope.tableOption.initList[editIndex], $scope.modalData, {
									shelfTime: comfirmData.shelfTime
								});
								$scope.tableOption.initList[editIndex].state = {
									name: Smartdo.PRODUCT_STATE[comfirmData.state],
									num: comfirmData.state
								};
								$("#editRow").modal("hide");
								// 编辑成功后不刷新列表进入第一页，将数据填充后保存当前编辑页
								editFillItem(res.data,$scope.index);
								swal("提示", "编辑成功", "success");
								$scope.teamObject = {};
								$scope.modalData = null;
							}, function(err) {
								console.error(err.data.description);
								swal("提示", "编辑失败", "error");
							});
						}
					});
				}
				
			};

			//添加商品
			var addGoods = {};
			$scope.saveGoods = function() {
				$scope.formAdd.submitted = true;
				if($scope.formAdd.$valid) {
					//$("#addGoodModule").modal("hide");
					var addGoodsData = {
						asin: $scope.addGoods.asin,
						sellerSku: $scope.addGoods.sellerSku,
						FBA: $scope.addGoods.fba ? Number($scope.addGoods.fba) : null,
						fnsku: $scope.addGoods.fnsku || null,
						productId: $scope.addGoods.productId,
						name: $scope.addGoods.name || null,
						shopId: $scope.addGoods.shop.shopId,
						teamId: $scope.addGoods.team.teamId,
						state: $scope.addGoods.state,
						projectedSales: $scope.addGoods['projectedSales'] || null,
						price: Number($scope.addGoods.price) || null,
						manager: $scope.addGoods.addAdministrator
					};

					netManager.post('/base/saveMerchandise', addGoodsData).then(function(res) {
						if(res.status === 200) {
							swal("提示", '添加成功', 'success');
							$("#addGoodModule").modal("hide");
							init();
							$scope.teamObject = {};
							$scope.addGoods = null;
						}
					}, function(err) {
						var errorMessage = '添加失败,' + err.data.description;
						swal("提示", errorMessage, 'error');
						$scope.formAdd.submitted = false;
						console.err(err.code);
					});
				}
			};
			$scope.addGoods = addGoods;

			//删除
			$scope.delete = function(index) {
				SweetAlert.swal({
						title: "你确定删除吗?",
						text: "你将删除此条数据!",
						type: "warning",
						showCancelButton: true,
						confirmButtonText: "确定",
						cancelButtonText: "取消",
						closeOnConfirm: false,
						closeOnCancel: true
					},
					function(isConfirm) {
						if(isConfirm) {
							var id = $scope.tableOption.tableList[index].id;
							netManager.delete('/base/deleteMerd/' + id).then(function(res) {
								$scope.tableOption.tableList.splice(index, 1);
								var editIndex = ($scope.tableOption.currentPage - 1) * $scope.tableOption.itemsPerPage + index;
								$scope.tableOption.initList.splice(editIndex, 1);
								swal("提示", '删除成功', 'success');
							}, function(err) {
								console.error('error', err.data.description);
								swal("提示", "删除失败", "error");
							});
						}
					});
			};

			//库存sku选择
			$scope.chooseSKU = function(stockItem) {
				console.log('stockItem', stockItem);
				//多了一项中文名
				if($('#editRow').css('display') === 'block') {
					$scope.modalData.nameCN = stockItem['name_cn'];
					$scope.modalData.storeSku = stockItem['store_sku'];
					$scope.modalData.productId = stockItem['_id'];
				} else {
					$scope.addGoods.skuName = stockItem['name_cn'];
					$scope.addGoods.storeSku = stockItem['store_sku'];
					$scope.addGoods.productId = stockItem['_id'];
				}
			};

			//所属店铺选择
			$scope.chooseShop = function(shop) {
				if($('#editRow').css('display') === 'block') {
					$scope.modalData.shop = shop;
				} else {
					$scope.addGoods.shop = shop;
				}
			};

			//所属小组选择
			$scope.chooseTeam = function(team) {
				// 组合对象成数组
				$scope.teamObject = {};
				$scope.addGoods.addAdministrator = '';
				
				if($('#editRow').css('display') === 'block') {
					$scope.modalData.team = team;
					// 管理员下拉框选择 -- 编辑
					$scope.modalData.editAdministrator = "";
					$scope.editAdministratorStyle = true;
					$scope.teamObject = administratorSelect(team.name);
				} else {
					$scope.addGoods.team = team;
					// 管理员下拉框选择 -- 新增
					$scope.teamObject = administratorSelect(team.name);
				}
			};

			//初始化页面
			function init() {
				$scope.isLoad = true;
				netManager.get('/base/list').then(function(res) {
					res.data = JSON.parse(Smartdo.Utils.pakoUnzip(res.data));
					var data = res.data;
					console.log('res.data', res.data);
					var shopNames = res.data['shopsNames'];
					data.list.map(function(val) {
						var country, addr;
						if(val.shop.name) {
							country = val.shop.name.split('-')[2]
						} else {
							country = "US"
						}
						addr = Smartdo.SIDE_ADDR[country];
						val.url = 'http://www.amazon.' + addr + '/dp/' + val['asin'];
					});

					// 列表清单
					var tableOption = new Table();
					tableOption.init(data.list);
					$scope.tableOption = tableOption;

					// 库存SKU的弹出框--所属店铺的弹出框
					$scope.stockList = data.stockList;
					$scope.shopNames = shopNames;

					// 权限
					$scope.rights = data.rights;

					// 所属小组的弹出框--管理员下拉框
					$scope.teamList = res.data.teamList;
					$scope.teamUser = res.data.teamUser;

					$scope.isLoad = false;
				}, function(err) {
					console.error(err);
				});
			}

			//table 方法
			function Table() {
				this.initList = []; //初始化数
				this.searchList = []; //保存搜索出来
				this.tableList = []; //呈现在页面的数据
				this.itemsPerPage = 10;
				this.totalItems = 0;
				this.currentPage = 1;
				this.searchData = ''
			}
			Table.prototype = {
				constructor: Table,
				pageChangeFn: function() {
					var skip = (this.currentPage - 1) * this.itemsPerPage;
					if(this.searchData) { //有搜索内容
						this.tableList = angular.copy(this.searchList).splice(skip, this.itemsPerPage);
						this.totalItems = this.searchList.length;
					} else { //没有搜索内容
						this.tableList = angular.copy(this.initList).splice(skip, this.itemsPerPage);
						this.totalItems = this.initList.length;
					}
				},
				searchFn: function() {
					if(!this.searchData) { //没有搜索内容
						this.currentPage = 1;
					}
					this.searchList = $filter('filter')(angular.copy(this.initList), this.searchData);
					this.pageChangeFn();
				},
				init: function(renderList) {
					this.initList = renderList;
					this.pageChangeFn();
				}
			};

			//点击导出excel
			$scope.exprotExcel = function() {
				$timeout(function() {
					var excelList = angular.copy($scope.tableOption.initList);
					var excelData = [];
					excelList.forEach(function(excel) {
						var state = "";
						if(excel.state == 0) {
							state = "停售";
						} else if(excel.state == 1) {
							state = "未开售";
						} else if(excel.state == 2) {
							state = "推广期";
						} else if(excel.state == 3) {
							state = "在售期";
						} else if(excel.state == 4) {
							state = "清仓期";
						} else if(excel.state == 5) {
							state = "归档";
						} else if(excel.state == 6) {
							state = "备用";
						} else {
							state = excel.state
						}
						excelData.push({
							"ASIN": excel.asin,
							"ASIN地址": excel.url,
							"中文名": excel.nameCN,
							"MSKU": excel.sellerSku,
							"库存SKU": excel.storeSku,
							"FNSKU": excel.fnsku,
							"店铺名": excel.shop.name,
							"小组名": excel.team.name,
							"上架时间": excel.shelfTime,
							"状态": state,
							"预计日销量": excel.projectedSales,
							"标准价格": excel.price
						});
					});
					genExcel(excelData);
				}, 0);

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

				function genExcel(excelData) {
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
					console.log('XLSX.utils', XLSX.utils);
					wb.Sheets['Sheet1'] = XLSX.utils.json_to_sheet(excelData);
					saveAs(new Blob([s2ab(XLSX.write(wb, wopts))], {
						type: "application/octet-stream"
					}), "商品" + '.' + (wopts.bookType == "biff2" ? "xls" : wopts.bookType));
					console.log("success")
				}

			};

			// 管理员下拉框--新增
			function administratorSelect(team_name) {
				var administrator = {};
				for(name in $scope.teamUser) {
					if(team_name == name) {
						administrator.teamName = name;
						administrator.members = $scope.teamUser[name];
					}
				}
				return administrator;
			}

			// 点击添加按钮的时候禁止自动提交
			function addGoodsSubmit() {
				$scope.teamObject = {};
				$scope.formAdd.submitted = false;
			}
			
			// 编辑后保存当前页，只是改变编辑的那条记录信息
			function editFillItem(data,index) {
				var editIndex = ($scope.tableOption.currentPage - 1) * $scope.tableOption.itemsPerPage + index;
				combinationAdministrator($scope.tableOption.tableList[index],$scope.tableOption.tableList[index].team.name,data.manager,$scope.tableOption.initList[editIndex]);
			}
			
			// 组合成管理员
			function combinationAdministrator(originalData,team_name,managerId,theMostPrimitiveData) {
				$scope.Arr = [];
				var flag = "";
				var objFlag = "";
				var managerName = {
					_id: "",
					name: ""
				};
				for(name in $scope.teamUser) {
					if(name === team_name) {
						$scope.Arr = $scope.teamUser[name].slice(0);
						flag = "haveThisTeamName";
					}
				}
				if(flag === "haveThisTeamName") {
					for(var i = 0; i < $scope.Arr.length; i++) {
						if($scope.Arr[i]._id === managerId) {
							managerName.name = $scope.Arr[i].name;
							managerName._id = $scope.Arr[i]._id;
							objFlag = "haveManagerObject";
						}
					}
				}
				if(objFlag === "haveManagerObject") {
					originalData.manager = managerName;
					theMostPrimitiveData.manager = managerName;
				}
			}
			
			// 点击分页后，页能同步修改数据
			
			
			
		}
	]);
}());