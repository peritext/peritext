var express = require('express');
var router = express.Router();
var controller = require('./../controller');


router.get('/:slug?', function(req, res) {
  var title = req.params.slug || 'Root';

  controller.getDocument(decodeURIComponent(req.params.slug), function(err, doc){
      if(err){
        res.status(err.status).render('error', {error : err, message:err.message, status : err.status});
      }else{
        res.render('index', { title: title, slug : title, doc : doc });
      }
  });
});

module.exports = router;
