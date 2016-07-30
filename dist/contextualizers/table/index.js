'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.contextualizeBlockDynamic = exports.contextualizeInlineDynamic = exports.contextualizeBlockStatic = exports.contextualizeInlineStatic = undefined;

var _StaticTable = require('./StaticTable.js');

var _StaticTable2 = _interopRequireDefault(_StaticTable);

var _sectionUtils = require('./../../core/utils/sectionUtils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var contextualizeInlineStatic = exports.contextualizeInlineStatic = function contextualizeInlineStatic(inputSection, inputContextualization, settings) {
  var section = Object.assign({}, inputSection);
  var contextualization = Object.assign({}, inputContextualization);
  var citeKey = (0, _sectionUtils.getMetaValue)(section.metadata, 'general', 'citeKey');
  var data = section.data[contextualization.resources[0].citeKey];
  var node = contextualization.node;
  var blockIndex = node.blockIndex;
  var figureId = void 0;
  var number = void 0;
  var contents = node.child;
  // figure is not there yet, add it
  if (!contextualization.sectionOpCit) {
    section.figuresCount++;
    figureId = citeKey + '-' + contextualization.citeKey;
    contextualization.figureId = figureId;
    contextualization.figureNumber = section.figuresCount;
    var figure = {
      node: 'element',
      special: true,
      tag: _StaticTable2.default,
      props: {
        resources: contextualization.resources,
        data: data,
        captionContent: [{
          node: 'text',
          text: contextualization.title || contextualization.resources[0].title
        }],
        figureNumber: contextualization.figureNumber,
        id: figureId
      }
    };
    number = contextualization.figureNumber;
    if (settings.figuresPosition === 'inline') {
      section.contents.splice(blockIndex + section.figuresCount, 0, figure);
    } else {
      section.figures = section.figures ? section.figures.concat(figure) : [figure];
    }
  } else {
    figureId = citeKey + '-' + contextualization.precursorCiteKey;
    section.contextualizations.some(function (cont) {
      if (cont.citeKey === contextualization.precursorCiteKey) {
        number = cont.figureNumber;
        return true;
      }
    });
  }
  var displayId = '#peritext-figure-' + figureId;
  var newContents = [].concat(_toConsumableArray(contents.slice()), [{
    node: 'text',
    text: ' ('
  }, {
    node: 'element',
    tag: 'a',
    attr: {
      href: displayId
    },
    child: [{
      node: 'text',
      text: 'figure ' + number
    }]
  }, {
    node: 'text',
    text: ') '
  }]);
  node.tag = 'span';
  node.child = newContents;
  section.contextualizations = section.contextualizations.map(function (cont) {
    if (cont.citeKey === contextualization.citeKey) {
      return contextualization;
    }
    return cont;
  });
  return Object.assign({}, section);
};

var contextualizeBlockStatic = exports.contextualizeBlockStatic = function contextualizeBlockStatic(inputSection, inputContextualization, settings) {
  return Object.assign({}, inputSection);
};

var contextualizeInlineDynamic = exports.contextualizeInlineDynamic = function contextualizeInlineDynamic(inputSection, inputContextualization, settings) {
  return Object.assign({}, inputSection);
};

var contextualizeBlockDynamic = exports.contextualizeBlockDynamic = function contextualizeBlockDynamic(inputSection, inputContextualization, settings) {
  return Object.assign({}, inputSection);
};