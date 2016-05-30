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

const inputParams = {
  basePath: base_path,
  connector: 'filesystem'
}

const outputParams = {
  basePath: base_output,
  connector: 'filesystem'
}

let params;



describe('contentController:updateFromSource', function(){
  it('should update unfaulted data from source without processing errors', function(done){
    lib.updateFromSource(inputParams, models, defaultParameters, function(err, results){
      expect(err).to.be.null;
      expect(results).to.be.defined;
      done();
    });
  });
});


describe('contentController:updateToSource', function(){
  params = outputParams;
  it('should update unfaulted data from one source to another without breaking', function(done){
    let inputFsTree, sections;
    waterfall([
      //delete test folder
      function(cb){
        exists(base_output, function(isThere){
          if (isThere) {
            connector.deleteFromPath({params}, cb);
          } else {
            cb();
          }
        });
      },
      //recreate test folder
      function(cb){
        connector.createFromPath({params, type: 'directory', overwrite: true}, function(err, response){
          cb();
        });
      },
      //make a fs representation of the test folder
      function(cb) {
        connector.readFromPath({params, depth: true, parseFiles: true}, function(err, results) {
          inputFsTree = results;
          cb();
        });
      },
      //fill the data to update
      function(cb) {
        lib.updateFromSource(inputParams, models, defaultParameters, function(err, results){
          sections = results.sections;
          cb();
        });
      },
      function(cb){
        lib.updateToSource(outputParams, sections, models, inputFsTree, function(err, res){
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

