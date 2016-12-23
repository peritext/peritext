/**
 * Timline contextualizer that resolve sections data according to contextualization+settings params
 * @module contextualizers/timeline
 */

 import { get as getByPath } from 'object-path';


/**
 * Handle an inline contextualization for static outputs
 * @param {Object} inputSection - The representation of the peritext section to update
 * @param {Object} inputContextualization - The representation of the contextualization to resolve
 * @param {Object} settings - the specific rendering settings to use for resolving the contextualization
 * @return {Object} newDocument - the updated representation of the peritext document in which the contextualization was made
 */
export const contextualizeInlineStatic = (inputDocument, contextualization, settings) => {
  return Object.assign({}, inputDocument);
};

/**
 * Handle a block contextualization for static outputs
 * @param {Object} inputDocument - The representation of the peritext document to update
 * @param {Object} inputContextualization - The representation of the contextualization to resolve
 * @param {Object} settings - the specific rendering settings to use for resolving the contextualization
 * @return {Object} newDocument - the updated representation of the peritext document in which the contextualization was made
 */
export const contextualizeBlockStatic = (inputDocument, contextualization, settings) => {
  return Object.assign({}, inputDocument);
};

/**
 * Handle an inline contextualization for dynamic outputs
 * @param {Object} inputDocument - The representation of the peritext document to update
 * @param {Object} inputContextualization - The representation of the contextualization to resolve
 * @param {Object} settings - the specific rendering settings to use for resolving the contextualization
 * @return {Object} newDocument - the updated representation of the peritext document in which the contextualization was made
 */
export const contextualizeInlineDynamic = (inputDocument, inputContextualization, settings) => {
  const document = Object.assign({}, inputDocument);
  const contextualization = Object.assign({}, inputContextualization);
  const sectionId = contextualization.nodePath[0];
  const path = ['sections', ...contextualization.nodePath.slice()];
  const node = getByPath(document, path);
  const section = document.sections[sectionId];
  section[path[2]][path[3]] = node;
  return document;
};

/**
 * Handle a block contextualization for dynamic outputs
 * @param {Object} inputDocument - The representation of the peritext document to update
 * @param {Object} inputContextualization - The representation of the contextualization to resolve
 * @param {Object} settings - the specific rendering settings to use for resolving the contextualization
 * @return {Object} newDocument - the updated representation of the peritext document in which the contextualization was made
 */
export const contextualizeBlockDynamic = (inputDocument, inputContextualization, settings) => {
  const document = Object.assign({}, inputDocument);
  const contextualization = Object.assign({}, inputContextualization);
  const sectionId = contextualization.nodePath[0];
  const path = ['sections', ...contextualization.nodePath.slice()];
  const node = getByPath(document, path);
  const section = document.sections[sectionId];
  section[path[2]][path[3]] = node;
  return document;
};
