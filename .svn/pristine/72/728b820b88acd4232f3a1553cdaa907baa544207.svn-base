(function() {
	var app = angular.module('app.sample.apply', []);
	app.controller('applyCtrl', ['$scope', 'netManager', 'DTOptionsBuilder',
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
				netManager.get('/samples/applys', $scope.where).then(function(res) {
					$scope.sampleList = res.data.list;
					$scope.pageCount = res.data.pageCount
				})
			}
			$scope.handlePagination(1)
			//首页多选
			$scope.checkList = [];
			$scope.checked = function(val, item) {
				if(val.checkAll != undefined) {
					var sampleList = JSON.stringify($scope.sampleList);
					val.checkAll ? $scope.checkList = JSON.parse(sampleList) : $scope.checkList = [];
				}
				if(val.check != undefined) {
					val.check ? $scope.checkList.push(val.item) : $scope.checkList.splice($scope.checkList.indexOf(val.item), 1);
					$scope.checkList.length == $scope.sampleList.length ? document.getElementById('checkAll').checked = true : document.getElementById('checkAll').checked = false;
				}
			}
			//视图控制
			$scope.handleActive = function(show, item) {
				if(show === '申请借出' || show == '取消借出') {
					if(!$scope.checkList.length) return;
					$scope.activeItem = {
						applicant: $scope.account.name,
						details: []
					};
					$scope.activeItem.details = JSON.parse(JSON.stringify($scope.checkList));
					$scope.activeShow = show;
				} else if(show === '借还记录') {
					$scope.activeItem = [{
						id: 'SS2017010100001',
						name: '样品名称示例Sample name sample',
						supplier: '广州智干电子商务科技有限公司',
						model: 'Model',
						spec: 'Spec',
						color: '白色',
						applicant: '林国胜',
						overdue: 0,
						change: '确认借出',
						number: 999,
						borrow: 99,
						canBorrow: 900
					}]
					$scope.activeShow = show;
				} else {
					$scope.handlePagination(1);
					$scope.activeShow = show;
				}
			}
			//
			$scope.handleSave = function() {

				if($scope.activeShow == '申请借出') {
					var activeItem = {
						applicant: $scope.activeItem.applicant,
						details: []
					};
					for(var i = 0; i < $scope.activeItem.details.length; i++) {
						activeItem.details.push({
							id: $scope.activeItem.details[i]['id'],
							quantity: $scope.activeItem.details[i]['quantity'],
							returnTime: $scope.activeItem.details[i]['returnTime']
						})
					}
					console.log(activeItem)
				}

			}
		}
	])
})();