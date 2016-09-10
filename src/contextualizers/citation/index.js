/**
 * Citation contextualizer that resolve sections data according to contextualization+settings params
 * @module contextualizers/citation
 */

import { get as getByPath } from 'object-path';

/**
 * Handle an inline contextualization for static outputs
 * @param {Object} inputDocument - The representation of the peritext document to update
 * @param {Object} inputContextualization - The representation of the contextualization to resolve
 * @param {Object} settings - the specific rendering settings to use for resolving the contextualization
 * @return {Object} newDocument - the updated representation of the peritext document in which the contextualization was made
 */
export const contextualizeInlineStatic = (inputDocument, inputContextualization, settings) => {
  const formatter = require('./../../referencers/' + settings.citationStyle + '.js');
  const document = Object.assign({}, inputDocument);
  const contextualization = Object.assign({}, inputContextualization);
  const path = ['sections', ...contextualization.nodePath.slice()];
  const node = getByPath(document, path);

  const props = {
    contextualization,
    resource: document.resources[contextualization.resources[0]],
    ibid: contextualization.sectionIbid,
    opCit: contextualization.sectionOpCit
  };
  // citation text --> wrap in span > q + citation
  if (node.child) {
    const citation = {
      node: 'element',
      special: true,
      tag: formatter.InlineCitation,
      props
    };
    const child = node.child.slice();
    const quote = {
      attr: {
        class: 'peritext-quote-container',
        id: contextualization.citeKey
      },
      node: 'element',
      tag: 'q',
      child
    };
    node.node = 'element';
    node.tag = 'span';
    node.child = [
      quote,
      {
        node: 'text',
        text: ' ('
      },
      citation,
      {
        node: 'text',
        text: ')'
      }
    ];
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
export const contextualizeBlockStatic = (inputDocument, inputContextualization, settings) => {
  const formatter = require('./../../referencers/' + settings.citationStyle + '.js');
  const document = Object.assign({}, inputDocument);
  const contextualization = Object.assign({}, inputContextualization);
  const path = ['sections', ...contextualization.nodePath.slice()];
  const node = getByPath(document, path);

  const props = {
    contextualization,
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
export const contextualizeInlineDynamic = (inputDocument, contextualization, settings) => {
  return inputDocument;
};

/**
 * Handle an block contextualization for dynamic outputs
 * @param {Object} inputDocument - The representation of the peritext document to update
 * @param {Object} inputContextualization - The representation of the contextualization to resolve
 * @param {Object} settings - the specific rendering settings to use for resolving the contextualization
 * @return {Object} newDocument - the updated representation of the peritext document in which the contextualization was made
 */
export const contextualizeBlockDynamic = (inputDocument, contextualization, settings) => {
  return inputDocument;
};
