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

var contextualizeInlineDynamic = exports.contextualizeInlineDynamic = function contextualizeInlineDynamic(section, contextualization, settings) {
  return section;
};

var contextualizeBlockDynamic = exports.contextualizeBlockDynamic = function contextualizeBlockDynamic(section, contextualization, settings) {
  return section;
};