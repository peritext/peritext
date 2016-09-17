'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.markdownToJsAbstraction = undefined;

var _marked = require('marked');

var _marked2 = _interopRequireDefault(_marked);

var _uuid = require('uuid');

var _html2json = require('html2json');

var _htmlEntities = require('html-entities');

var _bibTexConverter = require('./bibTexConverter');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } } /**
                                                                                                                                                                                                     * This module resolves markdown contents + peritext-specific assertions (notes, contextualizations, contextualizers)
                                                                                                                                                                                                     * It returns a representation of a section's content as an object containing arrays of: DOM children as js representation, notes, contextualizations, contextualizers
                                                                                                                                                                                                     * @module converters/markdownConverter
                                                                                                                                                                                                     */


var entities = new _htmlEntities.XmlEntities();


// basic marked parser settings
_marked2.default.setOptions({
  renderer: new _marked2.default.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: true,
  smartLists: true,
  smartypants: false
});

var eatParamsObject = function eatParamsObject(str) {
  var index = 0;
  var wrappingLevel = 0;
  var paramsObject = '';
  var inObject = false;
  var ch = void 0;
  while (index < str.length) {
    ch = str.charAt(index);
    if (ch === '{') {
      wrappingLevel++;
    } else if (ch === '}') {
      wrappingLevel--;
    }

    if (!inObject && wrappingLevel > 0) {
      inObject = true;
      paramsObject += ch;
    } else if (inObject && wrappingLevel === 0) {
      paramsObject += ch;
      return paramsObject;
    } else if (inObject) {
      paramsObject += ch;
      // not in object, character is neither a wrapper nor a whitespace, leave
    } else if (!inObject && ch.match(/([\s])/) === null) {
        return undefined;
      }
    index++;
  }
  return undefined;
};

var parseParamsObject = function parseParamsObject(paramsObject) {
  /*
   * analyse contextualizer statement
  */
  var overloading = void 0;
  var contextualizerKey = void 0;
  // case : explicit call to a contextualizer ==> explicit contextualizer overload case
  if (paramsObject && paramsObject.indexOf('@') === 1) {
    contextualizerKey = paramsObject.match(/^\{(@[^,}]+)/)[1];
    overloading = contextualizerKey;
  }
  // else case : no explicit call to a contextualizer ==> inline implicit contextualization, determine id automatically
  contextualizerKey = 'contextualization-' + (0, _uuid.v4)();

  var formattedParams = void 0;
  if (paramsObject !== undefined) {
    formattedParams = (0, _bibTexConverter.parseBibContextualization)(paramsObject);
    var emptyParams = JSON.stringify(formattedParams).length <= 2;
    // not empty = params present, so inline (implicit new contextualizer, or contextualizer overloading)
    if (!emptyParams) {
      formattedParams.describedInline = true;
      // case : no additionnal params ==> no parameters
    } else {
        formattedParams = {};
      }
    // case : no mention of a contextualizer fully implicit contextualizer (no contextualizer specified)
  } else {
      formattedParams = {};
      formattedParams.describedInline = true;
      formattedParams.fullyImplicit = true;
    }
  // case : a contextualizer has been mentionned, with additionnal contextualization params --> contextualizer overloading
  if (overloading) {
    formattedParams.overloading = overloading;
  }
  formattedParams.id = contextualizerKey;
  return formattedParams;
};

var parseContextualizations = function parseContextualizations(section) {
  var replaced = section.contents;
  var contextualizations = {};
  var newContextualizers = {};
  var orderedContextualizations = [];
  var statementsRE = /(\!)?\[([^\]]*)\]\(([^\)]+)\)/g;
  var match = void 0;
  var type = void 0;
  var resources = void 0;
  var paramsObject = void 0;

  while ((match = statementsRE.exec(replaced)) !== null) {
    /*
     * retrieve data from markdown expressions
     */
    // hyperlink markdown syntax stands for inline contextualization
    // image markdown syntax stands for block contextualization
    // ()[] => inline, !()[] => block
    type = match[1] ? 'block' : 'inline';
    // contents
    // quoted resources
    resources = match[3].split(',').map(function (resKey) {
      return resKey.substr(1);
    });
    var contextualizationId = 'contextualization-' + (0, _uuid.v4)();
    // following parameters
    paramsObject = eatParamsObject(replaced.substr(match.index + match[0].length));
    // UPDATE TEXT
    // delete paramsObject from text
    if (paramsObject) {
      replaced = replaced.replace(replaced.substring(match.index + match[0].length, match.index + match[0].length + paramsObject.length), '');
    }
    // update reference in <a> link or <image>
    replaced = replaced.replace(replaced.substring(match.index + match[0].indexOf(match[3]), match.index + match[0].indexOf(match[3]) + match[3].length), contextualizationId);
    // UPDATE DATA
    var contextualizer = parseParamsObject(paramsObject);
    if (contextualizer) {
      newContextualizers[contextualizer.id] = contextualizer;
    }
    contextualizations[contextualizationId] = {
      'id': contextualizationId,
      contextualizer: contextualizer.id,
      resources: resources,
      type: type
    };
    orderedContextualizations.push(contextualizationId);
  }
  return { md: replaced, orderedContextualizations: orderedContextualizations, contextualizations: contextualizations, contextualizers: newContextualizers };
};

// this module does not use a regex-based method
// because it must catch possible nested content-related "{" brackets symbols
// e.g. : this is an {example inside brackets}
var parseNotes = function parseNotes(md, sectionId) {
  var notes = [];
  var noteNumber = 1;
  var index = 0;
  var displace = 0;
  var beginIndex = void 0;
  var nestingLevel = 0;
  var ch = void 0;
  var newMd = md;
  var noteContent = void 0;
  while (newMd.substr(displace).indexOf('[^]{') > -1) {
    index = displace + newMd.substring(displace).indexOf('[^]{') + 4;
    beginIndex = index;
    nestingLevel = 1;

    while (index < newMd.length && nestingLevel > 0) {
      ch = newMd.charAt(index);
      if (ch === '{') {
        nestingLevel++;
      } else if (ch === '}') {
        nestingLevel--;
      }
      index++;
    }

    noteContent = newMd.substring(beginIndex, index - 1);
    var id = 'note-' + sectionId + '-' + (0, _uuid.v4)(); // noteNumber;
    var placeholder = '[footnote](note_' + id + ')';
    var initialLength = index - beginIndex + 4;
    var lengthDif = initialLength - placeholder.length;
    newMd = newMd.replace(newMd.substring(beginIndex - 4, index), placeholder);
    notes.push({
      noteNumber: noteNumber,
      markdownContents: noteContent,
      id: id
    });
    noteNumber++;
    displace = index - lengthDif;
  }
  return {
    notes: notes,
    newMd: newMd
  };
};
// for recursivity matter
var _mapMdJsonToPJson = function mapMdJsonToPJson() {
  return undefined;
};
var representContents = function representContents() {
  return undefined;
};

_mapMdJsonToPJson = function mapMdJsonToPJson(inputElement, contextualizations, elementPath) {
  var element = Object.assign({}, inputElement);
  if (element.text) {
    element.text = entities.decode(element.text);
  }
  if (element.tag === 'a') {
    if (element.attr.href.indexOf('note_') === 0) {
      element.tag = 'note';
      element.target = element.attr.href.substr(5);
      // case of an inline contextualization
    } else {
        element.tag = 'inlineC';
        var contextualizationId = element.attr.href;
        var contextualization = contextualizations[contextualizationId];
        contextualization.nodePath = elementPath;
      }
    // case of a block contextualization
  } else if (element.tag === 'img') {
      element.tag = 'blockC';
      var _contextualizationId = element.attr.src;
      var _contextualization = contextualizations[_contextualizationId];
      _contextualization.nodePath = elementPath;
      var contents = element.attr && element.attr.alt ? element.attr.alt.join(' ') : '';
      element.child = [representContents(contents, contextualizations, elementPath)[0]];
      delete element.attr;
    }
  if (element.child) {
    element.child = element.child.map(function (child, elementIndex) {
      return _mapMdJsonToPJson(child, contextualizations, elementPath.concat(['child', elementIndex]));
    });
  }
  return element;
};

representContents = function representContents(mdContent, contextualizations, elementPath) {
  return (0, _html2json.html2json)((0, _marked2.default)(mdContent)).child.map(function (child, blockIndex) {
    return _mapMdJsonToPJson(child, contextualizations, elementPath.concat(blockIndex));
  });
};

/**
 * Parses markdown contents in order to update section data with new contents (as a pseudo-DOM nested javascript object representation), notes, contextualizers and contextualizations
 * @param {Object} section - the section to parse
 * @param {Object} parameters - deprecated - rendering parameters (not used at this step)
 * @return {errors: array, section: Object} - the resulting conversion errors and updated section
 */
var markdownToJsAbstraction = exports.markdownToJsAbstraction = function markdownToJsAbstraction(section, parameters) {
  var errors = [];

  var sectionId = section.metadata.general.id.value;
  // save original markdown expression of contents (for further possible serializing)
  section.markdownContents = section.contents;
  // first extract contextualizations statements

  var _parseContextualizati = parseContextualizations(section);

  var md = _parseContextualizati.md;
  var contextualizers = _parseContextualizati.contextualizers;
  var orderedContextualizations = _parseContextualizati.orderedContextualizations;
  var contextualizations = _parseContextualizati.contextualizations;
  // then extract notes statements

  var _parseNotes = parseNotes(md, sectionId);

  var notes = _parseNotes.notes;
  var newMd = _parseNotes.newMd;

  section.contextualizations = orderedContextualizations;
  // convert cleaned markdown contents to js representation
  section.contents = representContents(newMd, contextualizations, [sectionId, 'contents']);
  section.notes = notes.map(function (note, noteIndex) {

    var contents = (0, _html2json.html2json)((0, _marked2.default)(note.markdownContents)).child.map(function (child, blockIndex) {
      return _mapMdJsonToPJson(child, contextualizations, [sectionId, 'notes', noteIndex]);
    });
    return Object.assign(note, {
      child: [
      // this is dirty, done for matching contextualization nodePath which is displaced otherwise
      // other dirty solution : handle that in mapMdJsonToPJson with a path check
      // (if in notes prop => decrement contextualization target)
      { node: 'text',
        text: ''
      }].concat(_toConsumableArray(contents[0].child))
    });
  });
  return { errors: errors, section: section, contextualizers: contextualizers, contextualizations: contextualizations };
};