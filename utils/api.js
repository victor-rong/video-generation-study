var express = require('express');
var router = express.Router();
var query = require('./query.js');

router.route('/').post(function(req, res) {
    var data = req.body;
    query.sendToSQL(data, () => {});
    res.send(JSON.stringify(data));
});

router.route('/results').post(function(req, res) {
    var data = req.body;
    query.getResults(data, () => {}).then(
        function(results) {
            res.send(results);
        }
    );
    
});

module.exports = router;