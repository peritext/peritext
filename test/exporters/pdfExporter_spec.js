import {expect} from 'chai';
import {waterfall} from 'async';
const cobaye = require('./../_sample_content/parsing_output.json')
import {exportSection} from './../../src/exporters/pdfExporter';

import * as assetsController from './../../src/core/controllers/assetsController';
import * as models from './../../src/core/models/';

import {parseSection} from './../../src/core/converters/sectionConverter';
import {readFromPath} from './../../src/connectors/filesystem';
import defaultParameters from './../../src/config/defaultParameters';

import {sample_folder_path, sample_assets_path} from "./../test_settings.json";
const base_assets_path = __dirname + '/../' + sample_assets_path;
const basePath = __dirname + '/../' + sample_folder_path;

const assetsParams = {
  connector: 'filesystem',
  basePath: base_assets_path
};

global.navigator = {userAgent: 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2454.85 Safari/537.36'};

describe('pdfExporter:exportsection', function(){
  it('should convert to pdf', function(done){
    // const inputSections = cobaye.sections;
    waterfall([
      function(callback){
        readFromPath({path: '', params: {basePath}, depth: true, parseFiles: true}, function(err, results){
          callback(err, results);
        });
      },
      function(tree, callback){
        parseSection({tree, models, parameters: defaultParameters}, callback);
      }
    ], function(err, results){
      const sections = results.sections;
      exportSection({section: sections[0], sectionList: sections}, assetsController, assetsParams, done);
    });
  });
})
