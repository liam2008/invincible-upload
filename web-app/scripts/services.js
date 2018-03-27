(function() {
	'use strict';

	var app = angular.module('app');

	app.factory('netManager', [
		'$http',
		'$location',
		'$window',
		function($http, $location, $window) {
			var token = "";
			var server = App.config.server;
			var service = {};
			service.login = function(inputData) {
				var data = inputData || {};
				var api = '/token';
				return $http({
					method: 'POST',
					url: server + api,
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					transformRequest: function(obj) {
						var str = [];
						for(var p in obj) {
							if(obj.hasOwnProperty(p)) {
								str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
							}
						}
						return str.join("&");
					},
					data: data
				}).then(function(response) {
					var data = response.data || {};
					var token = data.token || "";
					// 根据needChangePassword弹出修改密码警告 （true的时候提醒用户修改密码）
					var needChangePassword = data.needChangePassword;
					var returnData = {
						ableLogin: false,
						needChangePassword: needChangePassword
					};

					var arr = token.split('.');
					if(arr.length != 3 || returnData.needChangePassword) {
						returnData.needChangePassword && $window.localStorage.setItem('token', token);
						returnData.ableLogin = false;
						return returnData;
					}

					$window.localStorage.setItem('token', token);
					returnData.ableLogin = true;
					return returnData;
				}).catch(function(e) {
					return false;
				});
			};

			service.logout = function() {
				$window.localStorage.removeItem('token');
				$location.path('/login');
			};

			service.isLoggedIn = function() {
				return $window.localStorage.token != null;
			};

			service.get = function(api, params) {
				return $http({
					method: 'GET',
					url: server + api,
					params: params
				});
			};

			service.post = function(api, data, headers) {
				return $http({
					method: 'POST',
					url: server + api,
					data: data,
					headers: headers
				});
			};

			service.put = function(api, data) {
				return $http({
					method: 'PUT',
					url: server + api,
					data: data
				});
			};

			service.delete = function(api) {
				return $http({
					method: 'DELETE',
					url: server + api
				});
			};

			service.jsonp = function(api, data) {
				return $http({
					method: 'jsonp',
					url: api + "?jsonp=JSON_CALLBACK",
					data: data
				});
			};

			return service;
		}
	]);

	//用户权限
	app.factory('permissionFn', ['shareData', function(shareData) {
		var mapRouterToPermission; //{'main.authority.rolesManage':'xxxxxxxxxxxxxx'}
		var userPermissionList = []; //转化之后的权限数组
		return {
			/***
			 * 根据权限转化 navList 的方法
			 * @param permissionList 权限 子元素
			 * @param navList shareData.navList
			 * @returns {*}
			 */
			navListFn: function(permissionList) {
				var navList = angular.copy(shareData.navList);
				if(permissionList.length === 1 && permissionList[0] === '*') {
					return navList;
				} else if(permissionList.length === 0) {
					navList.map(function(val, key) {
						val.selected = false;
						val.all = false;
						if(val.nodes.length) {
							val.nodes.map(function(valItem, key) {
								valItem.selected = false;
							});
						}
					});
					return navList;
				} else {
					navList.map(function(val, key) {
						var selIndex = 0;
						for(var i = 0; i < val.nodes.length; i++) {
							var isContain = contain(permissionList, val.nodes[i].permissionId);
							isContain && selIndex++;
							val.nodes[i].selected = isContain;
						}
						if(selIndex > 0) {
							val.selected = true;
							if(selIndex === val.nodes.length) {
								val.all = true;
							} else {
								val.all = false;
							}
						} else {
							val.selected = false;
							val.all = false;
						}
					});
					return navList;
				}
			},

			decodePermission: function(permissionList) { //主要转换['*']格式,解析
				if(permissionList.length === 1 && permissionList[0] === '*') {
					var decodeData = [];
					var mapRouterToPermission = this.mapRouterToPermission();
					for(var key in mapRouterToPermission) {
						decodeData.push(mapRouterToPermission[key]);
					}
					return decodeData; //没有原路返回
				}
				return permissionList;
			},

			encodePermission: function(navList) { //通过navList判断发送permissionList
				var encodeData = [];
				var selItem = 0; //选择上的数目

				for(var i = 0, iLen = navList.length; i < iLen; i++) {
					for(var j = 0, jlen = navList[i].nodes.length; j < jlen; j++) {
						selItem++;
						navList[i].nodes[j].selected && encodeData.push(navList[i].nodes[j].permissionId);
					}
				}

				return(encodeData.length === selItem) ? ['*'] : encodeData;
			},

			mapRouterToPermission: function() { //新建router和permisssionId的映射关系
				if(mapRouterToPermission) {
					return mapRouterToPermission;
				}
				var newMap = {};
				shareData.navList.forEach(function(val, index) {
					if(val.nodes.length > 0) {
						val.nodes.forEach(function(valItem, index) {
							newMap[valItem.id] = valItem.permissionId
						});
					}
				});
				mapRouterToPermission = newMap;
				return newMap;
			},

			setPermissions: function(permissionList) {
				mapRouterToPermission = this.mapRouterToPermission(); //新建map
				userPermissionList = this.decodePermission(permissionList);
			},

			hasPermission: function(permission) {
				if(userPermissionList.length > 0) { //防止出现[]空数组
					for(var i = 0; i < userPermissionList.length; i++) {
						if(userPermissionList[i] === permission) {
							return true;
						}
					}
				}
				return false;
			}

		};

		/***
		 * 数组是否包含 某个数值
		 * @param array 集合
		 * @param obj 判断的值
		 * @returns {boolean}
		 */
		function contain(array, obj) {
			for(var i = 0; i < array.length; i++) {
				if(array[i] == obj)
					return true;
			}
			return false;
		}

	}]);

	//共享数据
	app.factory('shareData', [function() {
		return {
			permissionList: [], //传输中的权限值，[*]
			navList: [{
					"id": 'main.authority', //配置id主要的作用在切换权限的时候，关联父子选择权限，侧边栏选择,主要是页面位置交互相关
					"title": "权限管理",
					"selected": true, //子元素有一项选中就是true
					"all": true, //子元素全选就是true
					"icon": 'fa-user-o',
					"permissionId": "764574d8252142f9bc251140e15988b5", //主要是权限相关的
					"nodes": [{
							"id": 'main.authority.rolesManage',
							"title": "角色管理",
							"selected": true,
							"permissionId": "a9ad8c5d99a54952a1ac34d6ee2bbcb3"
						},
						{
							"id": 'main.authority.userManage',
							"title": "用户管理",
							"selected": true,
							"permissionId": "24674d03a6a243ef97190079d88b1cb0"
						},
						{
							"id": 'main.authority.teamsManage',
							"title": "小组管理",
							"selected": true,
							"permissionId": "48558fee2c0f4d2d851899feecddf9af"
						},
						{
							"id": 'main.authority.creatVersionsLog',
							"title": "添加日志",
							"selected": true,
							"permissionId": "481ca86831844004804b72fe59a90a7b"
						}
					]
				},
				{
					"id": 'main.base',
					"title": "基础信息管理",
					"selected": true,
					"all": true,
					"icon": 'fa-pencil-square-o',
					"permissionId": "2122d126a6d844dc93132681d1303f2e",
					"nodes": [{
							"id": 'main.base.categoryManage',
							"title": "品类管理",
							"selected": true,
							"permissionId": "910e2251d5a74c6ca6ccb2f86d55cf1c"
						},
						{
							"id": 'main.base.goodsManage',
							"title": "商品管理",
							"selected": true,
							"permissionId": "f0edb847bc264cfb89f8e2a1b8b4e387"
						},
						{
							"id": 'main.base.shopManage',
							"title": "商店管理",
							"selected": true,
							"permissionId": "b089f6c5c55d42618f3c626579034080"
						},
						{
							"id": 'main.base.stockManage',
							"title": "库存管理",
							"selected": true,
							"permissionId": "32d7bafa5f484531a3b6a0b4f8ec8dd4"
						},
						{
							"id": 'main.base.storeLog',
							"title": "出入库管理",
							"selected": true,
							"permissionId": "bf3c3260784942eb9bb0cee86019d44a"
						},
						{
							"id": 'main.base.commodityManagement',
							"title": "产品管理",
							"selected": true,
							"permissionId": "03d746f1544b479c9eaf4583cc5cca12"
						},
						{
							"id": 'main.base.storeManagement',
							"title": "仓库管理",
							"selected": true,
							"permissionId": "579b0c08feec4492a02282076bd8f8eb"
						}
					]
				},
				{
					"id": 'main.daily',
					"title": "每日运营",
					"selected": true,
					"icon": 'fa-area-chart',
					"all": true,
					"permissionId": "5de4fd347a8f4768bd55e0a0c5ba44bd",
					"nodes": [{
							"id": 'main.daily.import',
							"title": "信息导入",
							"selected": true,
							"permissionId": "bba9d842ba1443a9ba94ce056876dd62"
						},
						{
							"id": 'main.daily.list',
							"title": "每日信息",
							"selected": true,
							"permissionId": "322604f48cae46db990ce5ddfb3daebf"
						},
						{
							"id": 'main.daily.report',
							"title": "每日报表",
							"selected": true,
							"permissionId": "f9ab7eb705b94b389c5a8a2ebc253645"
						},
						{
							"id": 'main.daily.operationSale',
							"title": "运营销售情况",
							"selected": true,
							"permissionId": "dbc0f8ec81724bf28e173c9e29b177a5"
						}
					]
				},
				{
					"id": 'main.count',
					"title": "毛利率计算",
					"selected": true,
					"all": true,
					"icon": 'fa-calculator',
					"permissionId": "d7d4c7b0032d4b26b1b19659ad0dae35",
					"nodes": [{
							"id": 'main.count.counter',
							"title": "毛利率计算器",
							"selected": true,
							"permissionId": "a92ef3d366a84885b35d9bc4f174c096"
						},
						{
							"id": 'main.count.formula',
							"title": "公式说明",
							"selected": true,
							"permissionId": "82dd2c187d034b8e958d644a9f2216ed"
						}
					]
				},
				{
					"id": 'main.rank',
					"title": "排名",
					"selected": true,
					"all": true,
					"icon": 'fa-line-chart',
					"permissionId": "17cc4bf3dc904fdd96664b7fad2324bb",
					"nodes": [{
						"id": 'main.rank.sellerRank',
						"title": "卖家排名",
						"selected": true,
						"permissionId": "c50d6e50f4704a30a75b2e0b94d5e5f9"
					}]
				},
				{
					"id": 'main.purchase',
					"title": "采购管理",
					"selected": true,
					"all": true,
					"icon": 'fa fa-truck',
					"permissionId": "91a0096cf86a4cc4ae61d307eeeb297d",
					"nodes": [{
							"id": 'main.purchase.program',
							"title": "采购计划",
							"selected": true,
							"permissionId": "35f4c8b11a034d0e8e0380d987027551"
						},
						{
							"id": 'main.purchase.summary',
							"title": "采购记录",
							"selected": true,
							"permissionId": "2821679a8b784aee812258ba3f88ab0d"
						},
						{
							"id": 'main.purchase.statistics',
							"title": "采购统计",
							"selected": true,
							"permissionId": "6b43b2b1a50c411d89bd9551e9b40fa4"
						},
						{
							"id": 'main.purchase.supplier',
							"title": "供应商管理",
							"selected": true,
							"permissionId": "bbafb9e0628e4aa5bfd0ffb2b84dc10f"
						}
					]
				},
				{
					"id": 'main.sample',
					"title": "样品管理",
					"selected": true,
					"all": true,
					"icon": 'fa fa-suitcase',
					"permissionId": "b33a50a1415e4b12bdfae17b331ed3a0",
					"nodes": [{
							"id": 'main.sample.buy',
							"title": "样品购买",
							"selected": true,
							"permissionId": "8c40302154ab4d24b7a1be88aafd8be9"
						},
						{
							"id": 'main.sample.apply',
							"title": "样品申请",
							"selected": true,
							"permissionId": "3d52f761095b4a44bb55-278010680fa2"
						},
						{
							"id": 'main.sample.loan',
							"title": "样品借还",
							"selected": true,
							"permissionId": "679324b16efe49f1a06495f0f140b548"
						}
					]
				},
				// {
				// 	"id": 'main.margin',
				// 	"title": "毛利率统计报表",
				// 	"selected": true,
				// 	"all": true,
				// 	"icon": 'fa-bar-chart',
				// 	"permissionId": "3e98920726624d54ade18b654edcdb5d",
				// 	"nodes": [{
				// 			"id": 'main.margin.group',
				// 			"title": "小组毛利率",
				// 			"selected": true,
				// 			"permissionId": "ea319b6d63eb41a4ab36668c5a6db082"
				// 		},
				// 		{
				// 			"id": 'main.margin.gross',
				// 			"title": "SKU毛利率",
				// 			"selected": true,
				// 			"permissionId": "11e09c47cbbf4fa4b3ff156970fe8c70"
				// 		}
				// 	]
				// },
				{
					"id": 'main.files',
					"title": "在线学习",
					"selected": true,
					"all": true,
					"icon": 'fa-file-text-o',
					"permissionId": "ef7a96382c3641eb930b93ed531af765",
					"nodes": [{
							"id": 'main.files.views',
							"title": "知识库",
							"selected": true,
							"permissionId": "3d2a114512644e3d82bbc552dec865c9"
						},
						{
							"id": 'main.files.manage',
							"title": "资料管理",
							"selected": true,
							"permissionId": "fbaf80cd5c964bac9bb0ae33a58b1781"
						}
					]
				},
				{
					"id": 'main.analysis',
					"title": "统计分析",
					"selected": true,
					"all": true,
					"icon": 'fa-align-left',
					"permissionId": "b7610f2304904d319eea5d0d5975f017",
					"nodes": [{
							"id": 'main.analysis.task',
							"title": "评论任务",
							"selected": true,
							"permissionId": "d592ea43e5484661885d1f37ffca8bfa"
						},
						{
							"id": 'main.analysis.review',
							"title": "review分析",
							"selected": true,
							"permissionId": "abd72f4e0ca649f3aad54e838f27243d"
						},
						{
							"id": 'main.analysis.keyword',
							"title": "关键字分析",
							"selected": true,
							"permissionId": "cb398c7d38da415f8a6af3044fbee6ce"
						}
					]
				},
				{
					"id": 'main.workOrder',
					"title": "工单系统",
					"selected": true,
					"all": true,
					"icon": 'fa-file-o',
					"permissionId": "1e6f698aafc6485bb8c16b6df7a7354a",
					"nodes": [{
						"id": 'main.workOrder.clickTask',
						"title": "点击任务",
						"selected": true,
						"permissionId": "647a9be3562347af9b666f6a16a6ccf9"
					}, {
						"id": 'main.workOrder.createOrder',
						"title": "创建工单",
						"selected": true,
						"permissionId": "5645127ef89f42d9b900d0411b256482"
					}, {
						"id": 'main.workOrder.dealingOrder',
						"title": "待处理工单",
						"selected": true,
						"permissionId": "1621f31d43e94c3bb7b96d3f13b78061"
					}, {
						"id": 'main.workOrder.dealedOrder',
						"title": "已处理工单",
						"selected": true,
						"permissionId": "d79a1d069fbf4382a04de3490161d260"
					}, {
						"id": 'main.workOrder.customerList',
						"title": "客服任务分配表",
						"selected": true,
						"permissionId": "d1429d70541445a9ae5102e2a3f28c42"
					}]
				}
			]
		};
	}]);

}());