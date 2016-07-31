/**
 * This module resolves markdown contents + peritext-specific assertions (notes, contextualizations, contextualizers)
 * It returns a representation of a section's content as an object containing arrays of: DOM children as js representation, notes, contextualizations, contextualizers
 * @module converters/markdownConverter
 */
import marked from 'marked';
import {html2json} from 'html2json';
import {XmlEntities} from 'html-entities';
const entities = new XmlEntities();

import {getMetaValue} from './../../utils/sectionUtils';
import {parseBibContextualization, parseBibNestedValues} from './../bibTexConverter';

// basic marked parser settings
marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: true,
  smartLists: true,
  smartypants: false
});

const eatParamsObject = (str)=> {
  let index = 0;
  let wrappingLevel = 0;
  let paramsObject = '';
  let inObject = false;
  let ch;
  while (index < str.length) {
    ch = str.charAt(index);
    if (ch === '{') {
      wrappingLevel++;
    }else if (ch === '}') {
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

const parseParamsObject = (paramsObject, impliedResources, contextualizationCount, contextualizers)=> {
  /*
   * analyse contextualizer statement
  */
  let overloading;
  let contextualizerKey;
  // case : explicit call to a contextualizer ==> overload
  if (paramsObject && paramsObject.indexOf('@') === 1) {
    contextualizerKey = paramsObject.match(/^\{(@[^,}]+)/)[1];
    overloading = contextualizerKey;
    let counter = 1;
    let newKey = contextualizerKey + '_' + counter;
    let unique = false;
    // getting a unique citeKey for the overloaded contextualizer
    while (!unique) {
      unique = true;
      contextualizers.forEach((cont) => {
        if (cont.citeKey === newKey) {
          unique = false;
          counter++;
          newKey = contextualizerKey + '_' + counter;
        }
      });
    }
    contextualizerKey = newKey;
  // case : no explicit call to a contextualizer ==> inline implicit contextualization, determine citeKey automatically
  }else {
    contextualizerKey = 'contextualizer_' + contextualizationCount + 1;
  }

  let formattedParams;
  if (paramsObject !== undefined) {
    formattedParams = parseBibContextualization(paramsObject);
    const emptyParams = JSON.stringify(formattedParams).length <= 2;
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

const parseContextualizations = (section)=> {
  let replaced = section.contents;
  const contextualizations = [];
  const newContextualizers = section.contextualizers.slice();
  const statementsRE = /(\!)?\[([^\]]*)\]\(([^\)]+)\)/g;
  let match;
  let type;
  let resources;
  let paramsObject;
  let contextualizationCount = -1;

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
    resources = match[3].split(',').map((resKey)=> {
      const key = resKey.substr(1);
      return section.resources.find(res=> {
        return res.citeKey === key;
      });
    }).filter(res=>{
      return res !== undefined;
    });

    contextualizationCount ++;
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
    const contextualizer = parseParamsObject(paramsObject, resources, contextualizationCount, newContextualizers);
    if (contextualizer) {
      newContextualizers.push(contextualizer);
    }
    contextualizations.push({
      // 'matchIndex': match.index - matchDisplace,
      'citeKey': 'contextualization_' + contextualizationCount,
      contextualizer,
      resources,
      type
    });
  }
  return {md: replaced, contextualizations, contextualizers: newContextualizers};
};


// this module does not use a regex-based method
// because it must catch possible nested content-related "{" brackets symbols
// e.g. : this is an {example inside brackets}
const parseNotes = (md, sectionCiteKey)=> {
  const notes = [];
  let noteNumber = 1;
  let index = 0;
  let displace = 0;
  let beginIndex;
  let nestingLevel = 0;
  let ch;
  let newMd = md;
  let noteContent;
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
    const id = sectionCiteKey + noteNumber;
    const placeholder = `[footnote](note_${id})`;
    const initialLength = index - beginIndex + 4;
    const lengthDif = initialLength - placeholder.length;
    newMd = newMd.replace(newMd.substring(beginIndex - 4, index), placeholder);
    notes.push({
      noteNumber,
      contents: noteContent,
      id
    });
    noteNumber++;
    displace = index - lengthDif;
  }
  return {
    notes,
    newMd
  };
};

let mapMdJsonToPJson = ()=>{return undefined;};
let representContents = ()=>{return undefined;};

mapMdJsonToPJson = (inputElement, contextualizations, blockIndex) =>{
  const element = Object.assign({}, inputElement);
  element.blockIndex = blockIndex;
  if (element.text) {
    element.text = entities.decode(element.text);
  }
  if (element.tag === 'a') {
    if (element.attr.href.indexOf('note_') === 0) {
      element.tag = 'note';
      element.target = element.attr.href.substr(5);
    } else {
      element.tag = 'inlineC';
      const contextualizationCitekey = element.attr.href;
      const contextualization = contextualizations.find(cont =>{
        return cont.citeKey === contextualizationCitekey;
      });
      contextualization.node = element;
    }
  } else if (element.tag === 'img') {
    element.tag = 'blockC';
    const contextualizationCitekey = element.attr.src;
    const contextualization = contextualizations.find(cont =>{
      return cont.citeKey === contextualizationCitekey;
    });
    contextualization.node = element;
    const contents = (element.attr && element.attr.alt) ? element.attr.alt.join(' ') : '';
    element.child = [representContents(contents)[0]];
  }
  if (element.child) {
    element.child = element.child.map((child)=>{
      return mapMdJsonToPJson(child, contextualizations, blockIndex);
    });
  }
  return element;
};

representContents = (mdContent, contextualizations) =>{
  return html2json(marked(mdContent)).child.map((child, blockIndex)=> {
    return mapMdJsonToPJson(child, contextualizations, blockIndex);
  });
};

/**
 * Parses markdown contents in order to update section data with new contents (as a pseudo-DOM nested javascript object representation), notes, contextualizers and contextualizations
 * @param {Object} section - the section to parse
 * @param {Object} parameters - deprecated - rendering parameters (not used at this step)
 * @param {function(error: error, results: {errors: array, section: Object})} callback - the resulting conversion errors and updated section
 */
export const markdownToJsAbstraction = (section, parameters, callback)=> {
  const errors = [];

  const sectionCiteKey = getMetaValue(section.metadata, 'general', 'citeKey');

  section.markdownContents = section.contents;
  section.contextualizers = section.contextualizers.map(parseBibNestedValues);

  const {
    md,
    contextualizers,
    contextualizations
  } = parseContextualizations(section);
  const {
    notes,
    newMd
  } = parseNotes(md, sectionCiteKey);

  section.contextualizations = contextualizations.slice();
  section.contextualizers = contextualizers.slice();
  section.contents = representContents(newMd, section.contextualizations);
  section.notes = notes.map(note =>{
    const contents = representContents(note.contents, section.contextualizations);
    return Object.assign(note, {contents: contents[0].child});
  });

  callback(null, {errors, section});
};
