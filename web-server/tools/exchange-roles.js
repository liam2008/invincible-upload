process.env.NODE_ENV = "debug";

var async = require('async');
var moment = require('moment');
var DB = require('../models/invincible');
var Product = DB.getModel('product');
var User = DB.getModel('user');
var Shops = DB.getModel('shops');
var Roles = DB.getModel('role');
var Merchandise = DB.getModel('merchandise');
var UUID = require('uuid');
var debug = require('debug')('smartdo:route:base');
var fs = require('fs');
var Shared = require('../../shared');
var RouteMap = Shared.ROUTE_MAP;

console.log("dealing role exchange to env: " + process.env.NODE_ENV);

// appRoute为key， routeId为value的json
var appRouteToId = {};
for (var routeId in RouteMap) {
    var row = RouteMap[routeId];
    appRouteToId[row.app_route] = routeId;
}

var roleArr = [];

async.series([
        // 从用户表查询出组长信息
        function (callB) {
            Roles.find({})
                .exec(function(err, findResults) {
                    if (err) {
                        callB(err);
                        return;
                    }

                    findResults.forEach(function(row) {
                        roleArr.push(row);
                    });

                    callB(null);
                });
        }
    ],
    function (err, result) {
        if (err) {
            console.log(err);
            return;
        }

        var iterator = function (json, cb) {
            if (json == null) {
                cb(null);
                return;
            }

            var routes = json.routes || [];
            if (routes.length <= 0 || routes[0] == "*" || routes[0].indexOf('.') == -1) {
                console.log(json.name + "no need to exchange!!!");
                cb(null);
                return;
            }

            var newRouteArr = [];
            routes.forEach(function(appRoute) {
                if (appRouteToId[appRoute]) {
                    newRouteArr.push(appRouteToId[appRoute]);
                }
            });

            json.routes = newRouteArr;

            console.log(json);
            //cb(null);
            json.save(function(err) {
                if (err) {
                    cb(err);
                    return;
                }

                cb(null);
            });
        };

        async.eachSeries(roleArr, iterator, function (err) {
            if (err != null) {
                console.log(new Error(err));
                return;
            }

            console.log("env: " + process.env.NODE_ENV + " all done");
            process.exit(0);
        });
    }
);