'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.contextualizeBlockDynamic = exports.contextualizeInlineDynamic = exports.contextualizeBlockStatic = exports.contextualizeInlineStatic = undefined;

var _StaticEntityInline = require('./StaticEntityInline.js');

var _StaticEntityInline2 = _interopRequireDefault(_StaticEntityInline);

var _StaticEntityBlock = require('./StaticEntityBlock.js');

var _StaticEntityBlock2 = _interopRequireDefault(_StaticEntityBlock);

var _sectionUtils = require('./../../core/utils/sectionUtils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Handle an inline contextualization for static outputs
 * @param {Object} inputSection - The representation of the peritext section to update
 * @param {Object} inputContextualization - The representation of the contextualization to resolve
 * @param {Object} settings - the specific rendering settings to use for resolving the contextualization
 * @return {Object} newSection - the updated representation of the peritext section in which the contextualization was made
 */
var contextualizeInlineStatic = exports.contextualizeInlineStatic = function contextualizeInlineStatic(inputSection, inputContextualization, settings) {
  var section = Object.assign({}, inputSection);
  var contextualization = Object.assign({}, inputContextualization);
  var node = contextualization.node;
  var sectionCiteKey = (0, _sectionUtils.getMetaValue)(section.metadata, 'general', 'citeKey');
  var entity = contextualization.resources[0];
  var contents = node.child;
  if (!contents || contents[0] && contents[0].text.trim().length === 0) {
    contents = contextualization.contextualizer.alias || entity.name || entity.firstname + ' ' + entity.lastname;
    contents = [{
      node: 'text',
      text: contents
    }];
  }
  node.props = {
    contextualization: contextualization,
    entity: entity,
    contents: contents,
    sectionCiteKey: sectionCiteKey
  };
  node.special = true;
  node.tag = _StaticEntityInline2.default;
  return Object.assign({}, inputSection);
};

/**
 * Handle a block contextualization for static outputs
 * @param {Object} inputSection - The representation of the peritext section to update
 * @param {Object} inputContextualization - The representation of the contextualization to resolve
 * @param {Object} settings - the specific rendering settings to use for resolving the contextualization
 * @return {Object} newSection - the updated representation of the peritext section in which the contextualization was made
 */
/**
 * Glossary contextualizer that resolve sections data according to contextualization+settings params
 * @module contextualizers/glossary
 */

var contextualizeBlockStatic = exports.contextualizeBlockStatic = function contextualizeBlockStatic(inputSection, inputContextualization, settings) {
  var contextualization = Object.assign({}, inputContextualization);
  var node = contextualization.node;
  var entity = contextualization.resources[0];
  node.props = {
    entity: entity,
    contextualization: contextualization,
    settings: settings
  };
  node.special = true;
  node.tag = _StaticEntityBlock2.default;
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
 * Handle a block contextualization for dynamic outputs
 * @param {Object} inputSection - The representation of the peritext section to update
 * @param {Object} inputContextualization - The representation of the contextualization to resolve
 * @param {Object} settings - the specific rendering settings to use for resolving the contextualization
 * @return {Object} newSection - the updated representation of the peritext section in which the contextualization was made
 */
var contextualizeBlockDynamic = exports.contextualizeBlockDynamic = function contextualizeBlockDynamic(section, contextualization, settings) {
  return section;
};