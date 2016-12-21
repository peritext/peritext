import {waterfall} from 'async';
import {resolve} from 'path';
import {
  contentsController,
  assetsController,
  exportDocumentToPdf,
  exportDocumentToEpub,
  defaultParameters,
  defaultModels,
  renderToDynamicDocument
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
    exportDocumentToPdf({
      document: results.document,
      destinationFolder
    }, assetsController, assetsParams , (err, success)=>{
      console.log('pdf is done with book, errors : ', err);
    });
    exportDocumentToEpub({
      document: results.document,
      destinationFolder
    }, assetsController, assetsParams , (err, success)=>{
      console.log('epub is done with book, errors : ', err);
    });
  });
}
