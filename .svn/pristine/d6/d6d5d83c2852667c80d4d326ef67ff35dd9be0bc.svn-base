(function() {
	var app = angular.module('app.sample.buy', []);
	app.controller('buyCtrl', ['$scope', 'netManager', 'DTOptionsBuilder',
		function($scope, netManager, DTOptionsBuilder) {
			//数据模型
			$scope.where = {};
			$scope.pageCount = 1;
			//分页查询
			$scope.handlePagination = function(page) {
				$scope.where.currentPage = page;
				if($('#daterange').val()) {
					$scope.where.startTime = $('#daterange').val().split(' 至 ')[0];
					$scope.where.endTime = $('#daterange').val().split(' 至 ')[1];
				} else {
					delete $scope.where.startTime
					delete $scope.where.endTime
				}
				netManager.get('/samples/buys', $scope.where).then(function(res) {
					$scope.sampleList = res.data.list;
					$scope.pageCount = res.data.pageCount
				})
			}
			$scope.handlePagination(1)
			//视图控制
			$scope.handleActive = function(show, item) {
				$scope.activeItem = {
					applicant: $scope.account.name,
					purchaseType: '样品采购',
					purchaseMethod: '国内采购',
					details: []
				};
				if(!show) {
					$scope.handlePagination(1);
					$scope.activeShow = show;
				} else if(show == '新建样品单') {
					$scope.handleAddDetail();
					$scope.handleCountDetail();
					$scope.activeShow = show;
				} else {
					netManager.get('/samples/buy/' + item.id).then(function(res) {
						$scope.activeItem = res.data;
						$scope.handleCountDetail();
						$scope.activeShow = show;
					})
				}
			}
			//添加子项
			$scope.handleAddDetail = function() {
				$scope.activeItem.details.push({
					img: '',
					name: '请输入样品名称',
					link: '',
					supplier: '请输入供应商',
					model: '',
					spec: '',
					color: '',
					number: '1',
					signNum: '',
					unit: '',
					price: '0.00',
					amount: '0.00',
					freight: '0.00',
					totalAmount: '0.00'
				})
				$scope.handleCountDetail()
			}
			//移除子项
			$scope.handleRemoveDetail = function(item) {
				$scope.activeItem.details.splice($scope.activeItem.details.indexOf(item), 1)
				$scope.handleCountDetail()
			}
			//合计计算
			$scope.handleCountDetail = function() {
				$scope.activeItem.amountCount = 0.00;
				$scope.activeItem.freightCount = 0.00;
				$scope.activeItem.totalAmountCount = 0.00;
				for(var i = 0; i < $scope.activeItem.details.length; i++) {
					$scope.activeItem.details[i]['amount'] = $scope.activeItem.details[i]['number'] * $scope.activeItem.details[i]['price'];
					$scope.activeItem.details[i]['totalAmount'] = parseFloat($scope.activeItem.details[i]['amount']) + parseFloat($scope.activeItem.details[i]['freight']);

					$scope.activeItem.amountCount += parseFloat($scope.activeItem.details[i]['amount']);
					$scope.activeItem.freightCount += parseFloat($scope.activeItem.details[i]['freight']);
					$scope.activeItem.totalAmountCount += parseFloat($scope.activeItem.details[i]['totalAmount'])
				}
			}
			//首页多选
			$scope.checkList = [];
			$scope.checked = function(val) {
				if(val.checkAll != undefined) {
					var sampleList = JSON.stringify($scope.sampleList);
					val.checkAll ? $scope.checkList = JSON.parse(sampleList) : $scope.checkList = [];
				}
				if(val.check != undefined) {
					val.check ? $scope.checkList.push(val.item) : $scope.checkList.splice($scope.checkList.indexOf(val.item), 1);
					$scope.checkList.length == $scope.sampleList.length ? document.getElementById('checkAll').checked = true : document.getElementById('checkAll').checked = false;
				}
			}
			$scope.checkedBtn = function(val) {
				if(!$scope.checkList.length) return;
				var sampleList = [];
				for(var i = 0; i < $scope.checkList.length; i++) {
					sampleList.push($scope.checkList[i]['id'])
				}
				if(val === 'remove') {
					netManager.post('/samples/buys/remove', sampleList).then(function(res) {
						$scope.handleActive();
						$scope.checkList = []
					})
				}
				if(val === 'success') {
					netManager.post('/samples/buys/update', sampleList).then(function(res) {
						$scope.handleActive()
					})
				}
			}
			//图片预览
			$scope.uploadChanged = function(ele) {
				var reader = new FileReader();
				reader.readAsDataURL(ele.files[0]);
				reader.onload = function(e) {
					ele.previousElementSibling.src = e.target.result
				}
			}
			//提交保存
			$scope.handleSave = function() {
				//验证
				var inputEl = document.querySelectorAll('input[valid]');
				for(var i = 0; i < inputEl.length; i++) {
					if(inputEl[i].getAttribute('valid').search('required') >= 0) {
						if(inputEl[i].value.trim() != '') inputEl[i].style.borderColor = '#e5e6e7';
						else {
							inputEl[i].style.borderColor = '#ed5565';
							return
						}
					}
					if(inputEl[i].getAttribute('valid').search('number') >= 0) {
						if(/^[0-9]*[1-9][0-9]*$/.test(inputEl[i].value)) inputEl[i].style.borderColor = '#e5e6e7';
						else {
							inputEl[i].style.borderColor = '#ed5565';
							return
						}
					}
				};
				if($scope.activeShow == '关联订单号') {
					var activeItem = {
						id: $scope.activeItem.id,
						details: []
					};
					for(var i = 0; i < $scope.activeItem.details.length; i++) {
						activeItem.details.push({
							id: i,
							oddNumber: $scope.activeItem.details[i]['oddNumber']
						})
					};
					netManager.post('/samples/buys/oddNumber', activeItem).then(function(res) {
						$scope.handleActive()
					})
				} else if($scope.activeShow == '签收') {
					var activeItem = {
						id: $scope.activeItem.id,
						details: []
					};
					for(var i = 0; i < $scope.activeItem.details.length; i++) {
						activeItem.details.push({
							id: i,
							signNumber: $scope.activeItem.details[i]['signNumber']
						})
					};
					var formData = new FormData();
					formData.append('data', JSON.stringify(activeItem));
					var imgFile = document.querySelectorAll('input[type=file]');
					for(var i = 0; i < imgFile.length; i++) {
						if(imgFile[i].files[0]) formData.append(i, imgFile[i].files[0])
					};
					netManager.post('/samples/buys/signNumber', formData, {
						'Content-Type': undefined
					}).then(function(res) {
						$scope.handleActive()
					})

				} else {
					var formData = new FormData();
					formData.append('data', JSON.stringify($scope.activeItem));
					var imgFile = document.querySelectorAll('input[type=file]');
					for(var i = 0; i < imgFile.length; i++) {
						if(imgFile[i].files[0]) formData.append(i, imgFile[i].files[0])
					};
					netManager.post('/samples/buys', formData, {
						'Content-Type': undefined
					}).then(function(res) {
						//$scope.handleActive()
					})
				}
			}
		}
	])
})();