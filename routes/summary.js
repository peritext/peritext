var express = require('express');
var router = express.Router();
var controller = require('./../controller');

/* GET home page. */

router.get('/', function(req, res) {
  controller.getSummary(function(err, summary){
    if(err){
      res.status(err.status).render('error', {error : err, message:err.message, status : err.status});
    }else{
      res.render('summary', { summary: summary });
    }
  })
});

module.exports = router;
