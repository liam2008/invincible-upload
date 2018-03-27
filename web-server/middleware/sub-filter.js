/*
 * Base Dependencies
 * 各系统页面内的过滤器
 */

/*
 * Server Dependencies
 */
var debug = require('debug')('smartdo:middleware:sub-filter');
var ServerError = require('../errors/server-error');
var mongoose = require('mongoose');
var Moment = require('moment');
var async = require('async');
var uuid = require('uuid');

var InvincibleDB = require('../models/invincible');
var TeamManager = InvincibleDB.getModel('team_manager');
var User = InvincibleDB.getModel('user');
var Role = InvincibleDB.getModel('role');
var Team = InvincibleDB.getModel('team');

var Shared = require('../../shared/');
var ERROR_CODE = Shared.ERROR;
var MESSAGE = Shared.MESSAGE;

/*
 * UModules Dependencies
 */

module.exports = {
	// 商品管理
	merchandise_edit: function(req, res, next) {
		var agent = req.agent;
		var role = agent.role;
		var team = agent.team || {};
		var result = {};

		switch(role.type) {
			// 组长 编辑本组
			case "leader":
				{
					result.view = team.id || null;
					result.edit = true;
					result.add = true;
					result.delete = false;
					break;
				}
				// 组员 浏览本组
			case "member":
				{
					result.view = team.id || null;
					result.edit = false;
					result.add = false;
					result.delete = false;
					break;
				}
            // 培训主管 某一组  todo 需要调整为定期更换小组
            case "trainingSupervisor": {
                result.view = "5a12305b569e8d470f884019";
                result.edit = false;
                result.add = false;
                result.delete = false;
                break;
            }
				// 主管和经理助理 编辑所有
			case "director":
			case "assistant":
				{
					result.view = "*";
					result.edit = true;
					result.add = true;
					result.delete = false;
					break;
				}
				// 运营经理和运营总监 编辑所有及删除功能
			case "manager":
			case "COO":
				{
					result.view = "*";
					result.edit = true;
					result.add = true;
					result.delete = true;
					break;
				}
				// 其他所有总监 浏览所有
			case "CEO":
			case "CFO":
			case "CMPO":
			case "CTO":
			case "LD":
				{
					result.view = "*";
					result.edit = false;
					result.add = false;
					result.delete = false;
					break;
				}
				// 客服专员和客服主管浏览所有
			case "CSDDirector":
			case "CSDMember":
				// 需求分析浏览所有
			case "requirement":
				// ERP项目经理浏览所有
			case "erpProjectManager":
				// 架构师浏览所有
			case "architect":
				// 数据分析浏览所有
			case "dataAnalyse":
				{
					result.view = "*";
					result.edit = false;
					result.add = false;
					result.delete = false;
					break;
				}
				// 管理员 所有权限
			case "admin":
				{
					result.view = "*";
					result.edit = true;
					result.add = true;
					result.delete = true;
					break;
				}
			default:
				{
					result.view = null;
					result.edit = false;
					result.add = false;
					result.delete = false;
				}
		}

		req.subfilterMerchandiseEdit = result;
		next();
	},

	// 店铺管理
	shop: function(req, res, next) {
		var agent = req.agent;
		var role = agent.role;
		var team = agent.team || {};
		var result = {};

		switch(role.type) {
			// 经理助理 所有权限
			case "assistant":
				{
					result.view = "*";
					result.edit = true;
					result.add = true;
					result.delete = false;
					break;
				}
				// 运营经理和运营总监 编辑所有及删除功能
			case "manager":
			case "COO":
				{
					result.view = "*";
					result.edit = true;
					result.add = true;
					result.delete = true;
					break;
				}
				// 需求分析浏览所有
			case "requirement":
				// ERP项目经理浏览所有
			case "erpProjectManager":
				// 架构师 浏览所有
			case "architect":
				{
					result.view = "*";
					result.edit = false;
					result.add = false;
					result.delete = false;
					break;
				}
				// 管理员 所有权限
			case "admin":
				{
					result.view = "*";
					result.edit = true;
					result.add = true;
					result.delete = true;
					break;
				}
				// 其他 浏览所有
			default:
				{
					result.view = "*";
					result.edit = false;
					result.add = false;
					result.delete = false;
				}
		}

		req.subfilterShop = result;
		next();
	},

	// 每日信息
	dailyInfo: function(req, res, next) {
		var agent = req.agent;
		var role = agent.role;
		var team = agent.team || {};
		var result = {};

		switch(role.type) {
			// 组长 编辑本组
			case "leader":
				{
					result.view = team.id || null;
					result.edit = true;
					result.add = true;
					result.delete = false;
					break;
				}
				// 组员 浏览本组
			case "member":
				{
					result.view = team.id || null;
					result.edit = false;
					result.add = false;
					result.delete = false;
					break;
				}
            // 培训主管 某一组
            case "trainingSupervisor": {
                result.view = "5a12305b569e8d470f884019";
                result.edit = false;
                result.add = false;
                result.delete = false;
                break;
            }
				// 主管和经理助理 编辑所有
			case "director":
			case "assistant":
				{
					result.view = "*";
					result.edit = true;
					result.add = true;
					result.delete = false;
					break;
				}
				// 运营经理和运营总监 编辑所有及删除功能
			case "manager":
			case "COO":
				{
					result.view = "*";
					result.edit = true;
					result.add = true;
					result.delete = true;
					break;
				}
				// 其他所有总监 浏览所有
			case "CEO":
			case "CFO":
			case "CMPO":
			case "CTO":
			case "LD":
				{
					result.view = "*";
					result.edit = false;
					result.add = false;
					result.delete = false;
					break;
				}
				// 客服专员 只有部分人员有权限浏览所有
			case "CSDMember":
				{
					switch(agent.account) {
						// 温牡翠
						case "wenducui":
							{
								result.view = "*";
								result.edit = false;
								result.add = false;
								result.delete = false;
								break;
							}
						default:
							{
								result.view = null;
								result.edit = false;
								result.add = false;
								result.delete = false;
							}
					}
					break;
				}
            // 选品主管 浏览所有
            case "selectionDirector":
				// 客服主管浏览所有
			case "CSDDirector":
				// 物流主管浏览所有
			case "logisticsDirector":
				// 采购主管浏览所有
			case "purchaseDirector":
				// 需求分析浏览所有
			case "requirement":
				// ERP项目经理浏览所有
			case "erpProjectManager":
				// 数据分析浏览所有
			case "dataAnalyse":
				// 架构师 浏览所有
			case "architect":
				{
					result.view = "*";
					result.edit = false;
					result.add = false;
					result.delete = false;
					break;
				}
				// 管理员 所有权限
			case "admin":
				{
					result.view = "*";
					result.edit = false;
					result.add = false;
					result.delete = false;
					break;
				}
			default:
				{
					result.view = null;
					result.edit = false;
					result.add = false;
					result.delete = false;
				}
		}

		req.subfilterDailyInfo = result;
		next();
	},

	// 每日报表
	dailyReport: function(req, res, next) {
		var agent = req.agent;
		var role = agent.role;
		var team = agent.team || {};
		var result = {};

		switch(role.type) {
			// 组长和组员查看自己小组
			case "leader":
			case "member":
				{
					result.view = team.id || null;
					break;
				}
            // 培训主管 某一组
            case "trainingSupervisor": {
                result.view = "5a12305b569e8d470f884019";
                break;
            }
				// 类目主管查看自己管理的小组
			case "director":
				{
					result.view = agent.teamManager || null;
					break;
				}

            // 客服主管浏览所有
            case "CSDDirector":
            // 物流主管浏览所有
            case "logisticsDirector":
            // 采购主管浏览所有
            case "purchaseDirector":
            // 需求分析浏览所有
            case "requirement":
            // ERP项目经理浏览所有
            case "erpProjectManager":
            // 数据分析浏览所有
            case "dataAnalyse":
            // 架构师 浏览所有
            case "architect":
            // 选品主管 浏览所有
            case "selectionDirector":
				// 运营经理、运营经理助理、各总监查看所有小组
			case "assistant":
			case "manager":
			case "COO":
			case "CEO":
			case "CFO":
			case "CMPO":
			case "CTO":
			case "LD":
				{
					result.view = "*";
					break;
				}
				// 管理员 所有权限
			case "admin":
				{
					result.view = "*";
					break;
				}
			default:
				{
					result.view = null;
				}
		}

		req.subfilterDailyReport = result;
		next();
	},

	// 小组毛利率
	teamProfit: function(req, res, next) {
		var agent = req.agent;
		var role = agent.role;
		var team = agent.team || {};
		var teams = req.teams;
		var teamId = team.id || '';
		teamId = teamId.toString();

		var leaderName = "";
		for(var i = 0; i < teams.length; i++) {
			var row = teams[i];
			if(row._id == teamId) {
				var leader = row.leader || {};
				leaderName = leader.name || "";
			}
		}
		var result = {};

		switch(role.type) {
			// 组长 编辑本组
			case "leader":
				{
					result.view = leaderName || null;
					result.total = false;
					break;
				}
				// 组员 浏览本组
			case "member":
				{
					result.view = leaderName || null;
					result.total = false;
					break;
				}
            // 培训主管 某一组
            case "trainingSupervisor": {
                result.view = "黄宇兰";
                result.total = false;
                break;
            }
				// 主管和经理助理 编辑所有
			case "director":
			case "assistant":
				{
					result.view = "*";
					result.total = false;
					break;
				}
				// 运营经理和运营总监 编辑所有及删除功能
			case "manager":
			case "COO":
				{
					result.view = "*";
					result.total = true;
					break;
				}
				// 其他所有总监 浏览所有
			case "CEO":
			case "CFO":
			case "CMPO":
			case "CTO":
			case "LD":
				{
					result.view = "*";
					result.total = true;
					break;
				}
				// 数据分析浏览所有
			case "dataAnalyse":
				{
					result.view = "*";
					result.total = true;
					break;
				}
				// 架构师 浏览所有
			case "architect":
				{
					result.view = "*";
					result.total = true;
					break;
				}
				// 管理员 所有权限
			case "admin":
				{
					result.view = "*";
					result.total = true;
					break;
				}
			default:
				{
					result.view = null;
					result.total = false;
				}
		}

		req.subfilterTeamProfit = result;
		next();
	},

	// SKU毛利率
	skuProfit: function(req, res, next) {
		var agent = req.agent;
		var role = agent.role;
		var team = agent.team || {};
		var teams = req.teams;
		var teamId = team.id || '';
		teamId = teamId.toString();

		var leaderName = "";
		for(var i = 0; i < teams.length; i++) {
			var row = teams[i];
			if(row._id == teamId) {
				var leader = row.leader || {};
				leaderName = leader.name || "";
			}
		}

		var result = {};

		switch(role.type) {
			// 组长 编辑本组
			case "leader":
				{
					result.view = leaderName || null;
					result.total = true;
					break;
				}
				// 组员 浏览本组
			case "member":
				{
					result.view = leaderName || null;
					result.total = false;
					break;
				}
            // 培训主管 某一组
            case "trainingSupervisor": {
                result.view = "黄宇兰";
                result.total = false;
                break;
            }
				// 主管和经理助理
			case "director":
			case "assistant":
				{
					result.view = "*";
					result.total = false;
					break;
				}
				// 运营经理和运营总监
			case "manager":
			case "COO":
				{
					result.view = "*";
					result.total = true;
					break;
				}
				// 其他所有总监 浏览所有
			case "CEO":
			case "CFO":
			case "CMPO":
			case "CTO":
			case "LD":
				{
					result.view = "*";
					result.total = true;
					break;
				}
				// 数据分析浏览所有
			case "dataAnalyse":
				{
					result.view = "*";
					result.total = true;
					break;
				}
				// 架构师 浏览所有
			case "architect":
				{
					result.view = "*";
					result.total = true;
					break;
				}
				// 管理员 所有权限
			case "admin":
				{
					result.view = "*";
					result.total = true;
					break;
				}
			default:
				{
					result.view = null;
					result.total = false;
				}
		}

		req.subfilterSkuProfit = result;
		next();
	},

	// 创建工单
	createOrder: function(req, res, next) {
		var agent = req.agent;
		var role = agent.role;
		var team = agent.team || {};
		var result = {};

		switch(role.type) {
			// 运营组长和运营总监
			case "leader":
			case "COO":
				{
					result.view = "*";
					result.add = agent.id || null;
					break;
				}
				// 运营专员、类目主管
			case "director":
			case "member":
				{
					result.view = agent.id || null;
					result.add = agent.id || null;
					break;
				}
				// 运营经理
			case "manager":

				// 其他所有总监
			case "CEO":
			case "CFO":
			case "CMPO":
			case "CTO":
			case "LD":
				{
					result.view = null;
					result.add = false;
					break;
				}
				// 管理员 所有权限
			case "admin":
				{
					result.view = "*";
					result.add = agent.id || null;
					break;
				}
			default:
				{
					result.view = null;
					result.add = false;
				}
		}

		req.subfilterCreateOrder = result;
		next();
	},

	// 工单列表
	workOrder: function(req, res, next) {
		var agent = req.agent;
		var role = agent.role;
		var team = agent.team || {};
		var result = {};

		switch(role.type) {
			// 客服主管
			case "CSDDirector":
				{
					result.view = "*";
					result.edit = agent.id;
					result.add = agent.id || null;
					result.delete = false;
					break;
				}
				// 运营、运营组长
			case "member":
			case "leader":
				{
					result.view = agent.id || null;
					result.edit = agent.id;
					result.add = agent.id || null;
					result.delete = false;
					break;
				}
				// 客服专员
			case "CSDMember":
				{
					result.view = agent.id || null;
					result.edit = agent.id;
					result.add = agent.id || null;
					result.delete = false;
					break;
				}
				// 运营经理和运营总监 编辑所有及删除功能
			case "manager":
			case "COO":
				{
					result.view = "*";
					result.edit = agent.id;
					result.add = agent.id || null;
					result.delete = false;
					break;
				}
				// 其他所有总监、类目主管 浏览所有
			case "director":
				// 数据分析浏览所有
			case "dataAnalyse":
				// 需求分析浏览所有
			case "requirement":
				// ERP项目经理浏览所有
			case "erpProjectManager":
			case "CEO":
			case "CFO":
			case "CMPO":
			case "CTO":
			case "LD":
				{
					result.view = "*";
					result.edit = false;
					result.add = false;
					result.delete = false;
					break;
				}
				// 架构师 浏览所有
			case "architect":
				{
					result.view = "*";
					result.edit = false;
					result.add = false;
					result.delete = false;
					break;
				}
				// 管理员 所有权限
			case "admin":
				{
					result.view = "*";
					result.edit = agent.id;
					result.add = agent.id;
					result.delete = true;
					break;
				}
			default:
				{
					result.view = null;
					result.edit = false;
					result.add = false;
					result.delete = false;
				}
		}

		req.subfilterWorkOrder = result;
		next();
	},

	// 客服任务分配
	operativeCustomer: function(req, res, next) {
		var agent = req.agent;
		var role = agent.role;
		var team = agent.team || {};
		var result = {};

		switch(role.type) {
			// 客服主管和运营总监
			case "CSDDirector":
			case "COO":
				{
					result.view = "*";
					result.edit = true;
					result.add = true;
					result.delete = true;
					break;
				}
				// 客服专员
			case "CSDMember":
				{
					result.view = null;
					result.edit = false;
					result.add = false;
					result.delete = false;
					break;
				}
				// 运营经理
			case "manager":
				{
					result.view = null;
					result.edit = false;
					result.add = false;
					result.delete = false;
					break;
				}
				// 其他所有总监
			case "CEO":
			case "CFO":
			case "CMPO":
			case "CTO":
			case "LD":
				{
					result.view = "*";
					result.edit = false;
					result.add = false;
					result.delete = false;
					break;
				}
				// 需求分析浏览所有
			case "requirement":
				// ERP项目经理浏览所有
			case "erpProjectManager":
				// 架构师 浏览所有
			case "architect":
				{
					result.view = "*";
					result.edit = false;
					result.add = false;
					result.delete = false;
					break;
				}
				// 管理员 所有权限
			case "admin":
				{
					result.view = "*";
					result.edit = true;
					result.add = true;
					result.delete = true;
					break;
				}
			default:
				{
					result.view = null;
					result.edit = false;
					result.add = false;
					result.delete = false;
				}
		}

		req.subfilterOperativeCustomer = result;
		next();
	},

	// 采购计划
	// 调用前需先引用helper.team_list中间件
	purchase_plan: function(req, res, next) {
		var agent = req.agent;
		var role = agent.role;
		var team = agent.team || {};
		var teams = req.teams || []; // 小组信息列表 [{_id: xx, name: xx, leader: {_id: leaderId, account: leaderAccount, name: leaderName}, members: [{_id: memberId, account: memberAccount, name: memberName}]}]
		var result = {};

		var teamsJson = {};
		teams.forEach(function(row) {
			teamsJson[row._id] = row;
		});

		switch(role.type) {
			// 组长 可新增 浏览小组所有订单 可编辑100,101状态
			case "leader":
				{
					result.add = true; //可添加
					result.view = {};
					result.view.applicant = [agent.id]; //自己的id
					var teamInfo = teamsJson[team.id] || {};
					var members = teamInfo.members || [];
					members.forEach(function(row) {
						if(row._id) {
							result.view.applicant.push(row._id); //组员的id
						}
					});
					result.view.status = "*"; //订单状态
					result.edit = {
						status: [100, 101]
					}; //哪些状态的订单可以处理
					break;
				}
				// 组员 可新增 浏览自己所有订单 可编辑100,101状态
			case "member":
				{
					result.add = true; //可添加
					result.view = {};
					result.view.applicant = [agent.id]; //自己的id
					result.view.status = "*"; //订单状态
					result.edit = {
						status: [100, 101]
					}; //哪些状态的订单可以处理
					break;
				}
				// 类目主管
			case "director":
				{
					result.add = true; //可添加
					result.view = {};
					result.view.applicant = "*"; //自己的id
					result.view.status = [200, 210, 220, 230, 300, 310, 320]; //订单状态
					result.edit = {
						status: [200]
					}; //哪些状态的订单可以处理
					break;
				}
				// 运营经理 不可新增 浏览除100,101之外其他状态的订单 200状态+总额限制可编辑
			case "manager":
				{
					result.add = false; //不可添加
					result.view = {};
					result.view.applicant = "*"; //自己的id
					result.view.status = [200, 210, 220, 230, 300, 310, 320]; //可视状态列表
					result.edit = {
						status: [210]
					}; //哪些状态的订单可以处理
					break;
				}
				// 运营总监 不可新增 浏览除100,101之外其他状态的订单 220状态+总额限制可编辑
			case "COO":
				{
					result.add = false; //不可添加
					result.view = {};
					result.view.applicant = "*"; //自己的id
					result.view.status = [200, 210, 220, 230, 300, 310, 320]; //可视状态列表
					result.edit = {
						status: [220]
					}; //哪些状态的订单可以处理
					break;
				}
				// 首席执行官（CEO）不可新增 浏览除100,101之外其他状态的订单 230状态+总额限制可编辑
			case "CEO":
				{
					result.add = false; //不可添加
					result.view = {};
					result.view.applicant = "*"; //自己的id
					result.view.status = [200, 210, 220, 230, 300, 310, 320]; //可视状态列表
					result.edit = {
						status: [230, 320]
					}; //哪些状态的订单可以处理
					break;
				}
				// 供应链主管 不可新增 浏览除100,101之外其他状态的订单 300状态+总额限制可编辑
			case "purchaseDirector":
				{
					result.add = false; //不可添加
					result.view = {};
					result.view.applicant = "*"; //自己的id
					result.view.status = [200, 210, 220, 230, 300, 310, 320]; //可视状态列表
					result.edit = {
						status: [300]
					}; //哪些状态的订单可以处理
					break;
				}
				// 供应链总监（由于目前财务总监兼任，这里加上CFO）不可新增 浏览除100,101之外其他状态的订单 310状态+总额限制可编辑
			case "CFO":
			case "CMPO":
				{
					result.add = false; //不可添加
					result.view = {};
					result.view.applicant = "*"; //自己的id
					result.view.status = [200, 210, 220, 230, 300, 310, 320]; //可视状态列表
					result.edit = {
						status: [310]
					}; //哪些状态的订单可以处理
					break;
				}
				// 管理员 所有权限
			case "admin":
				{
					result.add = true; //可添加
					result.view = {};
					result.view.applicant = "*"; //自己的id
					result.view.status = [100, 101, 200, 210, 220, 230, 300, 310, 320]; //可视状态列表
					result.edit = {
						status: [100, 101, 200, 210, 220, 230, 300, 310, 320]
					}; //哪些状态的订单可以处理
					break;
				}
			default:
				{
					result.view = null;
				}
		}

		req.subfilterPurchasePlan = result;
		next();
	},

	// 运营销售信息
	operationSales: function(req, res, next) {
		var agent = req.agent;
		var role = agent.role;
		var team = agent.team || {};
		var result = {};

		/* 总监和经理：查看所有销售情况
		 * 类目主管：查看自己管理的所有小组的销售情况
		 * 组员和组长：查看本小组销售情况
		 */
		switch(role.type) {
            // 需求分析浏览所有
            case "requirement":
            // ERP项目经理浏览所有
            case "erpProjectManager":
            // 架构师 浏览所有
            case "architect":
            // 选品主管 浏览所有
            case "selectionDirector":
			case 'admin':
			case 'CEO':
			case 'CTO':
			case 'COO':
			case 'CMPO':
			case 'LD':
			case 'manager':
			case 'financialManager':
				result.view = true;
				break;
			case 'director':
				result.view = true;
				result.findTeam = [];
				break;
			case 'leader':
			case 'member':
				result.view = true;
				result.findTeam = [];
				result.findTeam.push(mongoose.Types.ObjectId(team.id));
				break;
			default:
				result.view = null;
				break;
		}

		if(role.type == 'director') {
			async.series([
				// 获取访问小组
				function(callback) {
					TeamManager.findOne({
						user: mongoose.Types.ObjectId(agent.id)
					}, function(err, doc) {
						doc['teams'].map(function(item) {
							result.findTeam.push(mongoose.Types.ObjectId(item))
						});
						callback(err)
					})
				}
			], function(err, results) {
				req.subfilterOperationSales = result;
				next();
			})
		} else {
			req.subfilterOperationSales = result;
			next();
		}
	},

	// 库存管理
	stockControls: function(req, res, next) {
		var agent = req.agent;
		var role = agent.role;
		var team = agent.team || {};
		var result = {
			add: false,
			edit: false,
			info: false,
			view: false
		};

		switch(role.type) {
			case 'admin':
			case 'manager':
				result.add = true;
				result.edit = true;
				result.info = true;
				result.view = true;
				break;
			case 'assistant':
				result.add = true;
                result.edit = true;
				result.info = true;
				result.view = true;
				break;
			case 'leader':
			case 'member':
				result.info = true;
				result.view = true;
				break;
			default: {
				break;
			}
		}

		req.subfilterStockControls = result;
		next();
	}

};