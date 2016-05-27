/*
 * This module resolves markdown contents + modulo-specific assertions (notes, contextualizations, contextualizers)
* It returns a representation of a section's content as an object containing arrays of: paragraphs, notes, contextualizations, contextualizers
 */

const marked = require('marked');
import {parseBibContextualization, parseBibNestedValues} from './../bibTexConverter';
// import {getMetaValue} from './../../utils/sectionUtils';

// basic marked parser
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

function eatParamsObject(str) {
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
}


export function eatNotes(inputHtml, sectionCitekey, baseNotesCount = 0, notesPosition = 'inline') {
  let outputHtml = inputHtml;
  const notes = [];
  let notesCount = baseNotesCount;
  let newEl;
  let noteContent;
  let noteHtml;
  let index = 0;
  let displace = 0;
  let beginIndex;
  let nestingLevel = 0;
  let ch;


  while (outputHtml.substr(displace).indexOf('[^]{') > -1) {
    index = displace + outputHtml.substring(displace).indexOf('[^]{') + 4;
    beginIndex = index;
    nestingLevel = 1;


    while (index < outputHtml.length && nestingLevel > 0) {
      ch = outputHtml.charAt(index);
      if (ch === '{') {
        nestingLevel++;
      } else if (ch === '}') {
        nestingLevel--;
      }
      index++;
    }

    noteContent = outputHtml.substring(beginIndex, index - 1);
    notesCount++;
    noteHtml = '<p class="modulo-contents-note-content" name="note-content-' + sectionCitekey + notesCount + '" id="note-content-' + sectionCitekey + notesCount + '"><a class="modulo-contents-note-link" href="#note-pointer-' + sectionCitekey + notesCount + '"><span class="modulo-contents-note-number">' + notesCount + '</span></a>' + noteContent + '</p>';
    notes.push({
      content: noteHtml,
      noteNumber: notesCount
    });
    if (notesPosition === 'inline') {
      newEl = '<sup class="modulo-contents-note-content" name="note-content-' + sectionCitekey + notesCount + '" id="note-content-' + sectionCitekey + notesCount + '">' + noteContent + '</sup>';
    } else {
      newEl = '<sup class="modulo-contents-note-pointer" name="note-pointer-' + sectionCitekey + notesCount + '" id="note-pointer-' + sectionCitekey + notesCount + '"><a href="#note-content-' + sectionCitekey + notesCount + '"><span class="modulo-contents-note-number">' + notesCount + '</span></a></sup>';
    }
    outputHtml = outputHtml.substr(0, beginIndex - 4) + newEl + outputHtml.substr(index);
    displace = index;
  }

  return {notes, outputHtml};
}

function eatContextualizations(inputHtml) {
  let outputHtml = inputHtml;
  const inlineContextRE = /<a href="@(.*)">(.*)<\/a>/g;
  const BlockContextualizationRE = /<img src="@(.*)" alt="(.*)">/g;

  let match;
  let contextualizationCount = 0;
  let contextualizerKey;
  const contextualizers = [];
  const contextualizations = [];
  let paramsObject;
  let newEl;

  // parse block contextualizations
  while ((match = BlockContextualizationRE.exec(outputHtml)) !== null) {
    paramsObject = eatParamsObject(outputHtml.substr(match.index + match[0].length));
    let overloading;
    // detect explicit call to a contextualizer ==> overload
    if (paramsObject && paramsObject.indexOf('@') === 1) {
      contextualizerKey = paramsObject.match(/^\{@([^,}]+)/)[1];
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
    // no explicit call to a contextualizer ==> inline implicit contextualization, determine citeKey automatically
    }else {
      contextualizationCount ++;
      contextualizerKey = 'contextualizer_' + contextualizationCount;
    }

    let formattedParams;
    if (paramsObject !== undefined) {
      formattedParams = parseBibContextualization(paramsObject);
      const emptyParams = JSON.stringify(formattedParams).length <= 2;
      // not empty = params present, so inline (implicit new contextualizer, or contextualizer overloading)
      if (!emptyParams) {
        formattedParams.describedInline = true;
      // no additionnal params ==> no parameters
      } else {
        formattedParams = {};
      }
    // case of fully implicit contextualizer (no contextualizer specified)
    } else {
      formattedParams = {};
      formattedParams.describedInline = true;
      formattedParams.fullyImplicit = true;
    }
    if (overloading) {
      formattedParams.overloading = overloading;
    }
    formattedParams.citeKey = contextualizerKey;
    formattedParams.resources = match[1].replace('@', '').split(',');
    contextualizers.push(formattedParams);

    contextualizationCount ++;
    contextualizations.push({
      'contextualizer': contextualizerKey,
      'citeKey': 'contextualization_' + contextualizationCount,
      resources: match[1].replace(/^@/, '').split(','),
      type: 'block'
    });
    newEl = '<BlockContextualization id="' + 'contextualization_' + contextualizationCount + '" resources="@' + match[1] + '" contextualizer="' + contextualizerKey + '">' + match[2] + '</BlockContextualization>';
    outputHtml = outputHtml.substr(0, match.index) + newEl + outputHtml.substr(match.index + match[0].length + (paramsObject ? paramsObject.length : 0));
  }

  // parse inline contextualizations
  while ((match = inlineContextRE.exec(outputHtml)) !== null) {
    paramsObject = eatParamsObject(outputHtml.substr(match.index + match[0].length));

    let overloading;
    // detect explicit call to a contextualizer ==> overload
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
    // no explicit call to a contextualizer ==> inline implicit contextualization, determine citeKey automatically
    }else {
      contextualizationCount ++;
      contextualizerKey = 'contextualizer_' + contextualizationCount;
    }

    let formattedParams;
    if (paramsObject !== undefined) {
      formattedParams = parseBibContextualization(paramsObject);
      const emptyParams = JSON.stringify(formattedParams).length <= 2;
      // not empty = params present, so inline (implicit new contextualizer, or contextualizer overloading)
      if (!emptyParams) {
        formattedParams.describedInline = true;
      // no additionnal params ==> no parameters
      } else {
        formattedParams = {};
      }
    // case of fully implicit contextualizer (no contextualizer specified)
    } else {
      formattedParams = {};
      formattedParams.describedInline = true;
      formattedParams.fullyImplicit = true;
    }
    if (overloading) {
      formattedParams.overloading = overloading;
    }

    formattedParams.citeKey = contextualizerKey;
    formattedParams.resources = match[1].replace('@', '').split(',');
    contextualizers.push(formattedParams);

    contextualizations.push({
      'citeKey': 'contextualization_' + contextualizationCount,
      'contextualizer': contextualizerKey,
      resources: match[1].replace('@', '').split(','),
      type: 'inline'
    });
    newEl = '<InlineContextualization id="' + 'contextualization_' + contextualizationCount + '" resources="@' + match[1] + '" contextualizer="' + contextualizerKey + '">' + match[2] + '</InlineContextualization>';
    outputHtml = outputHtml.substr(0, match.index) + newEl + outputHtml.substr(match.index + match[0].length + (paramsObject ? paramsObject.length : 0));
  }
  return {contextualizers, contextualizations, tempHtml: outputHtml};
}

function eatBlock(sub, REobj, match) {
  let tag = match[0].split('<')[1];
  let closingTag = '</' + tag + '>';
  let closingIndex;
  let outputHtml;

  if (REobj.tagType === 'BlockContextualization') {
    tag = '<BlockContextualization';
    closingTag = '</BlockContextualization>';
    const openingIndex = sub.indexOf(tag);
    closingIndex = sub.indexOf(closingTag);
    outputHtml = sub.substr(openingIndex, closingIndex + closingTag.length - 4);
  } else if (!REobj.nested) {
    closingIndex = sub.indexOf(closingTag);
    outputHtml = sub.substr(0, closingIndex + closingTag.length);
  }else {
    outputHtml = '';
    let nestingLevel = 0;
    const openingTag = '<' + tag;

    let nestedBegin;
    let nestedEnd;
    let index = 0;

    do {
      nestedBegin = sub.substr(index).indexOf(openingTag);
      nestedEnd = sub.substr(index).indexOf(closingTag);
      // nest
      if (nestedBegin !== -1 && nestedBegin < nestedEnd) {
        nestingLevel++;
        index = index + nestedBegin + openingTag.length;
      }else {
        nestingLevel --;
        index = index + nestedEnd + closingTag.length;
      }
    }while (nestingLevel > 0 && index < sub.length);
    outputHtml = sub.substr(0, index);
  }

  return {newIndex: outputHtml.length, element: {html: outputHtml.trim(), tagType: REobj.tagType}};
}

function divideHtmlInBlocks(outputHtml) {
  const html = outputHtml;
  const blocksRE = [
    {
      tagType: 'BlockContextualization',
      RE: /^(?:[\s]*)(<p><BlockContextualization)/g,
      nested: false
    },
    {
      tagType: 'p',
      RE: /^(?:[\s]*)(<p)/g,
      nested: false
    },
    {
      tagType: 'ul',
      RE: /^(?:[\s]*)(<ul)/g,
      nested: true
    },
    {
      tagType: 'heading',
      RE: /^(?:[\s]*)(<h([\d]))/g,
      nested: false
    },
    {
      tagType: 'pre',
      RE: /^(?:[\s]*)(<pre)/g,
      nested: false
    },
    {
      tagType: 'blockquote',
      RE: /^(?:[\s]*)(<blockquote)/g,
      nested: false
    },
    {
      tagType: 'table',
      RE: /^(?:[\s]*)(<table)/g,
      nested: false
    }
  ];

  let index = 0;
  const elements = [];
  let match;
  let sub;

  while (index < html.length) {
    sub = html.substr(index);

    // find block type
    blocksRE.some((REobj)=>{
      match = sub.match(REobj.RE);
      if (match) {
        const {newIndex, element} = eatBlock(sub, REobj, match);
        index += newIndex;
        elements.push(element);
        sub = undefined;// used as marker that block has been processed
        return true;
      }
      return false;
    });

    // security: continue parsing if no block found (should not happen though ...)
    if (sub) {
      index++;
    }
  }
  return elements;
}

const regexEscape = function(str) {
  return str.replace(/[\\^$*+?.()|[\]{}]/g, '\\$&');
};

function formatTemplateCalls(input, wrappers) {
  const tempRegexp = new RegExp(regexEscape(wrappers[0]) + '([^' + regexEscape(wrappers[1]) + ']*)' + regexEscape(wrappers[1]), 'g');
  let match;
  let outputHtml = input;
  let vals;
  let templateType;
  let options;
  let expression;
  while ((match = tempRegexp.exec(outputHtml)) !== null) {
    vals = match[1].split(':');
    templateType = vals.shift().trim();
    options = vals.map((val)=>{return val.trim();}).join(',');
    expression = '<TemplateCall type="' + templateType + '" options="' + options + '"/>';
    outputHtml = outputHtml.substr(0, match.index) + expression + outputHtml.substr(match.index + match[0].length);
  }
  return outputHtml;
}

function eatHtml(html, parameters, metadata) {
  // const sectionCitekey = getMetaValue(metadata, 'general', 'citeKey');
  const {contextualizers, contextualizations, tempHtml} = eatContextualizations(html);
  const newHtml = formatTemplateCalls(tempHtml, parameters.templateWrappingCharacters);
  const {notes, outputHtml} = {notes: [], outputHtml: newHtml};
  // const {notes, outputHtml} = eatNotes(newHtml, sectionCitekey);
  const elements = divideHtmlInBlocks(outputHtml);
  return {contentBlocks: elements, contextualizers, notes, contextualizations};
}

export function markdownToContentsList(section, parameters, callback) {
  const errors = [];

  section.markdownContents = section.contents;
  section.contextualizers = section.contextualizers.map(parseBibNestedValues);

  const {contentBlocks, contextualizers, notes, contextualizations} = eatHtml(marked(section.contents), parameters, section.metadata);
  section.notes = notes;
  section.contents = contentBlocks;
  section.contextualizers = section.contextualizers.concat(contextualizers);
  section.contextualizations = contextualizations;
  callback(null, {errors, section});
}
