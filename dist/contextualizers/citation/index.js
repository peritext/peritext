'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.contextualizeBlockDynamic = exports.contextualizeInlineDynamic = exports.contextualizeBlockStatic = exports.contextualizeInlineStatic = undefined;

var _objectPath = require('object-path');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } } /**
                                                                                                                                                                                                     * Citation contextualizer that resolve sections data according to contextualization+settings params
                                                                                                                                                                                                     * @module contextualizers/citation
                                                                                                                                                                                                     */

/**
 * Handle an inline contextualization for static outputs
 * @param {Object} inputDocument - The representation of the peritext document to update
 * @param {Object} inputContextualization - The representation of the contextualization to resolve
 * @param {Object} settings - the specific rendering settings to use for resolving the contextualization
 * @return {Object} newDocument - the updated representation of the peritext document in which the contextualization was made
 */
var contextualizeInlineStatic = exports.contextualizeInlineStatic = function contextualizeInlineStatic(inputDocument, inputContextualization, settings) {
  var formatter = require('./../../referencers/' + settings.citationStyle + '.js');
  var document = Object.assign({}, inputDocument);
  var contextualization = Object.assign({}, inputContextualization);
  var path = ['sections'].concat(_toConsumableArray(contextualization.nodePath.slice()));
  var node = (0, _objectPath.get)(document, path);

  var props = {
    contextualization: contextualization,
    resource: document.resources[contextualization.resources[0]],
    ibid: contextualization.sectionIbid,
    opCit: contextualization.sectionOpCit
  };
  // citation text --> wrap in span > q + citation
  if (node.child) {
    var citation = {
      node: 'element',
      special: true,
      tag: formatter.InlineCitation,
      props: props
    };
    var child = node.child.slice();
    var quote = {
      attr: {
        class: 'peritext-quote-container',
        id: contextualization.citeKey
      },
      node: 'element',
      tag: 'q',
      child: child
    };
    node.node = 'element';
    node.tag = 'span';
    node.child = [quote, {
      node: 'text',
      text: ' ('
    }, citation, {
      node: 'text',
      text: ')'
    }];
  } else {
    node.special = true;
    node.node = 'element';
    node.tag = formatter.InlineCitation;
    node.props = props;
  }
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
  var formatter = require('./../../referencers/' + settings.citationStyle + '.js');
  var document = Object.assign({}, inputDocument);
  var contextualization = Object.assign({}, inputContextualization);
  var path = ['sections'].concat(_toConsumableArray(contextualization.nodePath.slice()));
  var node = (0, _objectPath.get)(document, path);

  var props = {
    contextualization: contextualization,
    resource: contextualization.resources[0],
    ibid: contextualization.sectionIbid,
    opCit: contextualization.sectionOpCit
  };
  node.special = true;
  node.tag = formatter.BlockCitation;
  node.props = props;

  return document;
};

/**
 * Handle an inline contextualization for dynamic outputs
 * @param {Object} inputDocument - The representation of the peritext section to update
 * @param {Object} inputContextualization - The representation of the contextualization to resolve
 * @param {Object} settings - the specific rendering settings to use for resolving the contextualization
 * @return {Object} newDocument - the updated representation of the peritext document in which the contextualization was made
 */
var contextualizeInlineDynamic = exports.contextualizeInlineDynamic = contextualizeInlineStatic; /*(inputDocument, contextualization, settings) => {
                                                                                                 return inputDocument;
                                                                                                 }*/

/**
 * Handle an block contextualization for dynamic outputs
 * @param {Object} inputDocument - The representation of the peritext document to update
 * @param {Object} inputContextualization - The representation of the contextualization to resolve
 * @param {Object} settings - the specific rendering settings to use for resolving the contextualization
 * @return {Object} newDocument - the updated representation of the peritext document in which the contextualization was made
 */
var contextualizeBlockDynamic = exports.contextualizeBlockDynamic = contextualizeBlockStatic; /* (inputDocument, contextualization, settings) => {
                                                                                              return inputDocument;
                                                                                              };
                                                                                              */