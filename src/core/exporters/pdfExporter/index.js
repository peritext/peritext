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
import {writeFile} from 'fs';

import {getMetaValue} from './../../utils/sectionUtils';
import renderSection from './../../renderers/renderToStaticHtml';

export function exportSection({
  section,
  sectionList,
  settings,
  includeChildren,
  destinationFolder = './../../../temp/'
}, callback) {

  const motherKey = getMetaValue(section.metadata, 'general', 'citeKey');

  waterfall([
    (renderCb)=> {
      renderSection({section, sectionList, includeChildren, destinationFolder}, renderCb);
    },
    (html, writeCb)=> {
      writeFile(resolve(__dirname + destinationFolder + motherKey + '.html'), html, 'utf-8', function(err) {
        writeCb(err);
      });
    }
  ], (err)=> {
    if (!err) {
      Prince()
      .inputs(resolve(__dirname + destinationFolder + motherKey + '.html'))
      .output(resolve(__dirname + destinationFolder + motherKey + '.pdf'))
      .execute()
      .then(function() {
        console.log('saved to pdf with PrinceXML');
        callback();
      }, function(error) {
        console.log('Prince ERROR: ', error);
      });
    } else {
      console.error('error during rendering to static html : ', err);
    }
  });
}
