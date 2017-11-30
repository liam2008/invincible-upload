var Shared = require('../../shared/');
var ERROR_CODE = Shared.ERROR;
var MESSAGE = Shared.MESSAGE;

var dealErr = {
    findErr: function (err, res) {
        if(err) {
            res.error(ERROR_CODE.FIND_FAILED);
            return true;
        }else {
            return false;
        }
    },

    createErr: function (err, res) {
        if(err) {
            res.error(ERROR_CODE.CREATE_FAILED);
            return true;
        }else {
            return false;
        }
    },

    updateErr: function (err, res) {
        if(err) {
            res.error(ERROR_CODE.UPDATE_FAILED);
            return true;
        }else {
            return false;
        }
    },

    removeErr: function (err, res) {
        if(err) {
            res.error(ERROR_CODE.DELETE_FAILED);
            return true;
        }else {
            return false;
        }
    }
};

module.exports = dealErr;
