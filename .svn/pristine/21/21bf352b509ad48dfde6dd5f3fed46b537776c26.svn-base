(function() {
	var app = angular.module('app.purchase.supplier',[]);
	app.controller('supplierCtrl', ['$scope', 'netManager', 'DTOptionsBuilder',
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
			netManager.get('/supplier/supplierList').then(function(res) {
				res.data = JSON.parse(Smartdo.Utils.pakoUnzip(res.data));
				$scope.supplierList = res.data
			})
			$scope.save = function() {
				$scope.supplier = {};
				$('#supplierModal').modal('show');
				$scope.submitSave = function() {
					netManager.post('/supplier/supplierSave', $scope.supplier).then(function(res) {
						$scope.supplier.supplierId = Date.now();
						$scope.supplier.supplierName = $scope.supplier.name;
						$scope.supplierList.push($scope.supplier);
						$('#supplierModal').modal('hide')
					})
				}
			}
			$scope.update = function(val) {
				$scope.supplier = {
					supplierId: val.supplierId,
					name: val.supplierName,
					contacts: val.contacts,
					cellphone: val.cellphone,
					telephone: val.telephone
				};
				$('#supplierModal').modal('show');
				$scope.submitSave = function() {
					netManager.post('/supplier/supplierUpdate', $scope.supplier).then(function(res) {
						val.supplierId = $scope.supplier.supplierId;
						val.supplierName = $scope.supplier.name;
						val.contacts = $scope.supplier.contacts;
						val.cellphone = $scope.supplier.cellphone;
						val.telephone = $scope.supplier.telephone;
						$('#supplierModal').modal('hide')
					})
				}
			}

		}
	])
})();