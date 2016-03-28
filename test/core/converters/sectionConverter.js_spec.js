import {expect} from 'chai';
import {waterfall} from 'async';
import {writeFile} from 'fs';

import {parseSection, serializeSectionList} from './../../../src/core/converters/sectionConverter';
import {createFromPath, updateFromPath, deleteFromPath, readFromPath} from './../../../src/core/connectors/filesystem';
import defaultParameters from './../../../src/config/defaultParameters'
import * as models from './../../../src/core/models/'

import {sample_folder_path, crud_cobaye_path} from "./../../test_settings.json";
const base_path = __dirname + '/../../' + sample_folder_path;

describe('sectionConverter:parser', function(){
  it('should parse', function(done){
    waterfall([
        function(callback){
          readFromPath({path:base_path, depth : true, parseFiles : true}, function(err, results){
            callback(err, results);
          });
        },
        function(tree, callback){
          parseSection({tree, models, parameters : defaultParameters}, callback);
        }
      ],
      function(err, results){
        writeFile(base_path + '/parsing_output.json', JSON.stringify(results, null, 2), 'utf8', function(err){
          console.log(err, ' done')
        });
        // console.log(tree,  err);
        done();
      });
  })
})


describe('sectionConverter:serializer', function(){
  it('should serialize', function(done){
    waterfall([
        function(callback){
          readFromPath({path:base_path, depth : true, parseFiles : true}, function(err, results){
            callback(err, results);
          });
        },
        function(tree, callback){
          parseSection({tree, models, parameters : defaultParameters}, callback);
        },
        function(results, callback){
          serializeSectionList({sectionList : results.sections, models, basePath : base_path}, callback);
        }
      ],
      function(err, fsTree){
        writeFile(base_path + '/serializing_fstree.json', JSON.stringify(fsTree, null, 2), 'utf8', function(err){
          console.log(err, ' done')
        });
        // console.log(tree,  err);
        done();
      });
  })
})
