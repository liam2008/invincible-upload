var env = process.env.NODE_ENV || "development";
var mysql_crawler = require('../config/db.mysql.amazon_data.json');

var config = mysql_crawler[env];
var mysql = require('mysql');
var pool = mysql.createPool(config);

exports = module.exports;

exports.query = function(sql, args, callback) {
    pool.getConnection(function(err, connection) {
        if (!!err) {
            console.error('[mysql crawler pool.acquire.err] ' + err.stack);
            callback(err, null);
            return;
        }

        connection.query(sql, args, function(err, res) {
            connection.release(function(err) {
                if (!!err) {
                    console.error('[mysql crawler pool.release.err] ' + err.stack);
                }
            });

            if (!!err) {
                console.error('[mysql crawler connection.query.err] ' + err.stack);
                console.error('[mysql crawler failure sql] %j %j', sql, args);
            }

            if (callback != null) {
                callback(err, res || []);
            }
        });
    });
};
