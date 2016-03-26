var marked = require('marked');
var cheerio = require('cheerio');
import {parseBibContextualization, parseBibNestedValues} from './../bibTexConverter';
import {getMetaValue} from './../../utils/sectionUtils';

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

function eatParamsObject(str){
  let index = 0,
      wrappingLevel = 0,
      paramsObject = '',
      inObject = false,
      ch;

  while(index < str.length){
    ch = str.charAt(index);
    if(ch === '{'){
      wrappingLevel++;
    }else if(ch === '}'){
      wrappingLevel--;
    }

    if(!inObject && wrappingLevel > 0){
      inObject = true;
      paramsObject += ch;
    } else if(inObject && wrappingLevel === 0){
      paramsObject += ch;
      return paramsObject;
    } else if(inObject){
      paramsObject += ch;
      //not in object, character is neither a wrapper nor a whitespace, leave
    } else if(!inObject && ch.match(/([\s])/) === null){
      return undefined;
    }
    index++;
  }
  return undefined;
}

const analyzeCalls = function($, el, child, paragraphIndex, contextualizationCount, parentKey){
  const html = $(el);
  const inline = html.find('a');
  const block = html.find('img');

  child.notes = [];
  child.contextualizations = [];
  const contextualizers = [];
  let noteIndex = 1,
      footnoteId,
      inlineText,
      inlineHref,
      rawParams = [],
      contextualizerKey,
      count = 0;

  inline.each(function(i, el){
    inlineText = $(this).text();
    inlineHref = $(this).attr('href');
    if(inlineText === '^'){
      let content = marked(inlineHref);
      footnoteId = 'note_' + paragraphIndex + '_' + noteIndex;
      child.notes.push({
        html : content,
        id : footnoteId,
        paragraphIndex : paragraphIndex,
        noteIndex : noteIndex
      });

      let newSpan = '<sup class="note-pointer"><a href="#note_'+paragraphIndex + '_' + noteIndex
                    + '">' + noteIndex + '</a></sup>'
      $(this).replaceWith($(newSpan))

      // $(this).attr('href', footnoteId);
      // $(this).text(noteIndex);
      noteIndex ++;

    } else if(inlineHref.indexOf('@') === 0){
      let els = $(html).contents().filter(function(j) {
          return this.nodeType == 3 && j >= i + 2;
      });
      let paramsObject = eatParamsObject(els.text());
      if(paramsObject){
        //reference to contextualization set as reference
        if(paramsObject.indexOf('=') === -1){
          contextualizerKey = paramsObject.match(/^\{([^}]+)\}$/)[1]
          //parse contexutalization
        }else{
          let formattedParams = parseBibContextualization(paramsObject);
          contextualizationCount ++;
          contextualizerKey = parentKey + '_' + contextualizationCount;
          formattedParams.citeKey = contextualizerKey;
          contextualizers.push(formattedParams);
        }
        child.contextualizations.push({
            'contextualizer' : contextualizerKey,
            resources : $(this).attr('href').replace('@', '').split(','),
            type : 'inline'
          });
        $(this).attr('contextualization', count);
        rawParams.push(paramsObject);
        count++;
      }
    }
  });
  let imgSrc,
      imgAlt;
  block.each(function(i, el){
    imgSrc = $(this).attr('src');
    imgAlt = $(this).attr('alt');
    if(imgSrc.indexOf('@') === 0){
      let els = $(html).contents().filter(function(j) {
          return this.nodeType == 3 && j >= i + 1;
      });
      // console.log(els.text());
      let paramsObject = eatParamsObject(els.text());
      if(paramsObject){
        //reference to contextualization set as reference
        if(paramsObject.indexOf('=') === -1){
          contextualizerKey = paramsObject.match(/^\{([^}]+)\}$/)[1]
          //parse contexutalization
        }else{
          let formattedParams = parseBibContextualization(paramsObject);
          contextualizationCount ++;
          contextualizerKey = parentKey + '_' + contextualizationCount;
          formattedParams.citeKey = contextualizerKey;
          contextualizers.push(formattedParams);
        }
        child.contextualizations.push({
            'contextualizer' : contextualizerKey,
            resources : imgSrc.replace('@', '').split(','),
            type : 'block'
          });
        let newDiv = '<span class="block-contextualization" contextualization="'
                      +count + '">' + imgAlt + '</span>';
        $(this).replaceWith($(newDiv));
        rawParams.push(paramsObject);
        count++;
      }
    }
  });

  let newHtml = $(html).toString();
  newHtml = rawParams.reduce((html, paramsObject) => {
    let obj = $('<div>' + paramsObject + '</div>').html();
    return html.replace(obj, '');
  }, newHtml);


  child.html = newHtml;

  return {child, contextualizers, newContextualizationCount : contextualizationCount};
}

export function markdownToContentsList(section, callback){
  const errors = [];
  section.markdownContents = section.contents;

  section.contextualizers = section.contextualizers.map(parseBibNestedValues);

  let contents = marked(section.contents),
      $ = cheerio.load('<div id="parent">'+contents+'</div>'),
      childrenEl = $('#parent').children(),
      children = [],
      contextualizationCount = 1;
  childrenEl.each(function(i, el){
    let {child, contextualizers, newContextualizationCount} = analyzeCalls($, this, {}, i, contextualizationCount, getMetaValue(section.metadata, 'general', 'citeKey'));
    contextualizationCount = newContextualizationCount;
    section.contextualizers = section.contextualizers.concat(contextualizers);
    children.push(child);
  });

  section.contents = children;

  callback(null, {errors, section});
}
