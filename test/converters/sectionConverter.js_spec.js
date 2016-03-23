import {expect} from 'chai';
import {waterfall} from 'async';

import {parseSection, serializeSection} from './../../src/converters/sectionConverter';
import {createFromPath, updateFromPath, deleteFromPath, readFromPath} from './../../src/connectors/filesystem';
import defaultParameters from './../../src/config/defaultParameters'
import * as models from './../../src/models/'

import {sample_folder_path, crud_cobaye_path} from "./../test_settings.json";
const base_path = __dirname + '/../' + sample_folder_path;

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
      function(err, tree){
        // console.log(tree,  err);
        done();
      });
  })
})
