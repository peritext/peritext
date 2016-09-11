/**
 * This module resolves markdown contents + peritext-specific assertions (notes, contextualizations, contextualizers)
 * It returns a representation of a section's content as an object containing arrays of: DOM children as js representation, notes, contextualizations, contextualizers
 * @module converters/markdownConverter
 */
import marked from 'marked';
import {v4} from 'uuid';
import {html2json} from 'html2json';
import {XmlEntities} from 'html-entities';
const entities = new XmlEntities();
import {parseBibContextualization} from './bibTexConverter';

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

const parseParamsObject = (paramsObject)=> {
  /*
   * analyse contextualizer statement
  */
  let overloading;
  let contextualizerKey;
  // case : explicit call to a contextualizer ==> explicit contextualizer overload case
  if (paramsObject && paramsObject.indexOf('@') === 1) {
    contextualizerKey = paramsObject.match(/^\{(@[^,}]+)/)[1];
    overloading = contextualizerKey;
  }
  // else case : no explicit call to a contextualizer ==> inline implicit contextualization, determine citeKey automatically
  contextualizerKey = 'contextualization-' + v4();

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
  const contextualizations = {};
  const newContextualizers = {};
  const orderedContextualizations = [];
  const statementsRE = /(\!)?\[([^\]]*)\]\(([^\)]+)\)/g;
  let match;
  let type;
  let resources;
  let paramsObject;

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
    resources = match[3].split(',').map(resKey => resKey.substr(1));
    const contextualizationId = 'contextualization-' + v4();
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
    const contextualizer = parseParamsObject(paramsObject);
    if (contextualizer) {
      newContextualizers[contextualizer.citeKey] = contextualizer;
    }
    contextualizations[contextualizationId] = {
      'citeKey': contextualizationId,
      contextualizer: contextualizer.citeKey,
      resources,
      type
    };
    orderedContextualizations.push(contextualizationId);
  }
  return {md: replaced, orderedContextualizations, contextualizations, contextualizers: newContextualizers};
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
    const id = 'note-' + sectionCiteKey + '-' + v4();// noteNumber;
    const placeholder = `[footnote](note_${id})`;
    const initialLength = index - beginIndex + 4;
    const lengthDif = initialLength - placeholder.length;
    newMd = newMd.replace(newMd.substring(beginIndex - 4, index), placeholder);
    notes.push({
      noteNumber,
      markdownContents: noteContent,
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
// for recursivity matter
let mapMdJsonToPJson = ()=>{return undefined;};
let representContents = ()=>{return undefined;};

mapMdJsonToPJson = (inputElement, contextualizations, elementPath) =>{
  const element = Object.assign({}, inputElement);
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
      const contextualizationCiteKey = element.attr.href;
      const contextualization = contextualizations[contextualizationCiteKey];
      contextualization.nodePath = elementPath;
    }
  // case of a block contextualization
  } else if (element.tag === 'img') {
    element.tag = 'blockC';
    const contextualizationCiteKey = element.attr.src;
    const contextualization = contextualizations[contextualizationCiteKey];
    contextualization.nodePath = elementPath;
    const contents = (element.attr && element.attr.alt) ? element.attr.alt.join(' ') : '';
    element.child = [representContents(contents, contextualizations, elementPath)[0]];
    delete element.attr;
  }
  if (element.child) {
    element.child = element.child.map((child, elementIndex)=>{
      return mapMdJsonToPJson(child, contextualizations, elementPath.concat(['child', elementIndex]));
    });
  }
  return element;
};

representContents = (mdContent, contextualizations, elementPath) =>{
  return html2json(marked(mdContent)).child.map((child, blockIndex)=> {
    return mapMdJsonToPJson(child, contextualizations, elementPath.concat(blockIndex));
  });
};

/**
 * Parses markdown contents in order to update section data with new contents (as a pseudo-DOM nested javascript object representation), notes, contextualizers and contextualizations
 * @param {Object} section - the section to parse
 * @param {Object} parameters - deprecated - rendering parameters (not used at this step)
 * @return {errors: array, section: Object} - the resulting conversion errors and updated section
 */
export const markdownToJsAbstraction = (section, parameters)=> {
  const errors = [];

  const sectionCiteKey = section.metadata.general.citeKey.value;
  // save original markdown expression of contents (for further possible serializing)
  section.markdownContents = section.contents;
  // first extract contextualizations statements
  const {
    md,
    contextualizers,
    orderedContextualizations,
    contextualizations
  } = parseContextualizations(section);
  // then extract notes statements
  const {
    notes,
    newMd
  } = parseNotes(md, sectionCiteKey);
  section.contextualizations = orderedContextualizations;
  // convert cleaned markdown contents to js representation
  section.contents = representContents(newMd, contextualizations, [sectionCiteKey, 'contents']);
  section.notes = notes.map((note, noteIndex) =>{

    const contents = html2json(marked(note.markdownContents)).child.map((child, blockIndex)=> {
      return mapMdJsonToPJson(child, contextualizations, [sectionCiteKey, 'notes', noteIndex]);
    });
    return Object.assign(note, {
      child: [
        // this is dirty, done for matching contextualization nodePath which is displaced otherwise
        // other dirty solution : handle that in mapMdJsonToPJson with a path check
        // (if in notes prop => decrement contextualization target)
        { node: 'text',
          text: ''
        },
        ...contents[0].child
      ]
    });
  });
  return {errors, section, contextualizers, contextualizations};
};
