import {expect} from 'chai';
const cobaye = require('./../../_sample_content/parsing_output.json')
import {exportSection} from './../../../src/core/converters/pdfConverter';

import {sample_assets_path} from "./../../test_settings.json";
const assets_path = __dirname + '/../../' + sample_assets_path;
import * as assetsController from './../../../src/core/controllers/assetsController';

const assetsParams = {
  mode: 'filesystem',
  basePath: assets_path
};

describe('pdfConverter:exportsection', function(){
  it('should convert to pdf', function(done){
    const sections = cobaye.sections;
    exportSection({section: sections[0], sectionList: sections}, function(err, res) {
      console.log('done');
      done();
    });
  });
})
