(function() {
	var app = angular.module('app');
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
			$scope.purList = [];
			$scope.where = {
				orderStatus: '10'
			};
			$scope.active = function(val) {
				function selected(cb) {
					if(!$scope.activeItem) {
						swal({
							title: '请先选择其中一项！',
							animation: 'slide-from-top',
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
						purDetails: []
					}
				} else if(val.show == '编辑订单') {
					selected(function() {
						$scope.purchase = $scope.detailList
						netManager.get('/purchase/purchaseOne', {
							orderNumber: $scope.activeItem.orderNumber
						}).then(function(res) {
							$scope.purchaseOne = res.data
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
				} else if(val.show == '添加备注') {}
			};
			$scope.search = function() {
				netManager.get('/purchase/purList', $scope.where).then(function(res) {
					$scope.purList = res.data
				})
			};
			$scope.check = function(index, val) {
				$scope.checked = index;
				$scope.activeItem = val;
			};
			$scope.submitSave = function() {
				var totalPrice = 0;
				for(var i = 0; i < $scope.purchase.purDetails.length; i++) {
					totalPrice += parseFloat($scope.purchase.purDetails[i]['totalPrice']);
					$scope.purchase.purDetails[i]['conCovDate'] = $('.conCovDate').eq(i).val();
					$scope.purchase.purDetails[i]['deliverDate'] = $('.deliverDate').eq(i).val();
					if(typeof $scope.purchase.purDetails[i]['salesman'] == 'string') {
						$scope.purchase.purDetails[i]['salesman'] = $scope.purchase.purDetails[i]['salesman'].split(',')
					}
				};
				$scope.purchase.orderTime = $('#orderTime').val();
				console.log($scope.purchase)
				netManager.post('/purchase/purSave', $scope.purchase).then(function(res) {
					$scope.purList.push({
						orderNumber: $scope.purchase.orderNumber,
						contractNumber: $scope.purchase.contractNumber,
						supplierId: $scope.purchase.supplierId,
						orderStatus: $scope.purchase.orderStatus,
						remark: $scope.purchase.remark,
						totalPrice: totalPrice
					});
					$scope.activeShow = null
				})
			};
			$scope.submitStatus = function() {
				var data = {
					orderNumber: $scope.activeItem.orderNumber,
					orderStatus: $scope.statusList.orderStatus,
					delivers: []
				};
				for(var i = 0; i < $scope.statusList.purDetails.length; i++) {
					data.delivers.push({
						deliverId: $scope.statusList.purDetails[i]['deliverId'],
						delQuantity: $scope.statusList.purDetails[i]['delQuantity'],
						deliverDate: $scope.statusList.purDetails[i]['deliverDate']
					})
				};
				netManager.post('/purchase/statusUpdate', data).then(function(res) {
					$scope.activeItem.orderStatus = data.orderStatus;
					$scope.activeShow = null
				})
			};
			$scope.submitRemark = function(val) {
				netManager.get('/purchase/addRemark', {
					orderNumber: $scope.activeItem.orderNumber,
					remark: val
				}).then(function(res) {
					$scope.activeItem.remark = val;
					$scope.activeShow = null
				})
			};
			$scope.skuModal = function(val) {
				netManager.get('/purchase/productList').then(function(res) {
					$scope.productList = res.data;
					$('#skuModal').modal('show')
				})
				$scope.submitSku = function(sku) {
					val.storeSku = sku.storeSku;
					val.proNameCN = sku.nameCN;
					val.proNameEN = sku.nameEn;
					$('#skuModal').modal('hide')
				}
				$scope.skuChange = function(val) {
					$scope.skuChangeList = [];
					for(var i = 0; i < $scope.productList.length; i++) {
						if($scope.productList[i]['storeSku']) var storeSku = $scope.productList[i]['storeSku'].indexOf(val) != -1;
						if($scope.productList[i]['nameCN']) var nameCN = $scope.productList[i]['nameCN'].indexOf(val) != -1;
						if($scope.productList[i]['nameEN']) var nameEN = $scope.productList[i]['nameEN'].indexOf(val) != -1;
						if(storeSku || nameCN || nameEN) {
							$scope.skuChangeList.push($scope.productList[i])
						}
					}
				}
			};
			$scope.supplierModal = function(item) {
				netManager.get('/supplier/supplierList').then(function(res) {
					$scope.supplierList = res.data;
					$('#supplierModal').modal('show')
				})
				$scope.submitSupplier = function(supplier) {
					item.supplierId = supplier.supplierId;
					item.supplierName = supplier.supplierName;
					$('#supplierModal').modal('hide')
				}
			};
			netManager.get('/purchase/purList').then(function(res) {
				$scope.purList = res.data
			});
		}
	])
})();