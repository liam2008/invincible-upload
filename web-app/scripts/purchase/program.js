(function() {
	var app = angular.module('app.purchase.program', []);
	app.controller('programCtrl', ['$scope', 'netManager', 'DTOptionsBuilder',
		function($scope, netManager, DTOptionsBuilder) {
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
				.withButtons([])

			console.log($scope.account.id, $scope.account.name, $scope.account.role.department)
			$scope.where = {
				pageSize: 10,
				currentPage: 1
			};
			$scope.list = [];
			$scope.pageCount = [1];
			$scope.pagination = function(val) {
				if(val >= 1 && val <= $scope.pageCount.length) {
					$scope.where.currentPage = val;
					netManager.get('/purchasePlan/show', $scope.where).then(function(res) {
						$scope.list = res.data.datas;
						$scope.pageCount = [];
						for(var i = 1; i <= (res.data.pageCount || 1); i++) {
							$scope.pageCount.push(i)
						}
					})
				}
			};
			$scope.active = function(val) {
				$scope.activeItem = {};
				$scope.activeItem.applicantId = $scope.account.id;
				$scope.activeItem.applicantName = $scope.account.name;
				$scope.activeShow = val.activeShow;
				if(val.activeShow == '采购计划') {
					if($('#daterange').val()) {
						$scope.where.startTime = $('#daterange').val().split(' 至 ')[0];
						$scope.where.endTime = $('#daterange').val().split(' 至 ')[1];
					} else {
						delete $scope.where.startTime;
						delete $scope.where.endTime;
					};
					$scope.pagination($scope.where.currentPage)
				} else if(val.activeShow == '新增采购计划') {
					$scope.activeItem.details = [];
					$scope.addDetail();
					$scope.count()
				} else {
					$scope.activeItem.plan_id = val.activeItem.plan_id;
					netManager.get('/purchasePlan/editShow', $scope.activeItem).then(function(res) {
						$scope.activeItem = res.data;
						$scope.count()
					})
				}
			};
			$scope.active({
				activeShow: '采购计划'
			});
			$scope.addDetail = function() {
				$scope.activeItem.details.push({
					local_storage: 0,
					fba_storage: 0,
					average_7: 0,
					average_30: 0,
					expected_sales: 0,
					local_transport: 0,
					abroad_transport: 0,
					prepare_period: 0,
					safety_stock: 0,
					purchase_amount: 0,
					unit_cost: 0,
					estimate_production_days: 0,
					least_amount: 0,
					advance_pay_rate: '预付30%',
					first_time: '否'
				})
			};
			$scope.removeDetail = function(item) {
				if($scope.activeItem.details.length > 1) {
					$scope.activeItem.details.splice($scope.activeItem.details.indexOf(item), 1)
				} else {
					swal({
						title: '至少保留一条商品内容！',
						timer: 2000
					})
				}
			};
			$scope.count = function() {
				$scope.activeItem['amount'] = 0;
				$scope.activeItem['total'] = 0;
				for(var i = 0; i < $scope.activeItem.details.length; i++) {
					var item = $scope.activeItem.details[i];
					item['prepare'] = parseInt(item['expected_sales']) + parseInt(item['local_transport']) + parseInt(item['abroad_transport']);
					item['amount'] = (parseInt(item['prepare_period']) + parseInt(item['prepare']) + parseInt(item['safety_stock'])) * item['expected_sales'] - item['local_storage'] - item['fba_storage'];
					item['total'] = (item['purchase_amount'] * item['unit_cost']).toFixed(2);
					$scope.activeItem['amount'] += parseInt(item['purchase_amount']) || 0;
					$scope.activeItem['total'] += parseInt(item['total']) || 0;
				}
			};
			//新增编辑
			$scope.submit = function() {
				for(var i = 0; i < $scope.activeItem.details.length; i++) {
					if(!$scope.activeItem.details[i]['productSku'] || !$scope.activeItem.details[i]['supplierName']) {
						swal({
							title: '必填项不能为空！',
							timer: 2000
						});
						return
					}
				};
				if($scope.activeItem.plan_id) {
					netManager.post('/purchasePlan/editSubmit', $scope.activeItem).then(function(res) {
						if(res.data) {
							$scope.active({
								activeShow: '采购计划'
							})
						}
					})
				} else {
					netManager.post('/purchasePlan/submit', $scope.activeItem).then(function(res) {
						if(res.data) {
							$scope.active({
								activeShow: '采购计划'
							})
						}
					})
				}
			};
			//提交审核
			$scope.submitReview = function() {
				var data = {
					plan_id: $scope.activeItem.plan_id,
					status: $scope.activeItem.status,
					review: $scope.activeItem.review,
					account: $scope.account.name
				};
				netManager.post('/purchasePlan/review', data).then(function(res) {
					if(res.data) {
						$scope.active({
							activeShow: '采购计划'
						})
					}
				})
			};
			//选择商品
			$scope.selectSku = function(item) {
				netManager.get('/purchase/productList').then(function(res) {
					$scope.productList = res.data;
					$('#skuModal').modal('show')
				});
				$scope.submitSku = function(val) {
					for(var i = 0; i < $scope.activeItem.details.length; i++) {
						if($scope.activeItem.details[i]['product_id'] == val.id) {
							swal({
								title: '所选商品已存在，请重新选择！',
								timer: 2000
							});
							return
						}
					};
					item.product_id = val.id;
					item.productSku = val.storeSku;
					item.productName = val.nameCN;
					$('#skuModal').modal('hide')
				}
			};
			//选择供应商
			$scope.selectSupplier = function(item) {
				netManager.get('/supplier/supplierList').then(function(res) {
					$scope.supplierList = JSON.parse(Smartdo.Utils.pakoUnzip(res.data));
					$('#supplierModal').modal('show')
				});
				$scope.submitSupplier = function(val) {
					item.supplierId = val.supplierId;
					item.supplierName = val.supplierName;
					$('#supplierModal').modal('hide')
				}
			};
		}
	])
})();