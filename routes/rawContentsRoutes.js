var express = require('express');
var router = express.Router();

/* GET home page. */

router.get('/', function(req, res) {
  var title = req.params.slug || 'Root';
  res.json({rawContent : 'toServe'});
});

module.exports = router;
