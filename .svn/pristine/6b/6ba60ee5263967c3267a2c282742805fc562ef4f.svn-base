var Moment = require('moment');

module.exports = {
    historyDeal: function(req, document, data) {
        if (data == null || document == null) {
            return;
        }

        var agent = req.agent || {};
        var account = agent.account || "";

        document.history = document.history || [];

        document.history.unshift({
            modifier: account,
            time: Moment().format('YYYY-MM-DD HH:mm:ss'),
            data: data
        });
    }
};