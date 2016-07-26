import React from 'react';
import ReactDOMServer from 'react-dom/server';

import {
  StaticEntityInline,
  StaticEntityBlock
} from './../../components';
import {getMetaValue} from './../../utils/sectionUtils';

export function contextualizeInlineStatic(inputSection, inputContextualization, renderingParams) {
  const section = Object.assign({}, inputSection);
  const sectionCiteKey = getMetaValue(section.metadata, 'general', 'citeKey');
  const contextualization = Object.assign({}, inputContextualization);
  const contextualizer = section.contextualizers.find((thatContextualizer)=> {
    return contextualization.contextualizer === thatContextualizer.citeKey;
  });
  const resource = section.resources.find((res)=> {
    return contextualization.resources[0] === res.citeKey;
  });
  // interpolate html
  const elRe = new RegExp('<InlineContextualization id="' + contextualization.citeKey + '"[^>]*>((?:(?!<\\/InlineContextualization>).)*)<\\/InlineContextualization>');
  // const elRe = new RegExp('<InlineContextualization id="' + contextualization.citeKey + '"[^>]*>(.*)</InlineContextualization>');
  let match;
  const newContents = section.contents.map((block) =>{
    let outputHtml;
    match = block.html.match(elRe);
    if (match) {
      const textContent = (match[1].length > 0 && match[1]) || contextualizer.alias || resource.name || resource.firstname + ' ' + resource.lastname;
      const element = ReactDOMServer.renderToStaticMarkup(<StaticEntityInline entity={resource} textContent={textContent} contextualization={contextualization} sectionCiteKey={sectionCiteKey}/>);
      outputHtml = block.html.substr(0, match.index) + element + block.html.substr(match.index + match[0].length);

      const output = {
        html: outputHtml,
        tagType: block.tagType
      };
      return output;
    }
    return block;
  });
  return Object.assign({}, section, {contents: newContents});
}

export function contextualizeBlockStatic(inputSection, inputContextualization, renderingParams) {
  const section = Object.assign({}, inputSection);
  const contextualization = Object.assign({}, inputContextualization);
  const contextualizer = section.contextualizers.find((thatContextualizer)=> {
    return contextualization.contextualizer === thatContextualizer.citeKey;
  });
  const resource = section.resources.find((res)=> {
    return contextualization.resources[0] === res.citeKey;
  });
  // interpolate html
  const elRe = new RegExp('<BlockContextualization id="' + contextualization.citeKey + '"[^>]*>((?:(?!<\\/BlockContextualization>).)*)<\\/BlockContextualization>');
    // const elRe = new RegExp('<BlockContextualization id="' + contextualization.citeKey + '"[^>]*>(.*)</BlockContextualization>');
  let match;
  const newContents = section.contents.map((block) =>{
    match = block.html.match(elRe);
    if (match) {
      const element = ReactDOMServer.renderToStaticMarkup(<StaticEntityBlock entity={resource} contextualizer={contextualizer} renderingParams={renderingParams}/>);
      const output = {
        html: element,
        tagType: 'section'
      };
      return output;
    }
    return block;
  });
  return Object.assign({}, section, {contents: newContents});
}

export function contextualizeInlineDynamic(section, contextualization, renderingParams) {
  return section;
}

export function contextualizeBlockDynamic(section, contextualization, renderingParams) {
  return section;
}
