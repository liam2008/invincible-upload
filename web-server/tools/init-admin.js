/*
 * Base Dependencies
 */


/*
 * Server Dependencies
 */
var Moment = require('moment');
var UUID = require('uuid');
var async = require('async');
var mongoose = require('mongoose');

var ServerError = require('../errors/server-error');
var InvincibleDB = require('../models/invincible');
var User = InvincibleDB.getModel('user');
var Role = InvincibleDB.getModel('role');

var Shared = require('../../shared');
var CryptoJS = Shared.CryptoJS;

/*
 * UModules Dependencies
 */

var roleId = "";

var rolesArr = [
    {name: "系统管理员", type: "admin", routes: ["*"]},
    {name: "经理", type: "manager", routes: ["*"]},
    {name: "类目主管", type: "director", routes: ["*"]},
    {name: "组长", type: "leader", routes: ["*"]},
    {name: "组员", type: "member", "routes" : ["main.summary", "main.daily.list", "main.daily.report"]},
    {name: "助理", type: "assistant", routes: ["*"]}
];

var createRoles = function(callback) {
    var iterator = function (json, cb) {
        var type = json.type;
        var name = json.name;
        var routes = json.routes;

        Role.findOne({type: type}, function(err, findResult) {
            if (err) {
                cb(err);
                return;
            }

            var time = Moment().format("YYYY-MM-DD HH:mm:ss");
            if (findResult == null) {
                findResult = new Role({
                    _id: new mongoose.Types.ObjectId(),
                    history: [],
                    createdAt: time
                });
            }

            findResult.name = name;
            findResult.type = type;
            findResult.routes = routes;
            findResult.updatedAt = time;

            roleId = findResult._id;

            findResult.save(function(err) {
                if (err) {
                    cb(err);
                    return;
                }

                cb(null);
            });
        });
    };

    async.eachSeries(rolesArr, iterator, function (err) {
        if (err != null) {
            console.log(err);
            return;
        }

        callback(null);
    });
};


var createUser = function(callback) {
    User.findOne({account: "admin"}, function(err, findResult) {
        if (err) {
            callback(err);
            return;
        }

        var time = Moment().format("YYYY-MM-DD HH:mm:ss");

        if (findResult == null) {
            findResult = new User({
                _id: new mongoose.Types.ObjectId(),
                account: "admin",
                createdAt: time
            });
        }

        findResult.name         = "管理员";
        findResult.password     = CryptoJS.MD5("admin").toString();
        findResult.status       = 1;
        findResult.creator      = findResult._id;
        findResult.role         = roleId;
        findResult.team         = null;
        findResult.permissions  = {count: -1};
        findResult.history      = [];
        findResult.updatedAt    = time;

        findResult.save(function(err) {
            if (err) {
                callback(err);
                return;
            }

            callback(null);
        });
    });
};

var env = process.env.NODE_ENV;
if (env != "debug") {
    console.log("this tool only use in debug environment");
    process.exit(0);
}

async.series([
        createRoles,
        createUser
    ],
    function(err, result) {
        if (err) {
            console.log(new Error(err));
            return;
        }

        console.log("process done");
        process.exit(0);
    }
);

//User.find({})
//    .populate('role')
//    .populate('creator')
//    .populate('team')
//    .exec(function(err, findResults) {
//        if (err) {
//            console.log(err);
//            return;
//        }
//
//        console.log(findResults);
//    });
