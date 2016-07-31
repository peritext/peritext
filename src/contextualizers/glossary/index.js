/**
 * Glossary contextualizer that resolve sections data according to contextualization+settings params
 * @module contextualizers/glossary
 */

import StaticEntityInline from './StaticEntityInline.js';
import StaticEntityBlock from './StaticEntityBlock.js';
import {getMetaValue} from './../../core/utils/sectionUtils';

/**
 * Handle an inline contextualization for static outputs
 * @param {Object} inputSection - The representation of the peritext section to update
 * @param {Object} inputContextualization - The representation of the contextualization to resolve
 * @param {Object} settings - the specific rendering settings to use for resolving the contextualization
 * @return {Object} newSection - the updated representation of the peritext section in which the contextualization was made
 */
export const contextualizeInlineStatic = (inputSection, inputContextualization, settings) => {
  const section = Object.assign({}, inputSection);
  const contextualization = Object.assign({}, inputContextualization);
  const node = contextualization.node;
  const sectionCiteKey = getMetaValue(section.metadata, 'general', 'citeKey');
  const entity = contextualization.resources[0];
  let contents = node.child;
  if (!contents || (contents[0] && contents[0].text.trim().length === 0)) {
    contents = contextualization.contextualizer.alias || entity.name || entity.firstname + ' ' + entity.lastname;
    contents = [{
      node: 'text',
      text: contents
    }];
  }
  node.props = {
    contextualization,
    entity,
    contents,
    sectionCiteKey
  };
  node.special = true;
  node.tag = StaticEntityInline;
  return Object.assign({}, inputSection);
};

/**
 * Handle a block contextualization for static outputs
 * @param {Object} inputSection - The representation of the peritext section to update
 * @param {Object} inputContextualization - The representation of the contextualization to resolve
 * @param {Object} settings - the specific rendering settings to use for resolving the contextualization
 * @return {Object} newSection - the updated representation of the peritext section in which the contextualization was made
 */
export const contextualizeBlockStatic = (inputSection, inputContextualization, settings) => {
  const contextualization = Object.assign({}, inputContextualization);
  const node = contextualization.node;
  const entity = contextualization.resources[0];
  node.props = {
    entity,
    contextualization,
    settings
  };
  node.special = true;
  node.tag = StaticEntityBlock;
  return Object.assign({}, inputSection);
};

/**
 * Handle an inline contextualization for dynamic outputs
 * @param {Object} inputSection - The representation of the peritext section to update
 * @param {Object} inputContextualization - The representation of the contextualization to resolve
 * @param {Object} settings - the specific rendering settings to use for resolving the contextualization
 * @return {Object} newSection - the updated representation of the peritext section in which the contextualization was made
 */
export const contextualizeInlineDynamic = (section, contextualization, settings) => {
  return section;
};

/**
 * Handle a block contextualization for dynamic outputs
 * @param {Object} inputSection - The representation of the peritext section to update
 * @param {Object} inputContextualization - The representation of the contextualization to resolve
 * @param {Object} settings - the specific rendering settings to use for resolving the contextualization
 * @return {Object} newSection - the updated representation of the peritext section in which the contextualization was made
 */
export const contextualizeBlockDynamic = (section, contextualization, settings) => {
  return section;
};
