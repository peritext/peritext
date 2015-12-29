/*
Local flatfile module
*/
var fs = require('fs');
var folder = require('./../../config/modulo').contentsFolder;
var BASE = './' + folder + '/';
var abs = __dirname + '/../../'+folder + '/';
var mime = require('mime');
var plugin = {};





plugin.serveRawFile = function(path, res){
  path = abs + path;

  fs.exists(path, function(exists){
    if(!exists){
      res.status(404).send({message : 'file '+path+' does not exist'});
    }
    var contentType,
        extension = path.split('.')[path.split('.').length - 1];

    if(!extension){
      res.status(404).send({message : 'Unable to serve folders'});
    }

    var contentType = mime.lookup(extension);

    res.writeHead(200, {'Content-Type': contentType });
    // stream the file
    fs.createReadStream(path, 'utf-8').pipe(res);

  });
}


plugin.getTextFile = function(input, callback){
  var path = (typeof input === 'string')?input:input.path;
  console.log('asked to fs read : ', path);
  fs.readFile(path, 'utf8', function(err, contents){
    if(!err){
      console.log(path, ' read successfully');
    }
    callback(err, contents);
  })
}

plugin.getFolder = function(slug, callback){
  var path = (typeof slug == 'string' && slug != 'undefined')?BASE + slug + '/':BASE;

  console.log('plugin going through ', slug, ', parsing : ', path);
  fs.readdir(path, function(err, tree){
    if(err){
      console.log('error in listing : ', err);
      callback(err, undefined);
    }else{
      var output = [];

      tree.forEach(function(item){
        var nI = {};
        nI.path = path + item;
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
      console.log('ok listing', output);
      callback(undefined, output);
    }
  })
}

module.exports = plugin;
