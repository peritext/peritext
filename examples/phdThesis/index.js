import {waterfall} from 'async';
import {resolve} from 'path';
import {
  contentsController,
  assetsController,
  exportDocumentToPdf,
  exportDocumentToEpub,
  defaultParameters,
  defaultModels
} from './../../src/peritext';
import {writeFileSync} from 'fs';

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
    (callback)=>{
      contentsController.updateFromSource(params, defaultModels, defaultParameters, callback);
    }
  ], (err, results)=>{
    writeFileSync(__dirname + '/output/serialized.json', JSON.stringify(results, null, 2));
    // const sections = results.sections;
    exportDocumentToPdf({
      document: results.document,
      destinationFolder
    }, assetsController, assetsParams , (err, success)=>{
      console.log('done with phd thesis, errors : ', err);
    });
    exportDocumentToEpub({
      document: results.document,
      destinationFolder
    }, assetsController, assetsParams , (err, success)=>{
      console.log('epub is done with phd thesis, errors : ', err);
    });
  });
}
