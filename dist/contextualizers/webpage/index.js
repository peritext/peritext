'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.contextualizeBlockDynamic = exports.contextualizeInlineDynamic = exports.contextualizeBlockStatic = exports.contextualizeInlineStatic = undefined;

var _objectPath = require('object-path');

var _components = require('./../../core/components');

var _StaticWebsitePoster = require('./StaticWebsitePoster.js');

var _StaticWebsitePoster2 = _interopRequireDefault(_StaticWebsitePoster);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } } /**
                                                                                                                                                                                                     * Webpage contextualizer that resolve sections data according to contextualization+settings params
                                                                                                                                                                                                     * @module contextualizers/webpage
                                                                                                                                                                                                     */

/**
 * Handle an inline contextualization for static outputs
 * @param {Object} inputDocument - The representation of the peritext document to update
 * @param {Object} inputContextualization - The representation of the contextualization to resolve
 * @param {Object} settings - the specific rendering settings to use for resolving the contextualization
 * @return {Object} newDocument - the updated representation of the peritext document in which the contextualization was made
 */
var contextualizeInlineStatic = exports.contextualizeInlineStatic = function contextualizeInlineStatic(inputDocument, inputContextualization, settings) {
  var document = Object.assign({}, inputDocument);
  var contextualization = Object.assign({}, inputContextualization);
  var sectionCiteKey = contextualization.nodePath[0];
  var path = ['sections'].concat(_toConsumableArray(contextualization.nodePath.slice()));
  var node = (0, _objectPath.get)(document, path);
  var section = document.sections[sectionCiteKey];

  var link = {
    node: 'element',
    tag: _components.StructuredHyperLink,
    special: true,
    props: {
      resource: document.resources[contextualization.resources[0]],
      contents: [{
        node: 'text',
        text: document.resources[contextualization.resources[0]].url
      }]
    }
  };
  var noteNumber = section.notes.length + 1;
  var noteId = sectionCiteKey + '-' + noteNumber;
  section.notes.push({
    noteNumber: noteNumber,
    child: [link],
    id: noteId
  });
  node.child = [].concat(_toConsumableArray(node.child), [{
    element: 'node',
    tag: 'note',
    target: noteId
  }]);

  return document;
};

/**
 * Handle a block contextualization for static outputs
 * @param {Object} inputDocument - The representation of the peritext document to update
 * @param {Object} inputContextualization - The representation of the contextualization to resolve
 * @param {Object} settings - the specific rendering settings to use for resolving the contextualization
 * @return {Object} newDocument - the updated representation of the peritext document in which the contextualization was made
 */
var contextualizeBlockStatic = exports.contextualizeBlockStatic = function contextualizeBlockStatic(inputDocument, inputContextualization, settings) {
  var document = Object.assign({}, inputDocument);
  var contextualization = Object.assign({}, inputContextualization);
  var sectionCiteKey = contextualization.nodePath[0];
  var path = ['sections'].concat(_toConsumableArray(contextualization.nodePath.slice()));
  var node = (0, _objectPath.get)(document, path);
  var section = document.sections[sectionCiteKey];
  var figureId = void 0;
  figureId = sectionCiteKey + '-' + contextualization.citeKey;
  document.figuresCount = document.figuresCount ? document.figuresCount + 1 : 1;
  contextualization.figureId = figureId;
  contextualization.figureNumber = document.figuresCount;
  var captionContent = node.child && node.child[0] && node.child[0].child || undefined;
  var figure = {
    node: 'element',
    special: true,
    tag: _StaticWebsitePoster2.default,
    props: {
      imageKey: 'posterurl',
      resource: document.resources[contextualization.resources[0]],
      captionContent: captionContent,
      figureNumber: contextualization.figureNumber,
      id: figureId
    }
  };

  if (settings.figuresPosition === 'inline') {
    var nodeBlockIndex = path[3];
    section.contents[nodeBlockIndex] = figure;
  } else {
    section.figures = section.figures ? section.figures.concat(figure) : [figure];
  }
  document.contextualizations[contextualization.citeKey] = contextualization;
  return document;
};

/**
 * Handle an inline contextualization for dynamic outputs
 * @param {Object} inputDocument - The representation of the peritext document to update
 * @param {Object} inputContextualization - The representation of the contextualization to resolve
 * @param {Object} settings - the specific rendering settings to use for resolving the contextualization
 * @return {Object} newDocument - the updated representation of the peritext document in which the contextualization was made
 */
var contextualizeInlineDynamic = exports.contextualizeInlineDynamic = function contextualizeInlineDynamic(inputDocument, contextualization, settings) {
  return inputDocument;
};

/**
 * Handle a block contextualization for dynamic outputs
 * @param {Object} inputDocument - The representation of the peritext document to update
 * @param {Object} inputContextualization - The representation of the contextualization to resolve
 * @param {Object} settings - the specific rendering settings to use for resolving the contextualization
 * @return {Object} newDocument - the updated representation of the peritext section in which the contextualization was made
 */
var contextualizeBlockDynamic = exports.contextualizeBlockDynamic = function contextualizeBlockDynamic(inputDocument, contextualization, settings) {
  return inputDocument;
};