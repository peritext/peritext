'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.contextualizeBlockDynamic = exports.contextualizeInlineDynamic = exports.contextualizeBlockStatic = exports.contextualizeInlineStatic = undefined;

var _objectPath = require('object-path');

var _StaticImageGallery = require('./StaticImageGallery');

var _StaticImageGallery2 = _interopRequireDefault(_StaticImageGallery);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } } /**
                                                                                                                                                                                                     * Image gallery contextualizer that resolve sections data according to contextualization+settings params
                                                                                                                                                                                                     * @module contextualizers/imagegallery
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

  var nodeBlockIndex = path[3];
  var figureId = void 0;
  var number = void 0;
  var contents = node.child;
  // if figure is not there yet, add it
  if (!contextualization.sectionOpCit) {
    figureId = sectionCiteKey + '-' + contextualization.citeKey;
    contextualization.figureId = figureId;
    document.figuresCount = document.figuresCount ? document.figuresCount + 1 : 1;
    contextualization.figureNumber = document.figuresCount;
    contextualization.figureId = figureId;
    var figure = {
      node: 'element',
      special: true,
      tag: _StaticImageGallery2.default,
      props: {
        resources: contextualization.resources.map(function (key) {
          return document.resources[key];
        }),
        captionContent: [{
          node: 'text',
          text: contextualization.title || document.resources[contextualization.resources[0]].title
        }],
        figureNumber: contextualization.figureNumber,
        id: figureId
      }
    };
    number = contextualization.figureNumber;
    if (settings.figuresPosition === 'inline') {
      (function () {
        // insert contextualization block (could be refactored as an util)
        section.contents = [].concat(_toConsumableArray(section.contents.slice(0, nodeBlockIndex)), [figure], _toConsumableArray(section.contents.slice(nodeBlockIndex)));
        var newNodePath = [sectionCiteKey, 'contents', nodeBlockIndex + 1];
        document.contextualizations[contextualization.citeKey].nodePath = newNodePath;
        // update contextualizations that target subsequent contents blocks
        Object.keys(document.contextualizations).map(function (key) {
          return document.contextualizations[key];
        }).filter(function (cont) {
          return cont.nodePath.slice(0, 2).join() === newNodePath.slice(0, 2).join() && cont.nodePath[2] > nodeBlockIndex;
        }).forEach(function (cont) {
          cont.nodePath[2]++;
        });
      })();
    } else {
      section.figures = section.figures ? section.figures.concat(figure) : [figure];
    }
  } else {
    figureId = sectionCiteKey + '-' + contextualization.precursorCiteKey;
    number = document.contextualizations[contextualization.precursorCiteKey].figureNumber;
  }
  var displayId = '#peritext-figure-' + figureId;
  var newContents = [].concat(_toConsumableArray(contents.slice()), [{
    node: 'text',
    text: ' ('
  }, {
    node: 'element',
    tag: 'a',
    attr: {
      href: displayId
    },
    child: [{
      node: 'text',
      text: 'figure ' + number
    }]
  }, {
    node: 'text',
    text: ') '
  }]);
  node.tag = 'span';
  node.child = newContents;
  document.contextualizations[contextualization.citeKey] = contextualization;
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

  var nodeBlockIndex = path[3];

  var figureId = void 0;
  document.figuresCount = document.figuresCount ? document.figuresCount + 1 : 1;
  figureId = sectionCiteKey + '-' + contextualization.citeKey;
  contextualization.figureId = figureId;
  contextualization.figureNumber = document.figuresCount;
  var figure = {
    node: 'element',
    special: true,
    tag: _StaticImageGallery2.default,
    props: {
      resources: contextualization.resources.map(function (key) {
        return document.resources[key];
      }),
      captionContent: node.child[0].child,
      figureNumber: contextualization.figureNumber,
      id: figureId
    }
  };
  if (settings.figuresPosition === 'inline') {
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
 * @return {Object} newDocument - the updated representation of the peritext document in which the contextualization was made
 */
var contextualizeBlockDynamic = exports.contextualizeBlockDynamic = function contextualizeBlockDynamic(inputDocument, contextualization, settings) {
  return inputDocument;
};