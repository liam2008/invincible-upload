/**
 * Module dependencies.
 */
var UUID = require('uuid');
var JWT = require('jsonwebtoken');

/*
 * Server Dependencies
 */
var app = require('../app');
var ServerError = require('../errors/server-error');
var debug = require('debug')('smartdo:token');

var JWT_SECRET = "s2L2*sz@sspZs220Q19*2zsfXs87!Ga3";

var Shared = require('../../shared/');
var ERROR_CODE = Shared.ERROR;
var MESSAGE = Shared.MESSAGE;

module.exports = {
    generateAccessToken: function(user, scope, callback) {
        var payload = {
            user:    user,
            scope:   scope
        };

        var options = {
            algorithm: "HS256",
            issuer:    "Smartdo Inc.",
            subject:   "AccessToken",
            audience:  "User",
            expiresIn:  7*24*3600,
            jwtid:     UUID.v4()
        };

        JWT.sign(payload, JWT_SECRET, options, function(err, token) {
            callback && callback(err, token);
        });
    },

    verifyToken: function(token, callback) {
        var dtoken = null;
        try {
            dtoken = JWT.decode(token, { complete: true }) || {};
        } catch (err) {
            callback && callback(err);
            return;
        }

        JWT.verify(token, JWT_SECRET, function(err, decoded) {
            if (err != null) {
                if (err instanceof JWT.TokenExpiredError) {
                    err = new ServerError(ERROR_CODE.TOKEN_EXPIRED);
                }
                
                callback && callback(err);
                return;
            }

            callback && callback(null, decoded);
        });
    }
};
