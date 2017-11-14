
var env = process.env.NODE_ENV || "development";
var accountLog4js = require('../config/log4js.json');
var mysql_crawler = require('../config/db.mysql.crawler.json');

var ConfigUtils = module.exports = {};

ConfigUtils.getEnv = function() {
    return env;
};

ConfigUtils.getLog4js = function() {
    return accountLog4js[env];
};

ConfigUtils.getMysqlCrawler = function() {
    return mysql_crawler[env];
};
