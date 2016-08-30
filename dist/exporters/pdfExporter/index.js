'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.exportSectionToPdf = undefined;

var _path = require('path');

var _async = require('async');

var _fs = require('fs');

var _sectionUtils = require('./../../core/utils/sectionUtils');

var _renderToStaticHtml = require('./../../renderers/renderToStaticHtml');

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

var Prince = require('prince');


/**
 * Exports a section representation to a pdf file
 * @param {Object} params - The params of the export
 * @param {Object} params.section - the (root) section to export
 * @param {array} params.sectionList - the section context (if necessary)
 * @param {Object} params.settings - the specific rendering settings to use in order to produce the output
 * @param {boolean} params.includeChildren - whether to include section's children sections
 * @param {string} params.destinationFolder - where to output the file
 * @params {Object} assetsController - the module to use in order to communicate with assets
 * @param {Object} assetsParams - the assets parameters to use while communicating with assetsController
 * @param {function(err:error)} callback - the possible errors encountered during export
 */
var exportSectionToPdf = exports.exportSectionToPdf = function exportSectionToPdf(_ref, assetsController, assetsParams, finalCallback) {
  var section = _ref.section;
  var sectionList = _ref.sectionList;
  var settings = _ref.settings;
  var includeChildren = _ref.includeChildren;
  var destinationFolder = _ref.destinationFolder;


  var motherKey = (0, _sectionUtils.getMetaValue)(section.metadata, 'general', 'citeKey');
  var path = destinationFolder || (0, _path.resolve)(__dirname + './temp/');
  console.log('path', path);
  (0, _async.waterfall)([
  // get or create destination folder
  function (existsCb) {
    (0, _fs.exists)(path, function (isThere) {
      if (!isThere) {
        return (0, _fs.mkdir)(path, existsCb);
      }
      return existsCb(null);
    });
  },
  // render the section to static html
  function (renderCb) {
    (0, _renderToStaticHtml.renderSection)({ section: section, sectionList: sectionList, includeChildren: includeChildren, destinationFolder: destinationFolder }, assetsController, assetsParams, renderCb);
  },
  // write the section to a static html file
  function (html, writeCb) {
    (0, _fs.writeFile)(path + '/' + motherKey + '.html', html, 'utf-8', writeCb);
  }], function (err) {
    if (!err) {
      Prince().inputs(path + '/' + motherKey + '.html').output(path + '/' + motherKey + '.pdf').execute().then(function () {
        console.log('saved to pdf with PrinceXML');
        return finalCallback();
      }, function (error) {
        console.log('Prince ERROR: ', error);
        return finalCallback(error);
      });
    } else {
      console.error('error during rendering to static html : ', err);
      return finalCallback(err);
    }
  });
};