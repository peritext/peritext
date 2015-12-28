var express = require('express');
var router = express.Router();

/* GET home page. */

router.get('/:slug?', function(req, res) {
  var title = req.params.slug || 'Root';
  res.render('index', { title: title, slug : req.params.slug });
});

module.exports = router;
