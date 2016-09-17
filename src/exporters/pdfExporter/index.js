/**
 * Prince PDF exporter
 * @module exporters/pdfExporter
 */


/**
 * This module inputs a specific peritext section, including possibly its children sections
 * and outputs a pdf file ready to display.
 * The converter used is PrinceXML non-commercial version.
 * After endless trials with free software converters such as wkhtmltopdf, weasyprint or phantomjs-pdf,
 * I could not find a way to use a free (gratis & open) tech. to produce & sufficiently reliable and user-customizable pdf output (notably via css3 @paged-media props).
 * For instance, wkhtmltopdf (and webkit-based converters in general) does not support 'float:footnotes' feature which is mandatory for scholarly outputs like peritext's ones
 * Therefore I chose proprietary software PrinceXML, which works wonderfully well. It is used in its free version for now (which is why Prince logo is added on the first page, no commercial use license)
 */

const Prince = require('prince');
import {resolve} from 'path';
import {waterfall} from 'async';
import {
  writeFile,
  exists,
  mkdir
} from 'fs';

import {renderDocument} from './../../renderers/renderToStaticHtml';

/**
 * Exports a section representation to a pdf file
 * @param {Object} params - The params of the export
 * @param {Object} params.document - the document to export
 * @param {Object} params.settings - the specific rendering settings to use in order to produce the output
 * @param {string} params.destinationFolder - where to output the file
 * @params {Object} assetsController - the module to use in order to communicate with assets
 * @param {Object} assetsParams - the assets parameters to use while communicating with assetsController
 * @param {function(err:error)} callback - the possible errors encountered during export
 */
export const exportSectionToPdf = ({
  document,
  settings,
  destinationFolder,
}, assetsController, assetsParams, finalCallback) =>{

  const motherKey = document.metadata.general.id.value;
  const path = destinationFolder || resolve(__dirname + '/temp/');
  console.log('export to path: ', path);
  waterfall([
    // get or create destination folder
    (existsCb)=> {
      exists(path, (isThere)=> {
        if (!isThere) {
          return mkdir(path, existsCb);
        }
        return existsCb(null);
      });
    },
    // render the section to static html
    (renderCb)=> {
      renderDocument({document, destinationFolder}, assetsController, assetsParams, renderCb);
    },
    // write the section to a static html file
    (html, writeCb)=> {
      writeFile(path + '/' + motherKey + '.html', html, 'utf-8', writeCb);
    }
  ], (err)=> {
    if (!err) {
      Prince()
      .inputs(path + '/' + motherKey + '.html')
      .output(path + '/' + motherKey + '.pdf')
      .execute()
      .then(function() {
        console.log('saved to pdf with PrinceXML');
        return finalCallback();
      }, function(error) {
        console.log('Prince ERROR: ', error);
        return finalCallback(error);
      });
    } else {
      console.error('error during rendering to static html : ', err);
      return finalCallback(err);
    }
  });
};
