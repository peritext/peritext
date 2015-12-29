/*
AMAZON S3 module
*/
var mime = require('mime');
var async = require('async');

var AWS = require('aws-sdk');
var config = require('./../../config/modulo');

AWS.config.loadFromPath(__dirname + '/../../credentials/s3.json');
var credentials = require('./../../credentials/s3');
AWS.config.region = credentials.region;

var s3 = new AWS.S3();

var bucket = config.Bucket;


var plugin = {};





plugin.serveRawFile = function(path, res){

  console.log('begining to serve raw file content from ', path);
  extension = path.split('.')[path.split('.').length - 1];

  if(!extension){
      res.status(404).send({message : 'Unable to serve folders'});
  }

  s3.getObject({
    Bucket : bucket,
    Key : path,
  }, function(err, data){
    if(err){
      return res.status(404).send({message : 's3 could not load the file', error : err});
    }

    var contentType = mime.lookup(extension);

    if(contentType.indexOf('text') > -1){
      res.writeHead(200, {'Content-Type': contentType });
      res.write(data.Body.toString('utf-8'));
    }else{
      res.end(data.Body, 'binary')
    }
  });
}


plugin.getTextFile = function(input, callback){

  var key = (typeof input == 'string')?input:input.path;

  console.log('begining to get text file ', input);

  s3.getObject({
    Bucket : bucket,
    Key : key
  }, function(err, data){
    if(!err){
      console.log(key, ' read successfully');
    }
    //console.log('data obtained : ', data);
    callback(err, data.Body.toString('utf-8'));
  });
}

plugin.getFolder = function(slug, callback){
  var prefix = (slug && slug != "undefined")?slug+"/":"";

  console.log('launching getFolder');
  s3.listObjects({
    Bucket : bucket,
    Prefix : prefix
  }, function (err, data) {
    if(err){
      console.log('error in listing : ', err);
      callback(err, undefined);
    }else{
      var output = [];
      data.Contents.forEach(function(file){
        var item = file.Key;
        var nI = {};
        nI.path =  item;
        var fName = item.split('/')[item.split('/').length - 1];

        var ext;
        if(fName.indexOf('.') > -1){
          fName = fName.split('.');
          ext = fName.pop();
          fName = fName.join('.');
        }
        nI.fileName = fName;
        if(ext){
          nI.fileType = ext;
        }else{
          nI.fileType = 'folder';
        }
        output.push(nI);
      });
      console.log('ok listing from s3 : ', output);
      callback(undefined, output);
    }
  });
}

module.exports = plugin;
