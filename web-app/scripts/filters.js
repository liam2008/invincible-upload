(function() {
    'use strict';

    var app = angular.module('app');

    //状态
    app.filter('formateState',function(){
        return function(state){
            return  Smartdo.PRODUCT_STATE[state];
        }
    });

    //日期
    app.filter('formatDate',function(){
        return function(date){
            return  moment(date).format('YYYY-MM-DD')
        }
    });

    app.filter('version',function(){
        return function(url){
            return url+"?"+App.config.version;
        }
    })
}());
