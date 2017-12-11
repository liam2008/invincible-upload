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
				
			$scope.list = [{
				plan_id: 'PCP20171125001',
				status: '待处理',
				applicant: '张三',
				store_sku: [{
					sku: 'DET-CMX1900034',
					name: '时钟蓝牙音箱 MX-19 黑色'
				}, {
					sku: 'DET-CMX1900035',
					name: '时钟蓝牙音箱 MX-19 白色'
				}, {
					sku: 'DET-CMX1900034',
					name: '时钟蓝牙音箱 MX-19 黑色'
				}, {
					sku: 'DET-CMX1900035',
					name: '时钟蓝牙音箱 MX-19 白色'
				}, {
					sku: 'DET-CMX1900035',
					name: '时钟蓝牙音箱 MX-19 白色'
				}, {
					sku: 'DET-CMX1900035',
					name: '时钟蓝牙音箱 MX-19 白色'
				}],
				remarks: [{
					sku: 'DET-CMX1900034',
					name: '时钟蓝牙音箱 MX-19 黑色'
				}, {
					sku: 'DET-CMX1900035',
					name: '时钟蓝牙音箱 MX-19 白色'
				}, {
					sku: 'DET-CMX1900034',
					name: '时钟蓝牙音箱 MX-19 黑色'
				}, {
					sku: 'DET-CMX1900035',
					name: '时钟蓝牙音箱 MX-19 白色'
				}, {
					sku: 'DET-CMX1900035',
					name: '时钟蓝牙音箱 MX-19 白色'
				}]
			}]

			$scope.where = {
				pageSize: 10,
				currentPage: 1
			};
			$scope.pageCount = function() {
				var pageCount = [];
				for(var i = 1; i <= 20; i++) {
					pageCount.push(i)
				};
				return pageCount
			};
			$scope.pagination = function(val) {
				if(val >= 1 && val <= $scope.pageCount().length) {
					$scope.where.currentPage = val;
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
			$scope.active = function(val) {
				$scope.activeItem = {};
				$scope.activeShow = val.activeShow;
				if(val.activeShow) {
					if(val.activeShow == '新增采购计划') {
						$scope.activeItem.details = [];
						$scope.addDetail();
						$scope.count()
					} else {
						$scope.activeItem.plan_id = val.activeItem.plan_id;
						$scope.activeItem.applicant = val.activeItem.applicant;
						$scope.activeItem.details = [];
						$scope.addDetail();
						$scope.count()
					}
				}
			};
			$scope.load = function() {
				if($('#daterange').val()) {
					$scope.where.startDate = $('#daterange').val().split(' 至 ')[0];
					$scope.where.endDate = $('#daterange').val().split(' 至 ')[1];
				};
				netManager.get('/purchase/program', $scope.where).then(function(res) {

				})
			};
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
					advance_pay_rate: 0,
					first_time: '0'
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
			$scope.update = function() {
				$scope.activeShow = '编辑采购计划';
			};
			$scope.info = function() {
				$scope.activeShow = '采购计划详情';
			};
			$scope.submit = function() {
				netManager.post('/purchasePlan/submit', $scope.activeItem).then(function(res) {

				})
			};
			$scope.selectSku = function(item) {
				netManager.get('/purchase/productList').then(function(res) {
					$scope.productList = res.data;
					$('#skuModal').modal('show')
				});
				$scope.submitSku = function(val) {
					item.store_sku = val.storeSku;
					item.name_cn = val.nameCN;
					$('#skuModal').modal('hide')
				}
			};
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