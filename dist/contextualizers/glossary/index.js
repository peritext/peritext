'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.contextualizeBlockDynamic = exports.contextualizeInlineDynamic = exports.contextualizeBlockStatic = exports.contextualizeInlineStatic = undefined;

var _objectPath = require('object-path');

var _StaticEntityInline = require('./StaticEntityInline');

var _StaticEntityInline2 = _interopRequireDefault(_StaticEntityInline);

var _StaticEntityBlock = require('./StaticEntityBlock');

var _StaticEntityBlock2 = _interopRequireDefault(_StaticEntityBlock);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } } /**
                                                                                                                                                                                                     * Glossary contextualizer that resolve sections data according to contextualization+settings params
                                                                                                                                                                                                     * @module contextualizers/glossary
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
  var sectionId = contextualization.nodePath[0];
  var path = ['sections'].concat(_toConsumableArray(contextualization.nodePath.slice()));
  var node = (0, _objectPath.get)(document, path);
  var entity = document.resources[contextualization.resources[0]];
  var contents = node.children;
  if (!contents || contents[0] && contents[0].text.trim().length === 0) {
    contents = document.contextualizers[contextualization.contextualizer].alias || entity.name || entity.firstname + ' ' + entity.lastname;
    contents = [{
      node: 'text',
      text: contents
    }];
  }
  node.props = {
    contextualization: contextualization,
    entity: entity,
    contents: contents,
    sectionId: sectionId
  };
  node.special = true;
  node.tag = _StaticEntityInline2.default;
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
  var path = ['sections'].concat(_toConsumableArray(contextualization.nodePath.slice()));
  var node = (0, _objectPath.get)(document, path);
  var entity = contextualization.resources[0];
  node.props = {
    entity: entity,
    contextualization: contextualization,
    settings: settings
  };
  node.special = true;
  node.tag = _StaticEntityBlock2.default;
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