/**
 * This module analyses special markdown insertions (includes and resources)
 * Takes a peritext-markdown string + syntax params as input
 * Parses inline resources expressions
 * Parses ``include`` statements
 * Returns cleaned string, plus a list of include statements and resources to parse
 * @module converters/markdownIncludesParser
 */

const regexEscape = function(str) {
  return str.replace(/[\\^$*+?.()|[\]{}]/g, '\\$&');
};

/**
 * Parses markdown string for markdown files includes statements and inline resources descriptions
 * @param {string} str - the string to parse
 * @param {Object} expressions - the wrapping expressions to use in order to parse includes and inline resources
 * @param {function(error: error, results: {extracted: array, cleanStr: string})} - callback - returns error, results as an array of extracted statements and clean string (without statements)
 */
export const parseMarkdown = (str, {includeWrappingChars, resWrappingChars}, callback) => {
  const includesRegexp = new RegExp(regexEscape(includeWrappingChars[0]) + 'include:([^\\\}]+)' + regexEscape(includeWrappingChars[1]), 'g');
  const resourcesRegexp = new RegExp(regexEscape(resWrappingChars[0]) + '\\\n([\\\w\\\W]+)\\\n' + regexEscape(resWrappingChars[1]), 'g');
  let extracted = [];
  let cleanStr = str;
  let match;
  let extr;

  // recursively check for one of the two substitution expressions
  while (((match = resourcesRegexp.exec(cleanStr)) !== null) || ((match = includesRegexp.exec(cleanStr)) !== null)) {
    // if match, swipe out original statement
    cleanStr = [cleanStr.substr(0, match.index - 1), cleanStr.substr(match.index + match[0].length)].join('');
    // save statement position and type
    extr = {
      index: match.index,
      statement: match[1]
    };
    if (match[0].match(resourcesRegexp)) {
      extr.type = 'resourceStatement';
    }else if (match[0].match(includesRegexp)) {
      extr.type = 'includeStatement';
    }
    // update other statements' position that would be further in string
    extracted = extracted.map((ex) => {
      if (ex.index > extr.index) {
        ex.index -= match[0].length + 1;
      }
      return ex;
    });
    extracted.push(extr);
  }

  // reverse sort (for further string substitution operations)
  extracted = extracted.sort((one, two) =>{
    if (one.index > two.index) {
      return -1;
    }
    return 1;
  });
  return callback(null, {extracted, cleanStr});
};
