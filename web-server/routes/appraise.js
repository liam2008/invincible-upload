var express = require('express');
var router = express.Router();
var debug = require('debug')('smartdo:route:appraise');
var app = require('../app');

var controller = require('../controllers').appraise;

module.exports = {
    path: "/appraise",
    route: router
};

router.use(app.authServer.authenticate());

router.get('/EVALTotal', controller.EVALTotal);

router.get('/EVALDetail', controller.EVALDetail);

router.post('/EVALTask', controller.EVALTask);

router.get('/keyword', controller.keyword);

router.post('/keywordTask', controller.keywordTask);

router.post('/setReviewDescTask', controller.setReviewDescTask);

router.get('/reviewContent', controller.reviewContent);

// 评论任务站点
router.get('/reviewSite', controller.reviewSite);

router.get('/reviewExcel', controller.reviewTaskExcel);

router.get('/keywordExcel', controller.keywordExcel);

