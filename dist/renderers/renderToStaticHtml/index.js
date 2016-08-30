'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.renderSection = undefined;

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

var _sectionUtils = require('./../../core/utils/sectionUtils');

var _modelUtils = require('./../../core/utils/modelUtils');

var _models = require('./../../core/models');

var _resolveContextualizations = require('./../../core/resolvers/resolveContextualizations');

var _sharedStaticUtils = require('./../sharedStaticUtils');

var _components = require('./../../core/components');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultStylesPath = './../../config/defaultStyles/'; /**
                                                          * Render to static html
                                                          * @module renderers/renderToStaticHtml
                                                          */

var listChildren = function listChildren(sections, key) {
  var output = [];
  sections.forEach(function (thatSection) {
    if (thatSection.parent === key) {
      output = output.concat(thatSection);
      var thatKey = (0, _sectionUtils.getMetaValue)(thatSection.metadata, 'general', 'citeKey');
      output = output.concat(listChildren(sections, thatKey));
    }
  });
  return output;
};

var resolveNode = function resolveNode(node, section, settings) {
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

var setSectionContents = function setSectionContents(section, settings) {
  return section.contents.map(function (node) {
    return resolveNode(node, section, settings);
  });
};

/**
 * Renders a section representation as a string representation of an html page
 * @param {Object} params - The params of the export
 * @param {Object} params.section - the (root) section to export
 * @param {array} params.sectionList - the section context (if necessary)
 * @param {Object} params.settings - the specific rendering settings to use in order to produce the output
 * @param {boolean} params.includeChildren - whether to include section's children sections
 * @param {string} params.destinationFolder - where to output the file
 * @params {Object} assetsController - the module to use in order to communicate with assets
 * @param {Object} assetsParams - the assets parameters to use while communicating with assetsController
 * @param {function(err:error, result:string)} rendererCallback - the possible errors encountered during rendering, and the resulting html data as a string
 */
var renderSection = exports.renderSection = function renderSection(_ref, assetsController, assetsParams, rendererCallback) {
  var section = _ref.section;
  var sectionList = _ref.sectionList;
  var _ref$settings = _ref.settings;
  var settings = _ref$settings === undefined ? {} : _ref$settings;
  var _ref$includeChildren = _ref.includeChildren;
  var includeChildren = _ref$includeChildren === undefined ? true : _ref$includeChildren;


  // populate rendering params with defaults if needed
  // todo : resolve in a separate file (modelUtils)
  var finalSettings = (0, _modelUtils.resolveSettings)(settings, (0, _sectionUtils.getMetaValue)(section.metadata, 'general', 'bibType'), _models.settingsModels);

  // always work with a list of sections, even if just one
  var sectios = [section];
  var style = '';
  var motherKey = (0, _sectionUtils.getMetaValue)(section.metadata, 'general', 'citeKey');
  // delimitate the sections to render - if includeChildren is enabled filter parented
  if (includeChildren) {
    sectios = sectios.concat(listChildren(sectionList, motherKey));
  }
  (0, _async.waterfall)([
  // load default css rules
  function (cback) {
    (0, _fs.readFile)((0, _path.resolve)(__dirname + defaultStylesPath + 'global.css'), function (err, contents) {
      if (!err) {
        style += contents;
      }
      cback(err, sectios);
    });
    // load default paged-related css rules
  }, function (sections, cback) {
    (0, _fs.readFile)((0, _path.resolve)(__dirname + defaultStylesPath + 'page.css'), function (err, contents) {
      if (!err) {
        style += contents;
      }
      cback(err, sections);
    });
  }, function (inputSections, depCallback) {
    (0, _resolveDataDependencies2.default)(inputSections, assetsController, assetsParams, true, depCallback);
    // build html code
  }, function (inputSections, cback) {
    var sections = inputSections.slice();
    // build final css code (default + user-generated customizers)
    var cssCustomizers = sections[0].customizers && sections[0].customizers.styles;
    if (cssCustomizers !== undefined) {
      for (var name in cssCustomizers) {
        if (name !== 'screen.css') {
          style += '\n\n' + cssCustomizers[name];
        }
      }
    }
    // prepare translations
    var lang = (0, _sectionUtils.getMetaValue)(sections[0].metadata, 'general', 'language') || 'en';
    var messages = require('./../../../translations/locales/' + lang + '.json');
    // build metadata (todo : check if react-based helmet lib could cover "rare" metadata props like dublincore ones)
    var metaHead = sections[0].metadata.filter(function (meta) {
      return meta.htmlHead;
    }).reduce(function (exp, meta) {
      return exp + meta.htmlHead;
    }, '') + '<meta name="generator" content="peritext"/>';
    // order contextualizations (ibid/opCit, ...)
    sections = (0, _resolveContextualizations.resolveContextualizationsRelations)(sections, finalSettings);
    // resolve contextualizations js representation according to settings
    var figuresCount = 0;
    sections = sections.map(function (sectio, index) {
      sectio.figuresCount = figuresCount;
      var newSection = (0, _resolveContextualizations.resolveContextualizationsImplementation)(sectio, 'static', finalSettings);
      figuresCount = newSection.figuresCount;
      return newSection;
    });
    // transform input js abstraction of contents to a js abstraction specific to rendering settings
    sections = sections.map(function (section1) {
      var contents = setSectionContents(section1, finalSettings);
      return Object.assign(section1, contents, { type: 'contents' });
    });

    var _composeRenderedSecti = (0, _sharedStaticUtils.composeRenderedSections)(sections, finalSettings, style, messages);

    var renderedSections = _composeRenderedSecti.renderedSections;
    var finalStyle = _composeRenderedSecti.finalStyle;
    // render document

    var renderedContents = _server2.default.renderToStaticMarkup(_react2.default.createElement(
      _reactIntl.IntlProvider,
      { locale: lang, messages: messages },
      _react2.default.createElement(_components.StaticDocument, { sections: renderedSections, rootSection: sections[0], settings: finalSettings })
    ));
    var html = ('\n<!doctype:html>\n<html>\n  <head>\n    ' + metaHead + '\n    <style>\n      ' + finalStyle + '\n    </style>\n  </head>\n  <body>\n    ' + renderedContents + '\n   </body>\n</html>').replace(/itemscope=""/g, 'itemscope');
    cback(null, html);
  }], rendererCallback);
};