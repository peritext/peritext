import {expect} from 'chai';
import {waterfall} from 'async';
const cobaye = require('./../../_sample_content/parsing_output.json')
import {exportSection} from './../../../src/core/exporters/pdfExporter';

import resolveDataDependencies from './../../../src/core/resolvers/resolveDataDependencies';

import {sample_assets_path} from "./../../test_settings.json";
import * as assetsController from './../../../src/core/controllers/assetsController';
const base_assets_path = __dirname + '/../../' + sample_assets_path;

const assetsParams = {
  connector: 'filesystem',
  basePath: base_assets_path
};

global.navigator = {userAgent: 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2454.85 Safari/537.36'};

describe('pdfExporter:exportsection', function(){
  it('should convert to pdf', function(done){
    const inputSections = cobaye.sections;
    waterfall([
      function(callback) {
        resolveDataDependencies(inputSections, assetsController, assetsParams, callback);
      }
    ], function(err, sections){
      exportSection({section: sections[0], sectionList: sections}, function(err, res) {
        done();
      });
    });
  });
})
