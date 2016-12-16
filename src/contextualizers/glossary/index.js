/**
 * Glossary contextualizer that resolve sections data according to contextualization+settings params
 * @module contextualizers/glossary
 */
import { get as getByPath } from 'object-path';

// import StaticEntityInline from './StaticEntityInline';
// import StaticEntityBlock from './StaticEntityBlock';

/**
 * Handle an inline contextualization for static outputs
 * @param {Object} inputDocument - The representation of the peritext document to update
 * @param {Object} inputContextualization - The representation of the contextualization to resolve
 * @param {Object} settings - the specific rendering settings to use for resolving the contextualization
 * @return {Object} newDocument - the updated representation of the peritext document in which the contextualization was made
 */
export const contextualizeInlineStatic = (inputDocument, inputContextualization, settings) => {
  const document = Object.assign({}, inputDocument);
  const contextualization = Object.assign({}, inputContextualization);
  const sectionId = contextualization.nodePath[0];
  const path = ['sections', ...contextualization.nodePath.slice()];
  const node = getByPath(document, path);
  const entity = document.resources[contextualization.resources[0]];
  let contents = node.children;
  if (!contents || (contents[0] && contents[0].text.trim().length === 0)) {
    contents = document.contextualizers[contextualization.contextualizer].alias
              || entity.name
              || entity.firstname + ' ' + entity.lastname;
    contents = [{
      node: 'text',
      text: contents
    }];
  }
  node.props = {
    contextualization,
    entity,
    contents,
    sectionId
  };
  node.special = true;
  node.tag = 'StaticEntityInline';
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
  const document = Object.assign({}, inputDocument);
  const contextualization = Object.assign({}, inputContextualization);
  const path = ['sections', ...contextualization.nodePath.slice()];
  const node = getByPath(document, path);
  const entity = contextualization.resources[0];
  node.props = {
    entity,
    contextualization,
    settings
  };
  node.special = true;
  node.tag = 'StaticEntityBlock';
  return document;
};

/**
 * Handle an inline contextualization for dynamic outputs
 * @param {Object} inputDocument - The representation of the peritext document to update
 * @param {Object} inputContextualization - The representation of the contextualization to resolve
 * @param {Object} settings - the specific rendering settings to use for resolving the contextualization
 * @return {Object} newDocument - the updated representation of the peritext document in which the contextualization was made
 */
export const contextualizeInlineDynamic = contextualizeInlineStatic;
// export const contextualizeInlineDynamic = (inputDocument, contextualization, settings) => {
//   return inputDocument;
// };

/**
 * Handle a block contextualization for dynamic outputs
 * @param {Object} inputDocument - The representation of the peritext document to update
 * @param {Object} inputContextualization - The representation of the contextualization to resolve
 * @param {Object} settings - the specific rendering settings to use for resolving the contextualization
 * @return {Object} newDocument - the updated representation of the peritext document in which the contextualization was made
 */
export const contextualizeBlockDynamic = contextualizeBlockStatic;
// export const contextualizeBlockDynamic = (inputDocument, contextualization, settings) => {
//   return inputDocument;
// };
