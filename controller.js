/*
controller.js
It Should :

* handle CRUD operations at an abstract level (data management type agnostic)
* check if data is available for a give part slug (availabilityLookup)
* check if data is viewable/public to serve (visibilityLookup)
* verify the type of a folder (content, resource, ...)
* get the title of a part (titleLookUp)
* organize the parsing and rendering of a specific folder (rendering)
*/

var config = require('./config/modulo');
var async = require('async');

var metaParser = require('./parsers/metaparser');
var contentParser = require('./parsers/contentparser');

var controller = {};
var provider;

// I set which is the data provider (flatfile, s3, ...)
var setProvider = function(){
  if(config.sourceType == 'local'){
    provider = require('./plugins/local/plugin');
  }
}

//I serve the content of a raw file
var serveRawFile = function(path, res){
  provider.serveRawFile(path, res);
}

var getDocumentMeta = function(folder, callback){
  var metaPath = folder.path + '/meta.txt';
  console.log('folder meta to parse', metaPath);

  provider.getTextFile(metaPath, function(err, str){
    if(err){
      console.error('error while parsing meta file : ', err);
      return callback(err, undefined);
    }

    console.log('meta raw data retrieved, begining to parse');

    metaParser.parse(str, function(err, metadata){
      if(err){
        console.error('error while parsing meta file (parser) : ', err);
        return callback(err, undefined);
      }

      console.log('metadata processed for ', metaPath, ', calling back');
      callback(undefined, metadata);

    });
  });
}

// I return the full representation of a given document
var getDocument = function(slug, callback){

  //get folder containing contents
  provider.getFolder(slug, function(err, files){
    if(err){
      return callback(err, undefined);
    }
    //verify the presence of meta and contents
    var meta, content;
    files.forEach(function(file){
      if(file.fileName == 'content' && file.fileType == 'md'){
        content = file;
      }else if(file.fileName == 'meta'){
        meta = file;
      }
    });

    if(!meta){
      err = {
        status : 404,
        message : 'meta.txt file was not found for the requested document'
      }
      console.error('no meta.txt');
      callback(err, undefined);
    }
    if(!content){
      err = {
        status : 404,
        message : 'content.md file was not found for the requested document'
      }
      console.error('no content.md');
      callback(err, undefined);
    }

    var doc = {};
    async.parallel([

        //parse meta
        function(cback){
          console.log('begining to parse meta');
          provider.getTextFile(meta, function(err, str){
            if(err){
              err = {
                status : 404,
                message : 'meta file could not be parsed for the requested document'
              }
              console.error('error while parsing meta file : ', err);
              return callback(err, undefined);
            }

            console.log('meta raw data retrieved, begining to parse');

            metaParser.parse(str, function(err, metadata){
              if(err){
                err = {
                  status : 404,
                  message : 'meta file could not be parsed for the requested document'
                }
                console.error('error while parsing meta file (parser) : ', err);
                return callback(err, undefined);
              }

              console.log('metadata processed, calling back');


              //record results in doc meta and finish
              doc.metadata = metadata;
              cback(undefined, doc);
            });
          });
        },

        //parse contents
        function(cback){

          console.log('begining to parse contents');
          provider.getTextFile(content, function(err, str){
            if(err){
              err = {
                status : 404,
                message : 'content file could not be parsed for the requested document'
              }
              console.error('error while parsing content file : ', err);
              return callback(err, undefined);
            }

            console.log('content raw data retrieved, begining to parse');
            contentParser.parse(str, function(err, data){
              if(err){
                err = {
                  status : 404,
                  message : 'content file could not be parsed for the requested document'
                }
                console.error('error while parsing content file (parser) : ', err);
                return callback(err, undefined);
              }

              console.log('content processed, calling back');
              //record results in doc meta and finish
              console.log('recorded data in doc : ', data);
              doc.data = data;
              cback(undefined, doc);
            });
          });
        }

      ], function(err, results){

        callback(err, doc);

    });
  });


  /*
  returned object pattern
  {
    metadata : {},
    data : {
      raw : "",
      html : "",
      references : [],
      figures : [],
      glossaryTerms : []
    }
  }
  */
}

//I  get the list of all subdocuments
var getSummary = function(callback){
  console.log('begining to retrieve summary of the full document');
  provider.getFolder(undefined, function(err, files){
    if(err){
      return callback(err, undefined);
    }

    var folders = files.filter(function(file){
      return file.fileType === 'folder';
    });


    async.map(folders, getDocumentMeta, function(err, results){
      callback(err, results);
    })

    console.log('folders list : ', folders);

  });
}


setProvider();

controller.serveRawFile = serveRawFile;
controller.getDocument = getDocument;
controller.getSummary = getSummary;
controller.setProvider = setProvider;

module.exports = controller;
