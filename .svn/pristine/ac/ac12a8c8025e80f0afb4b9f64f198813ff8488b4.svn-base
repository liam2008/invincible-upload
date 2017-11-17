/**
 * Module dependencies.
 */
var UUID = require('uuid');

/*
 * Server Dependencies
 */
var app = require('../app');
var ServerError = require('../errors/server-error');

module.exports = {
    formatURL: function(uri, params) {
        var url = uri.length ? uri + '?' : "";

        var keys = Object.keys(params);
        keys.forEach(function(key) {
            url += key + '=' + encodeURIComponent(params[key]) + '&';
        });

        url = url.substring(0, url.length - 1);

        return url;
    }

};
