'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.renderDocument = undefined;

var _async = require('async');

var _fs = require('fs');

var _path = require('path');

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactIntl = require('react-intl');

var _resolveDataDependencies = require('./../../core/resolvers/resolveDataDependencies');

var _resolveDataDependencies2 = _interopRequireDefault(_resolveDataDependencies);

var _modelUtils = require('./../../core/utils/modelUtils');

var _models = require('./../../core/models');

var _resolveContextualizations = require('./../../core/resolvers/resolveContextualizations');

var _sharedStaticUtils = require('./../sharedStaticUtils');

var _components = require('./../../core/components');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultStylesPath = './../../config/defaultStyles/';

/**
 * Renders a section representation as a string representation of an html page
 * @param {Object} params - The params of the rendering
 * @param {Object} params.document - the document to render
 * @param {Object} params.settings - the specific rendering settings to use in order to produce the output
 * @param {string} params.destinationFolder - where to output the file
 * @params {Object} assetsController - the module to use in order to communicate with assets
 * @param {Object} assetsParams - the assets parameters to use while communicating with assetsController
 * @param {function(err:error, result:string)} rendererCallback - the possible errors encountered during rendering, and the resulting html data as a string
 */
/**
 * Render to dynamic html
 * @module renderers/renderToDynamicHtml
 */

var renderDocument = exports.renderDocument = function renderDocument(_ref, assetsController, assetsParams, rendererCallback) {
  var document = _ref.document;
  var _ref$settings = _ref.settings;
  var settings = _ref$settings === undefined ? {} : _ref$settings;


  // populate rendering params with defaults if needed
  var finalSettings = (0, _modelUtils.resolveSettings)(settings, document.metadata.general.bibType.value, _models.settingsModels);
  var style = '';

  (0, _async.waterfall)([
  // load default css rules
  /*(cback) =>{
    readFile(resolve(__dirname + defaultStylesPath + 'global.css'), (err, contents)=> {
      if (!err) {
        style += contents;
      }
      cback(err);
    });
  // load default @paged-related css rules
  },*/
  /*(depCallback) =>{
    resolveDataDependencies(document, assetsController, assetsParams, true, depCallback);
  // build html code
  },*/function ( /*inputDocument*/document, cback) {
    var renderedDocument = Object.assign({}, inputDocument);
    // build final css code (default + user-generated customizers)
    /*const cssCustomizers = renderedDocument.customizers && renderedDocument.customizers.styles;
    if (cssCustomizers !== undefined) {
      for (const name in cssCustomizers) {
        if (name !== 'screen.css') {
          style += '\n\n' + cssCustomizers[name];
        }
      }
    }*/
    var metaHead = '';
    Object.keys(document.metadata).forEach(function (domain) {
      Object.keys(document.metadata[domain]).forEach(function (key) {
        if (renderedDocument.metadata[domain][key] && renderedDocument.metadata[domain][key].htmlHead) {
          metaHead += renderedDocument.metadata[domain][key].htmlHead;
        }
      });
    });
    renderedDocument.metaHead = metaHead;

    // order contextualizations (ibid/opCit, ...)
    renderedDocument = (0, _resolveContextualizations.resolveContextualizationsRelations)(renderedDocument, finalSettings);

    renderedDocument = Object.keys(renderedDocument.contextualizations).reduce(function (doc, contId) {
      return (0, _resolveContextualizations.resolveContextualizationImplementation)(doc.contextualizations[contId], doc, 'dynamic', finalSettings);
    }, renderedDocument);

    // transform input js abstraction of contents to a js abstraction specific to rendering settings
    var sections = renderedDocument.summary.map(function (sectionKey) {
      var section1 = renderedDocument.sections[sectionKey];
      var contents = (0, _sharedStaticUtils.setDynamicSectionContents)(section1, 'contents', finalSettings);
      return Object.assign({}, section1, { contents: contents }, { type: 'contents' });
    });

    sections.forEach(function (section) {
      renderedDocument.sections[section.metadata.general.id.value] = section;
    });

    cback(null, renderedDocument);
  }], rendererCallback);
};