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

    //字符串按照html输出
    app.filter('trustHtml', function ($sce) {
        return function (input) {
            var fomatInput = input.replace(/\r?\n/g, "<br />");
            return $sce.trustAsHtml(fomatInput);
        }
    });

    //side站点地址对应的url,basicPath对应的src地址
    app.filter('formatFlag', function () {
        return function (side,basicPath) {
            return basicPath + Smartdo.SIDE_CONTURY[side] + '.png';
        }
    });

    //历史调进度
    app.filter('historyState', function () {
        return function (state) {
            var formatData = '';
            switch (state) {
                case 0:
                    formatData = '待处理';
                    break;
                case 1:
                    formatData = '已跟进';
                    break;
                case 2:
                    formatData = '已完结';
                    break;
                default :
                    formatData = '-';
            }
            return formatData;
        }
    });

    //类型过滤
    app.filter('typeState', function () {
        return function (state) {
            var formatData = '';
            switch (state) {
                case 0:
                    formatData = '其他';
                    break;
                case 1:
                    formatData = '评论异常';
                    break;
                case 2:
                    formatData = '发现跟卖';
                    break;
                case 3:
                    formatData = 'Lightning Deals';
                    break;
                case 4:
                    formatData = '销售权限';
                    break;
                case 5:
                    formatData = '品牌更改';
                    break;
                case 6:
                    formatData = '店铺IP问题';
                    break;
                case 7:
                    formatData = 'ASIN被篡改';
                    break;
                case 8:
                    formatData = '文案被修改';
                    break;
                default :
                    formatData = '-';
            }
            return formatData;
        }
    });

}());
