/*
 * This module resolves markdown contents + modulo-specific assertions (footnotes, contextualizations, contextualizers)
* It returns a representation of a section's content as an object containing arrays of : paragraphs, footnotes, contextualizations, contextualizers
 */

var marked = require('marked');
import {parseBibContextualization, parseBibNestedValues} from './../bibTexConverter';

//basic marked parser
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
  // str = str
  let index = 0,
    wrappingLevel = 0,
    paramsObject = '',
    inObject = false,
    ch;

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
      //not in object, character is neither a wrapper nor a whitespace, leave
    } else if (!inObject && ch.match(/([\s])/) === null) {
      return undefined;
    }
    index++;
  }
  return undefined;
}



function eatFootnotes(outputHtml) {
  let footnotes = [],
    footnotesCount = 0,
    newEl,
    footnoteContent,
    index = 0,
    displace = 0,
    beginIndex,
    endIndex,
    nestingLevel = 0,
    ch;


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
    // console.log('content begining : ', outputHtml.substr(beginIndex))


    // console.log('content after : ', outputHtml.substr(index));
    footnoteContent = outputHtml.substring(beginIndex, index - 1);
    footnotesCount++;
    footnotes.push({
      content : '<sup class="note"><span class="footnote-number">' + footnotesCount + '</span><a id="#note_' + footnotesCount + '" href="#notepointer_' + footnotesCount + '">' + footnoteContent + '</a></sup>',
      footnoteNumber : footnotesCount
    });
    newEl = '<sup class="note_pointer"><a id="#notepointer_' + footnotesCount + '" href="#note_' + footnotesCount + '"><span class="footnote-number">' + footnotesCount + '</span></a></sup>';
    outputHtml = outputHtml.substr(0, beginIndex - 4) + newEl + outputHtml.substr(index);


    displace = index;
  }

  return {footnotes, outputHtml};
}

function eatContextualizations(outputHtml) {


  const inlineContextRE = /<a href="@(.*)">(.*)<\/a>/g,
    blockContextRE = /<img src="@(.*)" alt="(.*)">/g;

  let match,
    contextualizationCount = 0,
    contextualizerKey,
    contextualizers = [],
    contextualizations = [],
    paramsObject,
    newEl,
    footnoteContent;

  //parse block contextualizations
  while ((match = blockContextRE.exec(outputHtml)) !== null) {
    paramsObject = eatParamsObject(outputHtml.substr(match.index + match[0].length));
    if (paramsObject.indexOf('=') === -1) {
      contextualizerKey = paramsObject.match(/^\{([^}]+)\}$/)[1];
      //parse contexutalization
    }else {
      let formattedParams = parseBibContextualization(paramsObject);
      contextualizationCount ++;
      contextualizerKey = contextualizationCount;
      formattedParams.citeKey = contextualizerKey;
      formattedParams.describedInline = true;
      formattedParams.resources = match[1].replace('@', '').split(',');
      contextualizers.push(formattedParams);
    }
    contextualizations.push({
      'contextualizer' : contextualizerKey,
      resources : match[1].replace('@', '').split(','),
      type : 'block'
    });
    newEl = '<blockcontext resources="@' + match[1] + '" contextualizer="' + contextualizerKey + '" contextualization-index=' + (contextualizations.length - 1) + '>' + match[2] + '</blockcontext>';
    outputHtml = outputHtml.substr(0, match.index) + newEl + outputHtml.substr(match.index + match[0].length + paramsObject.length);
  }

  //parse inline contextualizations
  while ((match = inlineContextRE.exec(outputHtml)) !== null) {
    paramsObject = eatParamsObject(outputHtml.substr(match.index + match[0].length));

    //contextualizer call
    if (paramsObject && paramsObject.indexOf('=') === -1) {
      contextualizerKey = paramsObject.match(/^\{([^}]+)\}$/)[1];
    //contextualizer inline definition
    }else if (paramsObject) {
      let formattedParams = parseBibContextualization(paramsObject);
      contextualizationCount ++;
      contextualizerKey = contextualizationCount;
      formattedParams.citeKey = contextualizerKey;
      formattedParams.describedInline = true;
      formattedParams.resources = match[1].replace('@', '').split(',');
      contextualizers.push(formattedParams);
    //no contextualizer
    }else {
      contextualizationCount ++;
      contextualizerKey = contextualizationCount;
      contextualizers.push({
        citeKey : contextualizerKey,
        describedInline : true,
        resources : match[1].replace('@', '').split(',')
      });
      paramsObject = '';
    }
    contextualizations.push({
      'contextualizer' : contextualizerKey,
      resources : match[1].replace('@', '').split(','),
      type : 'inline'
    });
    newEl = '<inlinecontext resources="@' + match[1] + '" contextualizer="' + contextualizerKey + '" contextualization-index=' + (contextualizations.length - 1) + '>' + match[2] + '</inlinecontext>';
    outputHtml = outputHtml.substr(0, match.index) + newEl + outputHtml.substr(match.index + match[0].length + paramsObject.length);
  }
  return {contextualizers, contextualizations, newHtml : outputHtml};
}


function eatBlock(sub, REobj, match) {
  let tag = match[0].split('<')[1],
    closingTag = '</' + tag + '>',
    closingIndex,
    outputHtml;

  if (REobj.tagType === 'blockcontext') {
    tag = '<blockcontext';
    closingTag = '</blockcontext>';
    let openingIndex = sub.indexOf(tag);
    closingIndex = sub.indexOf(closingTag);
    outputHtml = sub.substr(openingIndex, closingIndex + closingTag.length - 4);
  } else if (!REobj.nested) {
    closingIndex = sub.indexOf(closingTag);
    outputHtml = sub.substr(0, closingIndex + closingTag.length);
  }else {
    outputHtml = '';
    let nestingLevel = 0,
      openingTag = '<' + tag;

    let nestedBegin,
      nestedEnd,
      index = 0;

    do {
      nestedBegin = sub.substr(index).indexOf(openingTag);
      nestedEnd = sub.substr(index).indexOf(closingTag);
      //nest
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

  return {newIndex : outputHtml.length, element : {html:outputHtml.trim(), tagType : REobj.tagType}};
}


function divideHtmlInBlocks(outputHtml) {
  const html = outputHtml;
  const blocksRE = [
    {
      tagType : 'blockcontext',
      RE : /^(?:[\s]*)(<p><blockcontext)/g,
      nested : false
    },
    {
      tagType : 'p',
      RE : /^(?:[\s]*)(<p)/g,
      nested : false
    },
    {
      tagType : 'ul',
      RE : /^(?:[\s]*)(<ul)/g,
      nested : true
    },
    {
      tagType : 'heading',
      RE : /^(?:[\s]*)(<h([\d]))/g,
      nested : false
    },
    {
      tagType : 'pre',
      RE : /^(?:[\s]*)(<pre)/g,
      nested : false
    },
    {
      tagType : 'blockquote',
      RE : /^(?:[\s]*)(<blockquote)/g,
      nested : false
    },
    {
      tagType : 'table',
      RE : /^(?:[\s]*)(<table)/g,
      nested : false
    }
  ];

  let index = 0,
    elements = [],
    match,
    sub;

  while (index < html.length) {
    sub = html.substr(index);

    //find block type
    blocksRE.some((REobj)=>{
      match = sub.match(REobj.RE);
      if (match) {
        const {newIndex, element} = eatBlock(sub, REobj, match);
        index += newIndex;
        elements.push(element);
        sub = undefined;//used as marker that block has been processed
        return true;
      }else {
        return false;
      }
    });

    //security : continue parsing if no block found (should not happen though ...)
    if (sub) {
      index++;
    }
  }
  return elements;
}



function eatHtml(html) {
  const {contextualizers, contextualizations, newHtml} = eatContextualizations(html);
  const {footnotes, outputHtml} = eatFootnotes(newHtml);
  const elements = divideHtmlInBlocks(outputHtml);
  return {contentBlocks : elements, contextualizers, footnotes, contextualizations};
}

export function markdownToContentsList(section, callback) {
  const errors = [];

  section.markdownContents = section.contents;
  section.contextualizers = section.contextualizers.map(parseBibNestedValues);

  const {contentBlocks, contextualizers, footnotes, contextualizations} = eatHtml(marked(section.contents));
  section.footnotes = footnotes;
  section.contents = contentBlocks;
  section.contextualizers = section.contextualizers.concat(contextualizers);
  section.contextualizations = contextualizations;

  callback(null, {errors, section});
}
