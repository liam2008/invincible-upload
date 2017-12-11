(function () {
    'use strict';

    var app = angular.module('app');

    //状态
    app.filter('formateState', function () {
        return function (state) {
            return Smartdo.PRODUCT_STATE[state];
        }
    });

    //日期
    app.filter('formatDate', function () {
        return function (date) {
            return moment(date).format('YYYY-MM-DD')
        }
    });

    //版本
    app.filter('version', function () {
        return function (url) {
            return url + "?" + App.config.version;
        }
    });

    //side站点地址对应的url,basicPath对应的src地址
    app.filter('formatFlag', function () {
        return function (side,basicPath) {
            return basicPath + Smartdo.SIDE_CONTURY[side] + '.png';
        }
    });

}());
