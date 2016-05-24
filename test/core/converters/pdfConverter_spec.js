import {expect} from 'chai';
const cobaye = require('./../../_sample_content/parsing_output.json')
import {exportSection} from './../../../src/core/converters/pdfConverter';

describe('pdfConverter:exportsection', function(){
  it('should convert to pdf', function(done){
    const sections = cobaye.sections;
    exportSection({section: sections[0], sectionList: sections}, function(err, res) {
      console.log('done');
      done();
    });
  });
})
