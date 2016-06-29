import React from 'react';
import ReactDOMServer from 'react-dom/server';
import {HyperLink, WebsitePoster} from './../../components';

export function contextualizeInlineStatic(section, contextualization) {
  const elRe = new RegExp('<InlineContextualization id="' + contextualization.citeKey + '"[^>]*>(.*)</InlineContextualization>');
  let match;
  const resource = section.resources.find((res) =>{
    return res.citeKey === contextualization.resources[0];
  });
  const newContents = section.contents.map((block) =>{
    match = block.html.match(elRe);
    if (match) {
      const hyperLink = ReactDOMServer.renderToStaticMarkup(<HyperLink resource={resource} text={resource.url} />);
      const outputHtml = block.html.substr(0, match.index) + match[1] + '[^]{' + hyperLink + '}' + block.html.substr(match.index + match[0].length);
      return {
        html: outputHtml,
        tagType: block.tagType
      };
    }
    return block;
  });

  return Object.assign({}, section, {contents: newContents});
}

export function contextualizeBlockStatic(section, contextualization) {
  const figuresCount = section.figuresCount + 1;
  const elRe = new RegExp('<BlockContextualization id="' + contextualization.citeKey + '"[^>]*>(.*)</BlockContextualization>');
  let match;
  const resource = section.resources.find((res) =>{
    return res.citeKey === contextualization.resources[0];
  });
  const contextualizer = section.contextualizers.find((cont) =>{
    return cont.citeKey === contextualization.contextualizer;
  });
  const newContents = section.contents.map((block) =>{
    match = block.html.match(elRe);
    if (match) {
      const caption = match[1]
                      + (contextualizer.comment ? '. '
                          + contextualizer.comment : '')
                      + (resource.caption ? '. '
                          + resource.caption : '');
      // const link = ReactDOMServer.renderToStaticMarkup(<HyperLink text={resource.url} resource={resource}/>);
      const figureHtml = ReactDOMServer.renderToStaticMarkup(<WebsitePoster resource={resource} imageKey="posterurl" captionContent={caption} figureNumber={figuresCount}/>);
      const outputHtml = block.html.substr(0, match.index) + figureHtml + block.html.substr(match.index + match[0].length);
      return {
        html: outputHtml,
        tagType: block.tagType
      };
    }
    return block;
  });

  // add figure number
  section.contextualizations = section.contextualizations.map((cont) =>{
    if (cont.citeKey === contextualization.citeKey) {
      cont.figureNumber = figuresCount;
      return cont;
    }
    return cont;
  });

  return Object.assign({}, section, {figuresCount}, {contents: newContents});
}

export function contextualizeInlineDynamic(section, contextualization) {
  return section;
}

export function contextualizeBlockDynamic(section, contextualization) {
  return section;
}
