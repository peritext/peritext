'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Citation contextualizer that resolve sections data according to contextualization+settings params
 * @module contextualizers/citation
 */

/**
 * Handle an inline contextualization for static outputs
 * @param {Object} inputSection - The representation of the peritext section to update
 * @param {Object} inputContextualization - The representation of the contextualization to resolve
 * @param {Object} settings - the specific rendering settings to use for resolving the contextualization
 * @return {Object} newSection - the updated representation of the peritext section in which the contextualization was made
 */
var contextualizeInlineStatic = exports.contextualizeInlineStatic = function contextualizeInlineStatic(inputSection, inputContextualization, settings) {
  var contextualization = Object.assign({}, inputContextualization);
  var formatter = require('./../../referencers/' + settings.citationStyle + '.js');
  var node = contextualization.node;
  var props = {
    contextualization: contextualization,
    resource: contextualization.resources[0],
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
    node.tag = formatter.InlineCitation;
    node.props = props;
  }
  return Object.assign({}, inputSection);
};

/**
 * Handle a block contextualization for static outputs
 * @param {Object} inputSection - The representation of the peritext section to update
 * @param {Object} inputContextualization - The representation of the contextualization to resolve
 * @param {Object} settings - the specific rendering settings to use for resolving the contextualization
 * @return {Object} newSection - the updated representation of the peritext section in which the contextualization was made
 */
var contextualizeBlockStatic = exports.contextualizeBlockStatic = function contextualizeBlockStatic(inputSection, inputContextualization, settings) {
  var contextualization = Object.assign({}, inputContextualization);
  var formatter = require('./../../referencers/' + settings.citationStyle + '.js');
  var node = contextualization.node;
  var props = {
    contextualization: contextualization,
    resource: contextualization.resources[0],
    ibid: contextualization.sectionIbid,
    opCit: contextualization.sectionOpCit
  };
  node.special = true;
  node.tag = formatter.BlockCitation;
  node.props = props;
  return Object.assign({}, inputSection);
};

/**
 * Handle an inline contextualization for dynamic outputs
 * @param {Object} inputSection - The representation of the peritext section to update
 * @param {Object} inputContextualization - The representation of the contextualization to resolve
 * @param {Object} settings - the specific rendering settings to use for resolving the contextualization
 * @return {Object} newSection - the updated representation of the peritext section in which the contextualization was made
 */
var contextualizeInlineDynamic = exports.contextualizeInlineDynamic = function contextualizeInlineDynamic(section, contextualization, settings) {
  return section;
};

/**
 * Handle an block contextualization for dynamic outputs
 * @param {Object} inputSection - The representation of the peritext section to update
 * @param {Object} inputContextualization - The representation of the contextualization to resolve
 * @param {Object} settings - the specific rendering settings to use for resolving the contextualization
 * @return {Object} newSection - the updated representation of the peritext section in which the contextualization was made
 */
var contextualizeBlockDynamic = exports.contextualizeBlockDynamic = function contextualizeBlockDynamic(section, contextualization, settings) {
  return section;
};