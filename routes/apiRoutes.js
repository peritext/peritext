var express = require('express');
var router = express.Router();

/* GET home page. */

router.get('/', function(req, res) {
  res.json({api : 'global view'});
});

//GET document data
router.get('/document/:slug', function(req, res) {
  var slug = req.params.slug;
  res.json({api : 'this endpoint will serve document data of '+slug});
});

//PUT document data
router.put('/document/:slug', function(req, res) {
  var slug = req.params.slug;
  res.json({api : 'this endpoint will change/put document data of '+slug});
});

//GET summary
router.get('/summary', function(req, res) {
  res.json({api : 'this endpoint will serve document summary'});
});

//GET glossary
router.get('/glossary', function(req, res) {
  res.json({api : 'this endpoint will serve document glossary'});
});

//GET figures
router.get('/figures', function(req, res) {
  res.json({api : 'this endpoint will serve document figures'});
});

//GET references
router.get('/references', function(req, res) {
  res.json({api : 'this endpoint will serve document references'});
});

//GET search result
router.get('/search', function(req, res) {
  res.json({api : 'this endpoint will serve search results'});
});

module.exports = router;
