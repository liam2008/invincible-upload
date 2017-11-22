(function() {
	var app = angular.module('app.files.views', []);
	app.controller('fileViewsCtrl', ['$scope', 'netManager', '$timeout',
		function($scope, netManager, $timeout) {
			$scope.keyword = '';
			$scope.list = [];

			netManager.get('/files/fileManager').then(function(res) {
				$scope.list = res.data
			});

			$scope.search = function() {
				$scope.searchList = [];
				for(var i = 0; i < $scope.list.length; i++) {
					if($scope.list[i]['name'].indexOf($scope.keyword) != -1 || $scope.list[i]['type'] == $scope.keyword) {
						$scope.searchList.push($scope.list[i])
					}
				}
			}

			$scope.viewer = function(val) {
				$scope.modalName = val.name;
				if(val.type == 'pdf') {
					$scope.pdfUrl = App.config.server + val.href;
					$timeout(function() {
						document.getElementById('zoomfit').click()
					}, 200)
					$('#pdf-modal').modal('show');
				} else {
					$('#mp4-modal video').attr('src', $scope.host + val.href);
					$('#mp4-modal').modal('show');
				}
			}

		}
	])
})();