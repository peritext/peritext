'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exportSection;

var _path = require('path');

var _async = require('async');

var _fs = require('fs');

var _sectionUtils = require('./../../core/utils/sectionUtils');

var _renderToStaticHtml = require('./../../renderers/renderToStaticHtml');

var _renderToStaticHtml2 = _interopRequireDefault(_renderToStaticHtml);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
function exportSection(_ref, assetsController, assetsParams, finalCallback) {
  var section = _ref.section;
  var sectionList = _ref.sectionList;
  var settings = _ref.settings;
  var includeChildren = _ref.includeChildren;
  var _ref$destinationFolde = _ref.destinationFolder;
  var destinationFolder = _ref$destinationFolde === undefined ? './../../_temp/' : _ref$destinationFolde;


  var motherKey = (0, _sectionUtils.getMetaValue)(section.metadata, 'general', 'citeKey');
  var path = (0, _path.resolve)(__dirname + destinationFolder);
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
    (0, _renderToStaticHtml2.default)({ section: section, sectionList: sectionList, includeChildren: includeChildren, destinationFolder: destinationFolder }, assetsController, assetsParams, renderCb);
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
}
module.exports = exports['default'];