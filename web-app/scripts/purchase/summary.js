(function() {
	var app = angular.module('app.purchase.summary', []);
	app.controller('summaryCtrl', ['$scope', 'netManager', 'DTOptionsBuilder',
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
			$scope.isLoad = true;
			$scope.purList = [];
			$scope.where = {}
			$scope.pageCount = 1;
			$scope.active = function(val) {
				$scope.purTotalPrice = 0;

				function selected(cb) {
					if(!$scope.activeItem) {
						swal({
							title: '请先选择其中一项！',
							timer: 2000
						});
						$scope.activeShow = '';
					} else {
						cb()
					}
				};
				$scope.activeShow = val.show;
				if(val.activeItem) $scope.activeItem = val.activeItem;
				if(val.show == '新增订单') {
					$scope.purchase = {
						orderStatus: '10',
						isDeclare: '0',
						purDetails: []
					}
				} else if(val.show == '编辑订单') {
					selected(function() {
						netManager.get('/purchase/purchaseOne', {
							orderNumber: $scope.activeItem.orderNumber
						}).then(function(res) {
							$scope.purchase = res.data;
							$scope.purchase.supplierName = res.data.supplier.supplierName;
							$scope.TotalPrice()
						})
					})
				} else if(val.show == '订单跟进') {
					selected(function() {
						netManager.get('/purchase/statusList', {
							orderNumber: $scope.activeItem.orderNumber
						}).then(function(res) {
							$scope.statusList = res.data
						})
					})
				} else if(val.show == '订单详情') {
					netManager.get('/purchase/detailList', {
						orderNumber: $scope.activeItem.orderNumber
					}).then(function(res) {
						$scope.detailList = res.data
					})
				}
			};
			$scope.handlePagination = function(page) {
				if(page >= 1 && page <= $scope.pageCount) {
					$scope.where.currentPage = page;
					if(!$scope.where.supplierName) {
						delete $scope.where.supplierId;
						delete $scope.where.supplierName
					};
					$scope.isLoad = true;
					netManager.get('/purchase/purList', $scope.where).then(function(res) {
						var list = JSON.parse(Smartdo.Utils.pakoUnzip(res.data));
						$scope.purList = list.purchases;
						$scope.pageCount = Math.ceil(list.pageTotal / 10);
						$scope.isLoad = false
					})
				}
			}
			$scope.handlePagination(1);
			$scope.check = function(index, val) {
				$scope.checked = index;
				$scope.activeItem = val;
			};
			$scope.submitSave = function() {
				if($scope.purchase.orderNumber && $scope.purchase.orderNumber && $scope.purchase.supplierName) {
					var purTotalPrice = 0;
					var skuDetail = [];
					$scope.purchase.orderTime = $('#orderTime').val();
					for(var i = 0; i < $scope.purchase.purDetails.length; i++) {
						purTotalPrice += parseFloat($scope.purchase.purDetails[i]['totalPrice'] || 0);
						$scope.purchase.purDetails[i]['conCovDate'] = $('.conCovDate').eq(i).val();
						$scope.purchase.purDetails[i]['salesman'] = $('.salesman').eq(i).val().split('、');
						skuDetail.push({
							storeSku: $scope.purchase.purDetails[i]['storeSku'],
							nameCN: $scope.purchase.purDetails[i]['proNameCN'],
							name: $scope.purchase.purDetails[i]['proNameEN']
						});
						if(!$scope.purchase.purDetails[i]['storeSku']) {
							swal({
								title: '请先选择商品！',
								timer: 2000
							});
							return
						};
						if(parseInt($scope.purchase.purDetails[i]['delQuantity']) > parseInt($scope.purchase.purDetails[i]['purQuantity'])) {
							swal({
								title: $scope.purchase.purDetails[i]['storeSku'],
								text: '交货数量不能大于采购数量！',
								timer: 2000
							});
							return
						};
						if($scope.purchase.purDetails[i]['delQuantity'] && !$scope.purchase.purDetails[i]['deliverDate'] || !$scope.purchase.purDetails[i]['delQuantity'] && $scope.purchase.purDetails[i]['deliverDate']) {
							swal({
								title: $scope.purchase.purDetails[i]['storeSku'],
								text: '交货数量和实际交期需同时填写！',
								timer: 2000
							});
							return
						}
					};
					if($scope.purchase.purDetails.length < 1) {
						swal({
							title: '至少保留一条商品信息！',
							timer: 2000
						});
						return
					};
					if(!$scope.purchase.remark) delete $scope.purchase.remark;
					if($scope.purchase.purchaseId) {
						$scope.purchase.supplierId = $scope.purchase.supplier.supplierId;
						netManager.post('/purchase/purUpdate', $scope.purchase).then(function(res) {
							$scope.activeItem.orderNumber = $scope.purchase.orderNumber;
							$scope.activeItem.contractNumber = $scope.purchase.contractNumber;
							$scope.activeItem.isDeclare = $scope.purchase.isDeclare;
							$scope.activeItem.orderStatus = $scope.purchase.orderStatus;
							$scope.activeItem.supplierName = $scope.purchase.supplier.supplierName;
							$scope.activeItem.purTotalPrice = purTotalPrice;
							$scope.activeItem.skuDetail = skuDetail;
							$scope.activeShow = null
						})
					} else {
						netManager.post('/purchase/purSave', $scope.purchase).then(function(res) {
							$scope.purList.push({
								skuDetail: skuDetail,
								orderNumber: $scope.purchase.orderNumber,
								contractNumber: $scope.purchase.contractNumber,
								isDeclare: $scope.purchase.isDeclare,
								orderStatus: $scope.purchase.orderStatus,
								supplierName: $scope.purchase.supplierName,
								purTotalPrice: purTotalPrice
							});
							$scope.activeShow = null
						}).catch(function(err) {
							swal({
								title: '该订单号已存在！',
								timer: 2000
							})
						})
					}
				} else {
					swal({
						title: '必填项不能为空！',
						timer: 2000
					})
				}
			};
			$scope.submitStatus = function() {
				var data = {
					orderNumber: $scope.activeItem.orderNumber,
					orderStatus: $scope.statusList.orderStatus,
					delivers: []
				};
				for(var i = 0; i < $scope.statusList.purDetails.length; i++) {
					var item = {
						deliverId: $scope.statusList.purDetails[i]['deliverId']
					};
					if($scope.statusList.purDetails[i]['delQuantity'] && $scope.statusList.purDetails[i]['delQuantity'] != '0') {
						item.delQuantity = $scope.statusList.purDetails[i]['delQuantity'];
						item.deliverDate = $('.deliverDate').eq(i).val();
					};
					if($scope.statusList.purDetails[i]['remark']) {
						item.remark = $scope.statusList.purDetails[i]['remark']
					};
					if(data.orderStatus != '40' && data.orderStatus != '60') {
						delete item.delQuantity;
						delete item.deliverDate
					};
					data.delivers.push(item)
				};
				netManager.post('/purchase/statusUpdate', data).then(function(res) {
					$scope.activeItem.orderStatus = data.orderStatus;
					$scope.activeShow = null
				}).catch(function(err) {
					swal({
						title: '所填交货数量有误，请重新填写！',
						timer: 2000
					})
				})
			};
			$scope.skuModal = function(val) {
				netManager.get('/purchase/productList').then(function(res) {
					$scope.productList = res.data;
					$('#skuModal').modal('show')
				})
				$scope.submitSku = function(sku) {
					for(var i = 0; i < $scope.purchase.purDetails.length; i++) {
						if($scope.purchase.purDetails[i]['storeSku'] == sku.storeSku && $scope.purchase.purDetails.length > 1) {
							swal({
								title: '所选商品已存在，请重新选择！',
								timer: 2000
							});
							return
						}
					};
					val.storeSku = sku.storeSku;
					val.proNameCN = sku.nameCN;
					val.proNameEN = sku.nameEn;
					$('#skuModal').modal('hide')
				}
			};
			$scope.remarkModal = function(item) {
				$scope.remarks = {
					remark: item.remark,
					remarks: item.remarks,
					storeSku: item.storeSku
				};
				$('#remarkModal').modal('show')
				$scope.submitRemark = function() {
					item.remark = $scope.remarks.remark;
					delete $scope.remarks;
					$('#remarkModal').modal('hide')
				}
			};
			$scope.supplierModal = function(item) {
				netManager.get('/supplier/supplierList').then(function(res) {
					res.data = JSON.parse(Smartdo.Utils.pakoUnzip(res.data));
					$scope.supplierList = res.data;
					$('#supplierModal').modal('show')
				});
				$scope.submitSupplier = function(supplier) {
					item.supplierId = supplier.supplierId;
					item.supplierName = supplier.supplierName;
					$('#supplierModal').modal('hide')
				}
			};
			$scope.removeSupplier = function(item, val) {
				delete item.supplierId;
				delete item.supplierName
			};
			$scope.TotalPrice = function() {
				$scope.purTotalPrice = 0;
				for(var i = 0; i < $scope.purchase.purDetails.length; i++) {
					$scope.purTotalPrice += parseFloat($scope.purchase.purDetails[i]['totalPrice']) || 0
				};
				$scope.purTotalPrice = $scope.purTotalPrice.toFixed(2)
			}
		}
	])
})();