'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.contextualizeBlockDynamic = exports.contextualizeInlineDynamic = exports.contextualizeBlockStatic = exports.contextualizeInlineStatic = undefined;

var _components = require('./../../core/components');

var _StaticWebsitePoster = require('./StaticWebsitePoster.js');

var _StaticWebsitePoster2 = _interopRequireDefault(_StaticWebsitePoster);

var _sectionUtils = require('./../../core/utils/sectionUtils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var contextualizeInlineStatic = exports.contextualizeInlineStatic = function contextualizeInlineStatic(inputSection, inputContextualization, settings) {
  var section = Object.assign({}, inputSection);
  var contextualization = Object.assign({}, inputContextualization);
  var citeKey = (0, _sectionUtils.getMetaValue)(section.metadata, 'general', 'citeKey');
  var node = contextualization.node;
  var link = {
    node: 'element',
    tag: _components.StructuredHyperLink,
    special: true,
    props: {
      resource: contextualization.resources[0],
      contents: [{
        node: 'text',
        text: contextualization.resources[0].url
      }]
    }
  };
  var noteNumber = section.notes.length + 1;
  var noteId = citeKey + noteNumber;
  section.notes.push({
    noteNumber: noteNumber,
    contents: [link],
    id: noteId
  });
  node.child = [].concat(_toConsumableArray(node.child), [{
    element: 'node',
    tag: 'note',
    target: noteId
  }]);

  return Object.assign({}, section);
};

var contextualizeBlockStatic = exports.contextualizeBlockStatic = function contextualizeBlockStatic(inputSection, inputContextualization, settings) {
  var section = Object.assign({}, inputSection);
  var contextualization = Object.assign({}, inputContextualization);
  var citeKey = (0, _sectionUtils.getMetaValue)(section.metadata, 'general', 'citeKey');
  var node = contextualization.node;
  var blockIndex = node.blockIndex;
  var figureId = void 0;
  section.figuresCount++;
  figureId = citeKey + '-' + contextualization.citeKey;
  contextualization.figureId = figureId;
  contextualization.figureNumber = section.figuresCount;
  var figure = {
    node: 'element',
    special: true,
    tag: _StaticWebsitePoster2.default,
    props: {
      imageKey: 'posterurl',
      resource: contextualization.resources[0],
      captionContent: node.child[0].child,
      figureNumber: contextualization.figureNumber,
      id: figureId
    }
  };

  if (settings.figuresPosition === 'inline') {
    section.contents[blockIndex + section.figuresCount - 1] = figure;
  } else {
    section.figures = section.figures ? section.figures.concat(figure) : [figure];
  }
  section.contextualizations = section.contextualizations.map(function (cont) {
    if (cont.citeKey === contextualization.citeKey) {
      return contextualization;
    }
    return cont;
  });
  return Object.assign({}, section);
};

var contextualizeInlineDynamic = exports.contextualizeInlineDynamic = function contextualizeInlineDynamic(section, contextualization, settings) {
  return section;
};

var contextualizeBlockDynamic = exports.contextualizeBlockDynamic = function contextualizeBlockDynamic(section, contextualization, settings) {
  return section;
};