(function() {
	var app = angular.module('app.files.views', []);
	app.controller('fileViewsCtrl', ['$scope', 'netManager',
		function($scope, netManager) {
			// 筛选条件
			$scope.where = {
				keyword: '',
				currentPage: 1,
				isSuthorize: true
			};
			// 分页查询
			$scope.handlePagination = function(page, type) {
				$scope.where.type = type;
				$scope.where.currentPage = page;
				if(type) delete $scope.where.keyword;
				netManager.get('/files/list', $scope.where).then(function(res) {
					$scope.where.type = type || '';
					$scope.list = res.data.results;
					$scope.pageCount = res.data.pageCount
				});
			};
			$scope.handlePagination(1);
			// 操作类型
			$scope.viewer = function(val) {
				$scope.modalName = val.name;
				if(val.type === 'pdf') {
					var contentEl = document.getElementById('pdf-content');
					contentEl.src = val.path;
					$('#pdf-modal').modal('show');
				} else if(val.type === 'mp4') {
					$('#mp4-modal video').attr('src', val.path);
					$('#mp4-modal').modal('show');
				} else if(val.type === 'doc' || val.type === 'zip') {
					window.open(App.config.server + '/files/download?path=' + val.path + '&name=' + val.name)
				}
			};

		}
	])
})();