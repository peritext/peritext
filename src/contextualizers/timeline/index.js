/**
 * Timline contextualizer that resolve sections data according to contextualization+settings params
 * @module contextualizers/timeline
 */

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
export const contextualizeInlineDynamic = (inputDocument, contextualization, settings) => {
  return Object.assign({}, inputDocument);
};

/**
 * Handle a block contextualization for dynamic outputs
 * @param {Object} inputDocument - The representation of the peritext document to update
 * @param {Object} inputContextualization - The representation of the contextualization to resolve
 * @param {Object} settings - the specific rendering settings to use for resolving the contextualization
 * @return {Object} newDocument - the updated representation of the peritext document in which the contextualization was made
 */
export const contextualizeBlockDynamic = (inputDocument, contextualization, settings) => {
  return Object.assign({}, inputDocument);
};
