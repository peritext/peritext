import {waterfall} from 'async';
import {resolve} from 'path';
import {
  contentsController,
  assetsController,
  exportSectionToPdf,
  defaultParameters,
  defaultModels
} from './../../src';

global.navigator = {userAgent: 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2454.85 Safari/537.36'};

export default function runExample() {
  const params = {
    connector: 'filesystem',
    basePath: __dirname + '/input'
  };
  const assetsParams = {
    connector: 'filesystem',
    basePath: __dirname + '/../_examples_assets'
  }
  const destinationFolder = resolve(__dirname + '/output');
  waterfall([
    function(callback){
      contentsController.updateFromSource(params, defaultModels, defaultParameters, callback);
    }
  ], function(err, results){
    const sections = results.sections;
    exportSectionToPdf({
      section: sections[0],
      sectionList: sections,
      destinationFolder
    }, assetsController, assetsParams , (err, success)=>{
      console.log('done with phd thesis, errors : ', err);
    });
  });
}
