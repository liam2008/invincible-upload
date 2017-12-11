var moment = require('moment');
var async = require('async');
var mongoose = require('mongoose');

var InvincibleDB = require('../models/invincible');

var purchasePlan = InvincibleDB.getModel('purchasePlan');
var purchasePlanDetail = InvincibleDB.getModel('purchasePlanDetail');
var config = InvincibleDB.getModel('config');
var user = InvincibleDB.getModel('user');

// var Schema = mongoose.Schema;

module.exports = {
    name: "purchasePlan",

    submit: function (req, res) {
        let planId;
        async.series([
            function (cb) {
                purchasePlan.find().sort({_id: -1}).exec(function (err, docs) {
                    let date = moment().format('YYYYMMDD');
                    if (err) console.error(err);
                    if ((docs instanceof Array && docs.length === 0) || docs[0].plan_id === undefined) {
                        planId = 'PCP' + date + '001';
                        cb(null);
                    } else {
                        let dbDate = docs[0].createdAt.toString().slice(0, 10);
                        if (dbDate === moment().format('YYYY-MM-DD').toString()) {
                            let no = parseInt(docs[0].plan_id.slice(11)) + 1;
                            if (no.length === 1) {
                                no = '00' + no;
                            } else {
                                no = '0' + no;
                            }
                            planId = 'PCP' + date + no;
                            cb(null);
                        } else {
                            planId = 'PCP' + date + '001';
                            cb(null);
                        }
                    }
                });
            },
            function (cb) {
                // console.log(req.agent)
                // console.log(mongoose.Types.ObjectId(req.body.applicant));
                purchasePlan.create({
                    _id: new mongoose.Types.ObjectId(),
                    plan_id: planId,
                    status: req.body.status,
                    applicant: req.agent.id,
                    createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
                    updatedAt: moment().format('YYYY-MM-DD HH:mm:ss')
                }, function (err) {
                    if (err) console.error(err);
                    cb(null);
                });
            },
            function (cb) {
                console.log(req.body);
                req.body.details.forEach(function (item, index) {
                    purchasePlanDetail.create({
                        _id: new mongoose.Types.ObjectId(),
                        plan_id: planId,
                        product_id: mongoose.Types.ObjectId(req.body.product_id),
                        local_storage: item.local_storage,
                        fba_storage: item.fba_storage,
                        average_7: item.average_7,
                        average_30: item.average_30,
                        expected_sales: item.expected_sales,
                        local_transport: item.local_transport,
                        abroad_transport: item.abroad_transport,
                        prepare_period: item.prepare_period,
                        safety_stock: item.safety_stock,
                        purchase_amount: item.purchase_amount,
                        supplier: mongoose.Types.ObjectId(req.body.supplier),
                        unit_cost: item.unit_cost,
                        estimate_production_days: item.estimate_production_days,
                        least_amount: item.least_amount,
                        advance_pay_rate: item.advance_pay_rate,
                        first_time: item.first_time,
                        remarks: item.remarks,
                        createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
                        updatedAt: moment().format('YYYY-MM-DD HH:mm:ss')
                    }, function (err) {
                        if (err) console.error(err);
                    });
                });
            }
        ]);
    },
    //  req 采购编号 申请人 申请时间 运营审核人 供应链审核人 订单状态 【分页 10条/页】 res 采购列表
    show: function (req, res) {
        console.log(req.query);
        let cons = {};
        // 注意类型~~~~~~~~~~~~~~~~~~~~
        let skip = (req.query.currentPage - 1) * req.query.pageSize;
        let limit = 10;
        if (req.query.plan_id) cons.plan_id = req.query.plan_id;
        if (req.query.applicant) cons.applicant = req.query.applicant;
        if (req.query.startTime) cons.createdAt = {$gte: req.query.startTime};
        if (req.query.endTime) cons.createdAt = {$lte: req.query.endTime};
        if (req.query.startTime && req.query.endTime) cons.createdAt = {$gte: req.query.startTime, $lte: req.query.endTime};
        if (req.query.operator) cons.operator = req.query.operator;
        if (req.query.supplyChain) cons.supplyChain = req.query.supplyChain;

        purchasePlan.find(cons).skip(skip).limit(limit).populate('applicant').populate({
            path: 'details',
            populate: [{path: 'product_id'}, {path: 'supplier'}]
        }).exec(function (err, docs) {
            if (err) console.error(err);
            let datas = {
                plan_id: docs.plan_id,
                status: docs.status,
                applicant: docs.applicant.name,
                logsAmount: docs.logs.length(),
                remarks: docs.remarks,
                people: []
            };
            docs.history.forEach(function (item, index) {
                user.find({_id: item.handler}).sort({_id: -1}).exec(function (err, docs) {
                    if (err) console.error(err);
                    if (datas.people.indexOf(docs.name) === -1) {
                        datas.people.push(docs.name);
                    }
                });
                if (docs.history.length() === (index + 1)) {
                    res.json(datas);
                }
            });
        });
    },

    edit: function (req, res) {
        console.log(req.query);
        let planId = req.query.plan_id;
        purchasePlan.find({ plan_id: planId }).populate('applicant').populate({
            path: 'details',
            populate: [{ path: 'product_id' }, { path: 'supplier' }]
        }).exec(function (err, docs) {
            if (err) console.error(err);
            let datas = {
                plan_id: docs.plan_id,
                applicant: docs.applicant.name,
                details: []
            };
            docs.details.forEach(function (item, index) {
                var detail = {};
                detail.product_id = item.product_id.store_sku;
                detail.name = item.product_id.name_cn;
                detail.local_storage = item.local_storage;
                detail.fba_storage = item.fba_storage;
                detail.average_7 = item.average_7;
                detail.average_30 = item.average_30;
                detail.expected_sales = item.expected_sales;
                detail.local_transport = item.local_transport;
                detail.prepare_period = item.prepare_period;
                detail.safety_stock = item.safety_stock;
                detail.purchase_amount = item.purchase_amount;
                detail.supplier = item.supplier.name;
                detail.unit_cost = item.unit_cost;
                detail.estimate_production_days = item.estimate_production_days;
                detail.least_amount = item.least_amount;
                detail.advance_pay_rate = item.advance_pay_rate;
                detail.first_time = item.first_time;
                detail.remarks = item.remarks;
                datas.details.push(detail);
            });
            res.json(datas);
        });
    }

    // edit: function (req, res) {
    //     purchasePlan.update({ plan_id: req.query.plan_id }, {
    //         status: req.body.status,
    //         updatedAt: moment().format('YYYY-MM-DD HH:mm:ss')
    //     }, function (err) {
    //         if (err) console.error(err);
    //     });
    //     req.body.details.forEach(function (item, index) {
    //         // item.product_id 
    //         purchasePlanDetail.update({product_id: item.product_id}, {
    //             // plan_id: planId,
    //             product_id: item.product_id,
    //             local_storage: item.local_storage,
    //             fba_storage: item.fba_storage,
    //             average_7: item.average_7,
    //             average_30: item.average_30,
    //             expected_sales: item.expected_sales,
    //             local_transport: item.local_transport,
    //             abroad_transport: item.abroad_transport,
    //             prepare_period: item.prepare_period,
    //             safety_stock: item.safety_stock,
    //             purchase_amount: item.purchase_amount,
    //             supplier: item.supplier,
    //             unit_cost: item.unit_cost,
    //             estimate_production_days: item.estimate_production_days,
    //             least_amount: item.least_amount,
    //             advance_pay_rate: item.advance_pay_rate,
    //             first_time: item.first_time,
    //             remarks: item.remarks,
    //             updatedAt: moment().format('YYYY-MM-DD HH:mm:ss')
    //         });
    //     });
    // }
};