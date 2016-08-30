'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.markdownToJsAbstraction = undefined;

var _marked = require('marked');

var _marked2 = _interopRequireDefault(_marked);

var _html2json = require('html2json');

var _htmlEntities = require('html-entities');

var _sectionUtils = require('./../../utils/sectionUtils');

var _bibTexConverter = require('./../bibTexConverter');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var entities = new _htmlEntities.XmlEntities(); /**
                                                 * This module resolves markdown contents + peritext-specific assertions (notes, contextualizations, contextualizers)
                                                 * It returns a representation of a section's content as an object containing arrays of: DOM children as js representation, notes, contextualizations, contextualizers
                                                 * @module converters/markdownConverter
                                                 */


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

var parseParamsObject = function parseParamsObject(paramsObject, impliedResources, contextualizationCount, contextualizers) {
  /*
   * analyse contextualizer statement
  */
  var overloading = void 0;
  var contextualizerKey = void 0;
  // case : explicit call to a contextualizer ==> overload
  if (paramsObject && paramsObject.indexOf('@') === 1) {
    (function () {
      contextualizerKey = paramsObject.match(/^\{(@[^,}]+)/)[1];
      overloading = contextualizerKey;
      var counter = 1;
      var newKey = contextualizerKey + '_' + counter;
      var unique = false;
      // getting a unique citeKey for the overloaded contextualizer
      while (!unique) {
        unique = true;
        contextualizers.forEach(function (cont) {
          if (cont.citeKey === newKey) {
            unique = false;
            counter++;
            newKey = contextualizerKey + '_' + counter;
          }
        });
      }
      contextualizerKey = newKey;
      // case : no explicit call to a contextualizer ==> inline implicit contextualization, determine citeKey automatically
    })();
  } else {
      contextualizerKey = 'contextualizer_' + contextualizationCount + 1;
    }

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
  formattedParams.citeKey = contextualizerKey;
  return formattedParams;
};

var parseContextualizations = function parseContextualizations(section) {
  var replaced = section.contents;
  var contextualizations = [];
  var newContextualizers = section.contextualizers.slice();
  var statementsRE = /(\!)?\[([^\]]*)\]\(([^\)]+)\)/g;
  var match = void 0;
  var type = void 0;
  var resources = void 0;
  var paramsObject = void 0;
  var contextualizationCount = -1;

  while ((match = statementsRE.exec(replaced)) !== null) {
    /*
     * retrieve data from markdown expressions
     */
    // hyperlink markdown syntax stands for inline contextualization
    // image markdown syntax stands for block contextualization
    // ()[] = inline, !()[] = block
    type = match[1] ? 'block' : 'inline';
    // contents
    // children = match[2];
    // quoted resources
    resources = match[3].split(',').map(function (resKey) {
      var key = resKey.substr(1);
      return section.resources.find(function (res) {
        return res.citeKey === key;
      });
    }).filter(function (res) {
      return res !== undefined;
    });

    contextualizationCount++;
    // following parameters
    paramsObject = eatParamsObject(replaced.substr(match.index + match[0].length));

    // UPDATE TEXT
    // delete paramsObject from text
    if (paramsObject) {
      replaced = replaced.replace(replaced.substring(match.index + match[0].length, match.index + match[0].length + paramsObject.length), '');
    }
    // update reference in <a> link or <image>
    replaced = replaced.replace(replaced.substring(match.index + match[0].indexOf(match[3]), match.index + match[0].indexOf(match[3]) + match[3].length), 'contextualization_' + contextualizationCount);
    // UPDATE DATA
    var contextualizer = parseParamsObject(paramsObject, resources, contextualizationCount, newContextualizers);
    if (contextualizer) {
      newContextualizers.push(contextualizer);
    }
    contextualizations.push({
      // 'matchIndex': match.index - matchDisplace,
      'citeKey': 'contextualization_' + contextualizationCount,
      contextualizer: contextualizer,
      resources: resources,
      type: type
    });
  }
  return { md: replaced, contextualizations: contextualizations, contextualizers: newContextualizers };
};

// this module does not use a regex-based method
// because it must catch possible nested content-related "{" brackets symbols
// e.g. : this is an {example inside brackets}
var parseNotes = function parseNotes(md, sectionCiteKey) {
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
    var id = sectionCiteKey + noteNumber;
    var placeholder = '[footnote](note_' + id + ')';
    var initialLength = index - beginIndex + 4;
    var lengthDif = initialLength - placeholder.length;
    newMd = newMd.replace(newMd.substring(beginIndex - 4, index), placeholder);
    notes.push({
      noteNumber: noteNumber,
      contents: noteContent,
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

var _mapMdJsonToPJson = function mapMdJsonToPJson() {
  return undefined;
};
var representContents = function representContents() {
  return undefined;
};

_mapMdJsonToPJson = function mapMdJsonToPJson(inputElement, contextualizations, blockIndex) {
  var element = Object.assign({}, inputElement);
  element.blockIndex = blockIndex;
  if (element.text) {
    element.text = entities.decode(element.text);
  }
  if (element.tag === 'a') {
    if (element.attr.href.indexOf('note_') === 0) {
      element.tag = 'note';
      element.target = element.attr.href.substr(5);
    } else {
      (function () {
        element.tag = 'inlineC';
        var contextualizationCitekey = element.attr.href;
        var contextualization = contextualizations.find(function (cont) {
          return cont.citeKey === contextualizationCitekey;
        });
        contextualization.node = element;
      })();
    }
  } else if (element.tag === 'img') {
    (function () {
      element.tag = 'blockC';
      var contextualizationCitekey = element.attr.src;
      var contextualization = contextualizations.find(function (cont) {
        return cont.citeKey === contextualizationCitekey;
      });
      contextualization.node = element;
      var contents = element.attr && element.attr.alt ? element.attr.alt.join(' ') : '';
      element.child = [representContents(contents)[0]];
    })();
  }
  if (element.child) {
    element.child = element.child.map(function (child) {
      return _mapMdJsonToPJson(child, contextualizations, blockIndex);
    });
  }
  return element;
};

representContents = function representContents(mdContent, contextualizations) {
  return (0, _html2json.html2json)((0, _marked2.default)(mdContent)).child.map(function (child, blockIndex) {
    return _mapMdJsonToPJson(child, contextualizations, blockIndex);
  });
};

/**
 * Parses markdown contents in order to update section data with new contents (as a pseudo-DOM nested javascript object representation), notes, contextualizers and contextualizations
 * @param {Object} section - the section to parse
 * @param {Object} parameters - deprecated - rendering parameters (not used at this step)
 * @param {function(error: error, results: {errors: array, section: Object})} callback - the resulting conversion errors and updated section
 */
var markdownToJsAbstraction = exports.markdownToJsAbstraction = function markdownToJsAbstraction(section, parameters, callback) {
  var errors = [];

  var sectionCiteKey = (0, _sectionUtils.getMetaValue)(section.metadata, 'general', 'citeKey');

  section.markdownContents = section.contents;
  section.contextualizers = section.contextualizers.map(_bibTexConverter.parseBibNestedValues);

  var _parseContextualizati = parseContextualizations(section);

  var md = _parseContextualizati.md;
  var contextualizers = _parseContextualizati.contextualizers;
  var contextualizations = _parseContextualizati.contextualizations;

  var _parseNotes = parseNotes(md, sectionCiteKey);

  var notes = _parseNotes.notes;
  var newMd = _parseNotes.newMd;


  section.contextualizations = contextualizations.slice();
  section.contextualizers = contextualizers.slice();
  section.contents = representContents(newMd, section.contextualizations);
  section.notes = notes.map(function (note) {
    var contents = representContents(note.contents, section.contextualizations);
    return Object.assign(note, { contents: contents[0].child });
  });

  callback(null, { errors: errors, section: section });
};