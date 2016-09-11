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

var _server = require('react-dom/server');

var _server2 = _interopRequireDefault(_server);

var _reactIntl = require('react-intl');

var _resolveDataDependencies = require('./../../core/resolvers/resolveDataDependencies');

var _resolveDataDependencies2 = _interopRequireDefault(_resolveDataDependencies);

var _modelUtils = require('./../../core/utils/modelUtils');

var _models = require('./../../core/models');

var _resolveContextualizations = require('./../../core/resolvers/resolveContextualizations');

var _sharedStaticUtils = require('./../sharedStaticUtils');

var _components = require('./../../core/components');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Render to static html
 * @module renderers/renderToStaticHtml
 */

var defaultStylesPath = './../../config/defaultStyles/';

var resolveNode = function resolveNode(inputNode, section, settings) {
  var node = Object.assign({}, inputNode);
  if (node.tag === 'note') {
    var note = section.notes.find(function (thatNote) {
      return thatNote.id === node.target;
    });
    node.props = { note: note };
    if (settings.notesPosition === 'footnotes') {
      node.tag = _components.StaticFootnote;
    } else {
      node.tag = _components.StaticNotePointer;
    }
    node.special = true;
  }
  if (node.child) {
    node.child = node.child.map(function (child) {
      return resolveNode(child, section, settings);
    });
  }
  return node;
};

var setSectionContents = function setSectionContents(section, key, settings) {
  return section[key].map(function (node) {
    return resolveNode(node, section, settings);
  });
};

/**
 * Renders a section representation as a string representation of an html page
 * @param {Object} params - The params of the export
 * @param {Object} params.document - the document to export
 * @param {Object} params.settings - the specific rendering settings to use in order to produce the output
 * @param {string} params.destinationFolder - where to output the file
 * @params {Object} assetsController - the module to use in order to communicate with assets
 * @param {Object} assetsParams - the assets parameters to use while communicating with assetsController
 * @param {function(err:error, result:string)} rendererCallback - the possible errors encountered during rendering, and the resulting html data as a string
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
  function (cback) {
    (0, _fs.readFile)((0, _path.resolve)(__dirname + defaultStylesPath + 'global.css'), function (err, contents) {
      if (!err) {
        style += contents;
      }
      cback(err);
    });
    // load default @paged-related css rules
  }, function (cback) {
    (0, _fs.readFile)((0, _path.resolve)(__dirname + defaultStylesPath + 'page.css'), function (err, contents) {
      if (!err) {
        style += contents;
      }
      cback(err);
    });
  }, function (depCallback) {
    (0, _resolveDataDependencies2.default)(document, assetsController, assetsParams, true, depCallback);
    // build html code
  }, function (inputDocument, cback) {
    var renderedDocument = Object.assign({}, inputDocument);
    // build final css code (default + user-generated customizers)
    var cssCustomizers = renderedDocument.customizers && renderedDocument.customizers.styles;
    if (cssCustomizers !== undefined) {
      for (var name in cssCustomizers) {
        if (name !== 'screen.css') {
          style += '\n\n' + cssCustomizers[name];
        }
      }
    }
    // prepare translations
    var lang = renderedDocument.metadata.general.language ? renderedDocument.metadata.general.language.value : 'en';
    var messages = require('./../../../translations/locales/' + lang + '.json');
    // build metadata (todo : check if react-based helmet lib could cover "rare" metadata props like dublincore ones)
    var metaHead = '<meta name="generator" content="peritext"/>';
    for (var domain in document.metadata) {
      if (renderedDocument.metadata[domain]) {
        for (var key in renderedDocument.metadata[domain]) {
          if (renderedDocument.metadata[domain][key] && renderedDocument.metadata[domain][key].htmlHead) {
            metaHead += renderedDocument.metadata[domain][key].htmlHead;
          }
        }
      }
    }
    // order contextualizations (ibid/opCit, ...)
    renderedDocument = (0, _resolveContextualizations.resolveContextualizationsRelations)(renderedDocument, finalSettings);

    // resolve contextualizations js representation according to settings
    renderedDocument.figuresCount = 0;

    renderedDocument = Object.keys(renderedDocument.contextualizations).reduce(function (doc, contCiteKey) {
      return (0, _resolveContextualizations.resolveContextualizationImplementation)(doc.contextualizations[contCiteKey], doc, 'static', finalSettings);
    }, renderedDocument);

    // transform input js abstraction of contents to a js abstraction specific to rendering settings
    var sections = renderedDocument.summary.map(function (sectionKey) {
      var section1 = renderedDocument.sections[sectionKey];
      var contents = setSectionContents(section1, 'contents', finalSettings);
      return Object.assign({}, section1, { contents: contents }, { type: 'contents' });
    });

    var _composeRenderedSecti = (0, _sharedStaticUtils.composeRenderedSections)(sections, renderedDocument, finalSettings, style, messages);

    var renderedSections = _composeRenderedSecti.renderedSections;
    var finalStyle = _composeRenderedSecti.finalStyle;
    // render document

    var renderedContents = _server2.default.renderToStaticMarkup(_react2.default.createElement(
      _reactIntl.IntlProvider,
      { locale: lang, messages: messages },
      _react2.default.createElement(_components.StaticDocument, { document: renderedDocument, sections: renderedSections, settings: finalSettings })
    ));
    var html = ('\n<!doctype:html>\n<html>\n  <head>\n    ' + metaHead + '\n    <style>\n      ' + finalStyle + '\n    </style>\n  </head>\n  <body>\n    ' + renderedContents + '\n   </body>\n</html>').replace(/itemscope=""/g, 'itemscope');
    cback(null, html);
  }], rendererCallback);
};