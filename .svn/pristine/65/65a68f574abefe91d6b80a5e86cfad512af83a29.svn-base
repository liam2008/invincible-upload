
var fs = require('fs');
var path = require('path');
var debug = require('debug')("smartdo:controller");

var controllers = {};

fs.readdirSync(__dirname)
    .filter(function(file) {
        return (file.indexOf(".") !== 0) && (file !== "index.js");
    })
    .forEach(function(file) {
        var ctrl = require(path.join(__dirname, file));
        controllers[ctrl.name] = ctrl;
    });


module.exports = controllers;
