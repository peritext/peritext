/*
 * This module analyses special markdown insertions (includes and resources)
 * Takes a modulo-markdown string + syntax params as input
 * Parses inline resources expressions
 * Parses ``include`` statements
 * Returns cleaned string, plus a list of include statements and resources to parse
 */

 const regexEscape = function(str){
  return str.replace(/[\\^$*+?.()|[\]{}]/g, '\\$&');
 }


export function parseMarkdown(str, {includeWrappingChars, resWrappingChars}, callback){
  const includesRegexp = new RegExp(regexEscape(includeWrappingChars[0]) + 'include:([^\\\}]+)' + regexEscape(includeWrappingChars[1]), 'g');
  const resourcesRegexp = new RegExp(regexEscape(resWrappingChars[0]) + '\\\n([\\\w\\\W]+)\\\n' + regexEscape(resWrappingChars[1]), 'g');
  let extracted = [],
      cleanStr = str,
      match,
      extr;

  //recursively check for one of the two substitution expressions
  while(((match = resourcesRegexp.exec(cleanStr)) !== null)
        ||
        ((match = includesRegexp.exec(cleanStr)) !== null)){
    //if match, swipe out original statement
    cleanStr = [cleanStr.substr(0, match.index -1), cleanStr.substr(match.index + match[0].length)].join('');
    //save statement position and type
    extr = {
      index : match.index,
      statement : match[1]
    }
    if(match[0].match(resourcesRegexp)){
      extr.type = 'resourceStatement';
    }else if(match[0].match(includesRegexp)){
      extr.type = 'includeStatement';
    }
    //update other statements' position that would be further in string
    extracted = extracted.map((ex) => {
      if(ex.index > extr.index){
        ex.index -= match[0].length +1;
      }
      return ex;
    });
    extracted.push(extr);
  }

  //reverse sort (for further string substitution operations)
  extracted = extracted.sort(function(a, b){
    if(a.index > b.index){
      return -1;
    }else return 1;
  });

  return callback(null, {extracted,cleanStr});
}
