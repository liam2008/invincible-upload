(function() {
	var app = angular.module('app.daily.list', []);
	app.controller('DailyListController', ['$scope', 'DTOptionsBuilder', 'netManager', '$filter',
		function($scope, DTOptionsBuilder, netManager, $filter) {
			$scope.dtOptions = DTOptionsBuilder.newOptions()
				  .withDOM('<"html5buttons"B>lTgitp')
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
				.withButtons([{
						text: "填写墓志铭",
						action: function(e, dt, node, config) {
							//墓志铭asin初始化
							initTombstoneAsin();
							$scope.tombstoneData = {
								asin: "",
								tombstone: ""
							};
							//监测选项栏上的的值是否发生变化，发生变化后将对应的墓志铭显示在墓志铭框
							$scope.$watch("tombstoneData.asin", function() {
								//asin初值设置为空
								if($scope.tombstoneData.asin !== "") {
									$scope.tombstoneAsinList.forEach(function(val) {
										//匹配asin对应的对象
										if(val.asin === $scope.tombstoneData.asin) {
											//没有墓志铭就为空
											$scope.tombstoneData.tombstone = val.epitaph || '';
										}
									})
								}
							});
							$scope.tombstoneForm.submitted = false;
							$scope.$digest();
							$("#tombstoneModal").modal("show");
						}
					},
					{
						extend: 'excel',
						title: '每日信息',
					},
					{
						extend: 'copy',
						title: '每日信息'
					}
				]);

			//初始化数据
			var dd = new Date();
			if(dd.getHours() < 17) {
				dd.setDate(dd.getDate() - 2);
			} else {
				dd.setDate(dd.getDate() - 1);
			}
			$scope.dateData = {
				startDate: moment(dd).format('YYYY-MM-DD'),
				endDate: moment(dd).format('YYYY-MM-DD')
			};

			init();

			$scope.chechNum = function() {
				init();
			};

			/**
			 * 添加数据isDanger数据
			 * @param val
			 */
			function formatData(val) {
				var $startVal = $scope.dateData.startDate;
				var $endVal = $scope.dateData.endDate;
				var gap = new Date($endVal).getDate() - new Date($startVal).getDate();
				val.map(function(val) {
					var country, addr;
					if(val['shopName']) {
						country = val['shopName'].split('-')[2]
					} else {
						country = "US"
					}
					addr = Smartdo.SIDE_ADDR[country];
					val.url = 'http://www.amazon.' + addr + '/dp/' + val['asin'];
					val.isDanger = val.salesVolume < (gap + 1) * val.projectedSales ? true : false;
				});
				$scope.dataList = val;
			}

			//初始化
			function init() {
				var sendData = {
					timeRange: moment($scope.dateData.startDate).format('YYYY-MM-DD') + '~' + moment($scope.dateData.endDate).format('YYYY-MM-DD')
				};
				console.log('sendData', sendData);
				$scope.isLoad = true;
				netManager.get('/daily/list', sendData).then(function(res) {
						res.data = JSON.parse(Smartdo.Utils.pakoUnzip(res.data));
						if(res.data.results.length > 0) {
							$scope.initData = res.data.results;
							$scope.dataList = res.data.results;
							formatData($scope.dataList);
						} else {
							$scope.dataList = [];
							$scope.initData = [];
						}
						$scope.isLoad = false;
					})
					.catch(function(err) {
						console.error(err);
					});
			}
			//插件方法：/*$scope.dtInstance.DataTable.search(query).draw();*/
			$scope.dtInstance = {};

			//搜索数据
			$scope.searchFn = function() {
				var query = String($scope.searchData).replace(/^\s+|\s+$/g, '');
				if(query === '') {
					$scope.dataList = $scope.initData;
					$scope.hadSearch = false;
				} else if(query && $scope.initData.length) {
					$scope.hadSearch = true;
					console.log('before', $scope.dataList);
					$scope.dataList = $filter('filter')($scope.initData, query);
					var footerData = {
						salesVolume: 0,
						salesPrice: 0,
						sellableStock: 0,
						receiptingStock: 0,
						transportStock: 0
					};
					$scope.dataList.forEach(function(val, index) {
						footerData.salesVolume += val.salesVolume;
						footerData.sellableStock += val.sellableStock;
						footerData.receiptingStock += val.receiptingStock;
						footerData.transportStock += val.transportStock;
						footerData.salesPrice += val.salesPrice;
					});
					$scope.footerData = footerData;
				}
			}

			//墓志铭选择初始化
			function initTombstoneAsin() {
				netManager.get('/daily/epitaph/opt').then(function(res) {
					$scope.tombstoneAsinList = res.data;
				});
			}
			//保存墓志铭
			$scope.saveTombstone = function() {
					$scope.tombstoneForm.submitted = true;
					//表格内容符合就可以提交保存
					if($scope.tombstoneForm.$valid) {
						swal({
								title: "提示",
								text: "您确定保存墓志铭吗？",
								type: "warning",
								showCancelButton: true,
								confirmButtonText: "确定",
								cancelButtonText: "取消",
								closeOnConfirm: false
							},
							function(isConfirm) {
								if(isConfirm) {
									//保存数据到后端
									var sendTombstoneData = {
										asin: $scope.tombstoneData.asin,
										content: $scope.tombstoneData.tombstone
									};
									netManager.post("/daily/epitaph", sendTombstoneData).then(function(res) {
										if(res.status === 200) {
											swal("提示", "保存成功！", "success");
										}
									});
									$("#tombstoneModal").modal("hide");
									//保存后刷新页面
									init();
								}
							});
					}
			}
			
		}
	]);
}());