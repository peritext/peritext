/**
 * This module resolves markdown contents + peritext-specific assertions (notes, contextualizations, contextualizers)
* It returns a representation of a section's content as an object containing arrays of: paragraphs, notes, contextualizations, contextualizers
 */
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import ReactMarkdown from 'react-markdown';

import {parseBibContextualization, parseBibNestedValues} from './../bibTexConverter';
/*
import {
  Note
} from './../../components';
*/
// import {getMetaValue} from './../../utils/sectionUtils';

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


export function eatNotes(inputHtml, sectionCitekey, baseNotesCount = 0, notesPosition = 'footnotes') {
  let outputHtml = inputHtml;
  const notes = [];
  let notesCount = baseNotesCount;
  let newEl;
  let noteContent;
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
    // noteHtml = <Note sectionCitekey={sectionCitekey} notesCount={notesCount} noteContent={noteContent} />
    // noteHtml = '<p class="peritext-contents-note-content" name="note-content-' + sectionCitekey + notesCount + '" id="note-content-' + sectionCitekey + notesCount + '"><a class="peritext-contents-note-link" href="#note-pointer-' + sectionCitekey + notesCount + '"><span class="peritext-contents-note-number">' + notesCount + '</span></a>' + noteContent + '</p>';
    notes.push({
      // content: noteHtml,
      noteContent,
      sectionCitekey,
      notesCount,
      noteNumber: notesCount
    });
    if (notesPosition === 'footnotes') {
      newEl = '<sup class="peritext-static-note-content-container" name="peritext-static-note-content-' + sectionCitekey + notesCount + '" id="peritext-static-note-content-' + sectionCitekey + notesCount + '">' + noteContent + '</sup>';
    } else {
      newEl = '<sup class="peritext-static-note-pointer-container" name="peritext-static-note-pointer-' + sectionCitekey + notesCount + '" id="peritext-note-pointer-' + sectionCitekey + notesCount + '"><a href="#peritext-note-content-' + sectionCitekey + notesCount + '"><span class="peritext-static-note-pointer-number">' + notesCount + '</span></a></sup>';
    }
    outputHtml = outputHtml.substr(0, beginIndex - 4) + newEl + outputHtml.substr(index);
    displace = index;
  }

  return {notes, outputHtml};
}

function eatContextualizations(inputHtml) {
  let outputHtml = inputHtml;
  // match the href and content of <a> tag, stopping when detecting </a> by looking ahead
  const inlineContextRE = /<a href="@([^"]*)">((?:(?!<\/a>).)*)<\/a>/g;
  // const inlineContextRE = /<a href="@(.*)">(.*)<\/a>/g;
  const BlockContextualizationRE = /<img src="@([^"]*)" alt="([^"]*)">/g;
  // const BlockContextualizationRE = /<img src="@(.*)" alt="(.*)">/g;

  let match;
  let contextualizationCount = 0;
  let contextualizerKey;
  const contextualizers = [];
  let contextualizations = [];
  let paramsObject;
  let newEl;

  // this var is used to compute the order of contextualizations at end of contextualizations interpolations
  let matchDisplace = 0;

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
    formattedParams.resources = match[1].split(',').map((res) =>{
      return res.replace(/^@/, '');
    });
    contextualizers.push(formattedParams);

    contextualizationCount ++;

    newEl = '<BlockContextualization id="' + 'contextualization_' + contextualizationCount + '" resources="@' + match[1] + '" contextualizer="' + contextualizerKey + '">' + match[2] + '</BlockContextualization>';
    // add to match displace (resultLength - originalLength)
    matchDisplace += (newEl.length - (match[0].length + (paramsObject ? paramsObject.length : 0)));
    outputHtml = outputHtml.substr(0, match.index) + newEl + outputHtml.substr(match.index + match[0].length + (paramsObject ? paramsObject.length : 0));
    contextualizations.push({
      'matchIndex': match.index - matchDisplace,
      'contextualizer': contextualizerKey,
      'citeKey': 'contextualization_' + contextualizationCount,
      resources: match[1].split(',').map((res) =>{
        return res.replace(/^@/, '');
      }),
      type: 'block'
    });
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
    formattedParams.resources = match[1].split(',').map((res) =>{
      return res.replace(/^@/, '');
    });
    contextualizers.push(formattedParams);

    newEl = '<InlineContextualization id="' + 'contextualization_' + contextualizationCount + '" resources="@' + match[1] + '" contextualizer="' + contextualizerKey + '">' + match[2] + '</InlineContextualization>';
    outputHtml = outputHtml.substr(0, match.index) + newEl + outputHtml.substr(match.index + match[0].length + (paramsObject ? paramsObject.length : 0));
    // matchDisplace += resultLength - originalLength
    matchDisplace += (newEl.length - (match[0].length + (paramsObject ? paramsObject.length : 0)));
    contextualizations.push({
      'matchIndex': match.index - matchDisplace,
      'citeKey': 'contextualization_' + contextualizationCount,
      'contextualizer': contextualizerKey,
      resources: match[1].split(',').map((res) =>{
        return res.replace(/^@/, '');
      }),
      type: 'inline'
    });
  }
  // order contextualizations by order of apparition (previously ordered by block->inline)
  contextualizations = contextualizations.sort((aCont, bCont) =>{
    if (aCont.matchIndex > bCont.matchIndex) {
      return 1;
    }
    return -1;
  });
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
  // not nested component
  } else if (!REobj.nested) {
    closingIndex = sub.indexOf(closingTag);
    outputHtml = sub.substr(0, closingIndex + closingTag.length);
  // nested component (<ul>, ...)
  } else {
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

  return {
    newIndex: outputHtml.length,
    element: {
      html: outputHtml.trim(),
      tagType: REobj.tagType
    }
  };
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
    blocksRE.find((REobj)=>{
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
  const reactContents = (<ReactMarkdown source={section.contents} />);
  // const reactNotes = eatReactContents(reactContents);
  const {contentBlocks, contextualizers, notes, contextualizations} = eatHtml(ReactDOMServer.renderToStaticMarkup(reactContents), parameters, section.metadata);
  section.notes = notes;
  section.contents = contentBlocks;
  section.contextualizers = section.contextualizers.concat(contextualizers);
  section.contextualizations = contextualizations;
  callback(null, {errors, section});
}
