'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * This module analyses special markdown insertions (includes and resources)
 * Takes a peritext-markdown string + syntax params as input
 * Parses inline resources expressions
 * Parses ``include`` statements
 * Returns cleaned string, plus a list of include statements and resources to parse
 */

var regexEscape = function regexEscape(str) {
  return str.replace(/[\\^$*+?.()|[\]{}]/g, '\\$&');
};

var parseMarkdown = exports.parseMarkdown = function parseMarkdown(str, _ref, callback) {
  var includeWrappingChars = _ref.includeWrappingChars;
  var resWrappingChars = _ref.resWrappingChars;

  var includesRegexp = new RegExp(regexEscape(includeWrappingChars[0]) + 'include:([^\\\}]+)' + regexEscape(includeWrappingChars[1]), 'g');
  var resourcesRegexp = new RegExp(regexEscape(resWrappingChars[0]) + '\\\n([\\\w\\\W]+)\\\n' + regexEscape(resWrappingChars[1]), 'g');
  var extracted = [];
  var cleanStr = str;
  var match = void 0;
  var extr = void 0;

  // recursively check for one of the two substitution expressions
  while ((match = resourcesRegexp.exec(cleanStr)) !== null || (match = includesRegexp.exec(cleanStr)) !== null) {
    // if match, swipe out original statement
    cleanStr = [cleanStr.substr(0, match.index - 1), cleanStr.substr(match.index + match[0].length)].join('');
    // save statement position and type
    extr = {
      index: match.index,
      statement: match[1]
    };
    if (match[0].match(resourcesRegexp)) {
      extr.type = 'resourceStatement';
    } else if (match[0].match(includesRegexp)) {
      extr.type = 'includeStatement';
    }
    // update other statements' position that would be further in string
    extracted = extracted.map(function (ex) {
      if (ex.index > extr.index) {
        ex.index -= match[0].length + 1;
      }
      return ex;
    });
    extracted.push(extr);
  }

  // reverse sort (for further string substitution operations)
  extracted = extracted.sort(function (one, two) {
    if (one.index > two.index) {
      return -1;
    }
    return 1;
  });
  return callback(null, { extracted: extracted, cleanStr: cleanStr });
};