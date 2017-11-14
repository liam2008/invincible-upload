(function() {
    'use strict';

    var app = angular.module('app');

    //状态
    app.filter('formateState',function(){
        return function(state){
            return  Smartdo.PRODUCT_STATE[state];
        }
    });
}());
