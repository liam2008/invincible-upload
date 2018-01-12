/**
 * Created by monkey on 2017/9/14.
 */

var fs = require('fs');
var path = require('path');
var env = process.env.NODE_ENV || "development";
var config = require('../config/db.mysql.amazon_data.json')[env];
var Sequelize = require('sequelize');

config.options.timezone = '+08:00';
config.options.logging = console.log;

var sequelize = new Sequelize(config.db, config.user, config.password, config.options);

var db = {
    sequelize: sequelize,
    Sequelize: Sequelize,
    models: {}
};

fs.readdirSync(__dirname)
    .filter(function(file) {
        return (file.indexOf(".") !== 0) && (file !== "index.js");
    }).forEach(function(file) {
    var model = sequelize.import(path.join(__dirname, file));
    db.models[model.name] = model;
});

db.getModel = function(name) {
    return this.models[name];
};

db.setLogger = function(l) {
    logger = this.sequelize.options.logging = l;
};

// sequelize.sync().then(function () {
//     logger("db synced...");
// }).catch(function (e) {
//     logger("db synced error: ", e);
// });

module.exports = db;