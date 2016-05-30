import {expect} from 'chai';
import {waterfall} from 'async';
const cobaye = require('./../../_sample_content/parsing_output.json')
import {exportSection} from './../../../src/core/converters/pdfConverter';

import resolveDataDependencies from './../../../src/core/resolvers/resolveDataDependencies';

import {sample_assets_path} from "./../../test_settings.json";
import * as assetsController from './../../../src/core/controllers/assetsController';
const base_assets_path = __dirname + '/../../' + sample_assets_path;

const assetsParams = {
  connector: 'filesystem',
  basePath: base_assets_path
};


describe('pdfConverter:exportsection', function(){
  it('should convert to pdf', function(done){
    const inputSections = cobaye.sections;
    waterfall([
      function(callback) {
        resolveDataDependencies(inputSections, assetsController, assetsParams, callback);
      }
    ], function(err, sections){
      exportSection({section: sections[0], sectionList: sections}, function(err, res) {
        console.log('done');
        done();
      });
    });
  });
})
