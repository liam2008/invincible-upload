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
				
			//条件搜索
			$scope.statuses = Smartdo.PURCHASE_PLAN_STATUSES;
			$scope.where = {
				wordbench: 1
			};
			$scope.handlePagination = function(page) {
				$scope.where.currentPage = page;
				var reqData = {
					pageSize: 10,
					currentPage: page,
					workbench: $scope.where.workbench
				};
				if($scope.where.status) reqData.status = $scope.where.status;
				if($scope.where.plan_id) reqData.plan_id = $scope.where.plan_id;
				if($scope.where.applicant) reqData.applicant = $scope.where.applicant._id;
				if($scope.where.operator) reqData.operator = $scope.where.operator._id;
				if($scope.where.supplyChain) reqData.supplyChain = $scope.where.supplyChain._id;
				if($('#daterange').val()) {
					reqData.startTime = $('#daterange').val().split(' 至 ')[0];
					reqData.endTime = $('#daterange').val().split(' 至 ')[1];
				};
				netManager.get('/purchasePlan/show', reqData).then(function(res) {
					$scope.count = res.data.count;
					$scope.addDisabled = res.data.add;
					$scope.purchasePlan = res.data.datas;
					$scope.pageCount = res.data.pageCount;
				})
				netManager.get('/purchasePlan/getPeoples').then(function(res) {
					$scope.people = res.data;
					if($scope.where.applicant) {
						for(var i = 0; i < $scope.people.applicant.length; i++) {
							if($scope.people.applicant[i]['name'] == $scope.where.applicant['name']) {
								$scope.where.applicant = $scope.people.applicant[i];
								break
							}
						}
					}
					if($scope.where.operator) {
						for(var i = 0; i < $scope.people.operator.length; i++) {
							if($scope.people.operator[i]['name'] == $scope.where.operator['name']) {
								$scope.where.operator = $scope.people.operator[i];
								break
							}
						}
					}
					if($scope.where.supplyChain) {
						for(var i = 0; i < $scope.people.supplyChain.length; i++) {
							if($scope.people.supplyChain[i]['name'] == $scope.where.supplyChain['name']) {
								$scope.where.supplyChain = $scope.people.supplyChain[i];
								break
							}
						}
					}
				})
			}
			$scope.handlePagination(1);
			//视图显示控制
			$scope.handleActive = function(val) {
				delete $scope.err;
				$scope.activeItem = {};
				$scope.activeItem.applicantId = $scope.account.id;
				$scope.activeItem.applicantName = $scope.account.name;
				if(!val.activeShow) {
					$scope.handlePagination(1);
					$scope.activeShow = val.activeShow
				} else if(val.activeShow == '新增采购计划') {
					$scope.activeItem.details = [];
					$scope.handleAddDetail();
					$scope.handleCountDetail();
					$scope.activeShow = val.activeShow
				} else {
					$scope.activeItem.plan_id = val.activeItem.plan_id;
					netManager.get('/purchasePlan/editShow', $scope.activeItem).then(function(res) {
						$scope.activeItem = res.data;
						$scope.activeItem.status = $scope.activeItem.status.toString();
						$scope.handleCountDetail();
						$scope.activeShow = val.activeShow
					})
				}
			}
			$scope.delDaterange = function() {
				$('#daterange').val('')
			};
			//新增编辑提交
			$scope.handleSave = function() {
				//验证
				var inputEl = document.querySelectorAll('#sectionB input[valid]');
				for(var i = 0; i < inputEl.length; i++) {
					if(inputEl[i].getAttribute('valid').search('required') >= 0) {
						if(inputEl[i].value.trim() != '') inputEl[i].style.borderColor = '#e5e6e7';
						else {
							inputEl[i].style.borderColor = '#ed5565';
							$scope.err = '格式有误：必填项不能为空！';
							return
						}
					}
					if(inputEl[i].getAttribute('valid').search('number') >= 0) {
						if(parseFloat(inputEl[i].value) >= 0) inputEl[i].style.borderColor = '#e5e6e7';
						else {
							inputEl[i].style.borderColor = '#ed5565';
							$scope.err = '格式有误：只能输入大于等于0的数字！';
							return
						}
					}
				};
				if($scope.activeItem >= 9999999999) {
					$scope.err = '总金额不能大于9999999999！';
					return
				};
				if($scope.activeItem.plan_id) {
					netManager.post('/purchasePlan/editSubmit', $scope.activeItem).then(function(res) {
						if(res.data) $scope.handleActive({})
					})
				} else {
					netManager.post('/purchasePlan/submit', $scope.activeItem).then(function(res) {
						if(res.data) $scope.handleActive({})
					})
				}
			}
			//部门审核提交
			$scope.isReview = true;
			$scope.handleReview = function() {
				if(!$scope.activeItem.review.remark) {
					swal({
						title: '必填项不能为空！',
						timer: 2000
					})
					return
				};
				if($scope.isReview) {
					$scope.isReview = false;
					netManager.post('/purchasePlan/review', {
						account: $scope.account.name,
						review: $scope.activeItem.review,
						plan_id: $scope.activeItem.plan_id,
						details: $scope.activeItem.details,
						total: $scope.activeItem.total,
						status: parseInt($scope.activeItem.status)
					}).then(function(res) {
						if(res.data) {
							$scope.isReview = true;
							$scope.handleActive({})
						}
					})
				}
			}
			//订单子项添加
			$scope.handleAddDetail = function() {
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
					first_time: '否',
					productSku: '',
					supplierName: ''
				})
			}
			//订单子项移除
			$scope.handleRemoveDetail = function(item) {
				if($scope.activeItem.details.length > 1) {
					$scope.activeItem.details.splice($scope.activeItem.details.indexOf(item), 1)
				} else {
					swal({
						title: '至少保留一条商品内容！',
						timer: 2000
					})
				}
			}
			//订单合计
			$scope.handleCountDetail = function() {
				$scope.activeItem['amount'] = 0;
				$scope.activeItem['total'] = 0;
				for(var i = 0; i < $scope.activeItem.details.length; i++) {
					var item = $scope.activeItem.details[i];
					item['prepare'] = parseInt(item['estimate_production_days']) + parseInt(item['local_transport']) + parseInt(item['abroad_transport']);
					item['amount'] = (parseInt(item['prepare_period']) + parseInt(item['prepare']) + parseInt(item['safety_stock'])) * item['expected_sales'] - item['local_storage'] - item['fba_storage'];
					item['total'] = (item['purchase_amount'] * item['unit_cost']).toFixed(2);
					$scope.activeItem['amount'] += parseInt(item['purchase_amount']) || 0;
					$scope.activeItem['total'] += parseFloat(item['total']) || 0;
				}
			};
			//选择库存SKU
			$scope.handleProduct = function(item) {
				netManager.get('/purchase/productList').then(function(res) {
					$scope.productList = res.data;
					$('#skuModal').modal('show')
				});
				$scope.handleSubmitProduct = function(val) {
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
			}
			//选择供应商
			$scope.handleSupplier = function(item) {
				netManager.get('/supplier/supplierList').then(function(res) {
					$scope.supplierList = JSON.parse(Smartdo.Utils.pakoUnzip(res.data));
					$('#supplierModal').modal('show')
				});
				$scope.handleSubmitSupplier = function(val) {
					item.supplierId = val.supplierId;
					item.supplierName = val.supplierName;
					$('#supplierModal').modal('hide')
				}
			}
		}
	])
})();