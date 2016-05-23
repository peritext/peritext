import {expect} from 'chai';
import {waterfall} from 'async';

import * as connector from './../../../src/core/connectors/filesystem';
import {exists} from 'fs';
import * as lib from './../../../src/core/controllers/contentsController';

import * as models from './../../../src/core/models/'
import defaultParameters from './../../../src/config/defaultParameters'
import {sample_output_path, sample_folder_path, crud_cobaye_path} from "./../../test_settings.json";
const base_path = __dirname + '/../../' + sample_folder_path;
const base_output = __dirname + '/../../' + sample_output_path;


describe('contentController:updateFromSource', function(){
  it('should update unfaulted data from source without processing errors', function(done){
    lib.updateFromSource(connector, base_path, models, defaultParameters, function(err, results){
      expect(err).to.be.null;
      expect(results).to.be.defined;
      done();
    })
  });
});

describe('contentController:updateToSource', function(){
  it('should update unfaulted data from one source to another without breaking', function(done){
    let inputFsTree, sections;
    waterfall([
      //delete test folder
      function(cb){
        exists(base_output, function(isThere){
          if (isThere) {
            connector.deleteFromPath({path: base_output}, cb);
          } else {
            cb();
          }
        });
      },
      //recreate test folder
      function(cb){
        connector.createFromPath({path: base_output, type: 'directory', overwrite: true}, function(err, response){
          cb();
        });
      },
      //make a fs representation of the test folder
      function(cb) {
        connector.readFromPath({path: base_output, depth: true, parseFiles: true}, function(err, results) {
          inputFsTree = results;
          cb();
        });
      },
      //fill the data to update
      function(cb) {
        lib.updateFromSource(connector, base_path, models, defaultParameters, function(err, results){
          sections = results.sections;
          cb();
        });
      },
      function(cb){
        lib.updateToSource(connector, base_output, sections, models, inputFsTree, function(err, res){
          cb(err, res);
        });
      }
    ],
    function(err, results) {
      expect(err).to.be.null;
      expect(results).to.be.defined;
      done();
    });
  });
});
