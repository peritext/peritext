"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Timline contextualizer that resolve sections data according to contextualization+settings params
 * @module contextualizers/timeline
 */

/**
 * Handle an inline contextualization for static outputs
 * @param {Object} inputSection - The representation of the peritext section to update
 * @param {Object} inputContextualization - The representation of the contextualization to resolve
 * @param {Object} settings - the specific rendering settings to use for resolving the contextualization
 * @return {Object} newSection - the updated representation of the peritext section in which the contextualization was made
 */
var contextualizeInlineStatic = exports.contextualizeInlineStatic = function contextualizeInlineStatic(section, contextualization, settings) {
  return Object.assign({}, section);
};

/**
 * Handle a block contextualization for static outputs
 * @param {Object} inputSection - The representation of the peritext section to update
 * @param {Object} inputContextualization - The representation of the contextualization to resolve
 * @param {Object} settings - the specific rendering settings to use for resolving the contextualization
 * @return {Object} newSection - the updated representation of the peritext section in which the contextualization was made
 */
var contextualizeBlockStatic = exports.contextualizeBlockStatic = function contextualizeBlockStatic(section, contextualization, settings) {
  return Object.assign({}, section);
};

/**
 * Handle an inline contextualization for dynamic outputs
 * @param {Object} inputSection - The representation of the peritext section to update
 * @param {Object} inputContextualization - The representation of the contextualization to resolve
 * @param {Object} settings - the specific rendering settings to use for resolving the contextualization
 * @return {Object} newSection - the updated representation of the peritext section in which the contextualization was made
 */
var contextualizeInlineDynamic = exports.contextualizeInlineDynamic = function contextualizeInlineDynamic(section, contextualization, settings) {
  return Object.assign({}, section);
};

/**
 * Handle a block contextualization for dynamic outputs
 * @param {Object} inputSection - The representation of the peritext section to update
 * @param {Object} inputContextualization - The representation of the contextualization to resolve
 * @param {Object} settings - the specific rendering settings to use for resolving the contextualization
 * @return {Object} newSection - the updated representation of the peritext section in which the contextualization was made
 */
var contextualizeBlockDynamic = exports.contextualizeBlockDynamic = function contextualizeBlockDynamic(section, contextualization, settings) {
  return Object.assign({}, section);
};