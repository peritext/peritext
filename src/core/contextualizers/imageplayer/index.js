import React from 'react';
import ReactDOMServer from 'react-dom/server';
import {StaticImageGallery} from './../../components';


export function contextualizeInlineStatic(inputSection, contextualization, renderingParams) {
  const section = Object.assign({}, inputSection);
  // check if a figure with the same resources is already there
  let existant;
  let cindex = 0;
  let cont;
  while (cindex < section.contextualizations.length && section.contextualizations[cindex].citeKey !== contextualization.citeKey) {
    cont = section.contextualizations[cindex];
    if (cont.citeKey !== contextualization.citeKey && cont.contextualizerType === contextualization.contextualizerType && cont.resources.join(',') === contextualization.resources.join(',')) {
      existant = cont;
      break;
    }
    cindex++;
  }

  let figureNumber;
  let figuresCount;

  if (existant) {
    figureNumber = existant.figureNumber;
    figuresCount = section.figuresCount;
  } else {
    figuresCount = section.figuresCount + 1;
    figureNumber = figuresCount;
  }
  const elRe = new RegExp('<InlineContextualization id="' + contextualization.citeKey + '"[^>]*>(.*)</InlineContextualization>');
  const resources = contextualization.resources.reduce((list, resKey) =>{
    const resource = section.resources.find((oRes) =>{
      return oRes.citeKey === resKey;
    });
    list.push(resource);
    return list;
  }, []);
  let match;
  let firstMentionIndex;
  let newContents = section.contents.map((block, index) =>{
    match = block.html.match(elRe);
    if (match) {
      const outputHtml = block.html.substr(0, match.index) + match[1] + ' (<a class="modulo-contents-figure-pointer" href="#modulo-contents-figure-' + figureNumber + '">figure ' + figureNumber + '</a>)' + block.html.substr(match.index + match[0].length);
      if (firstMentionIndex === undefined) {
        firstMentionIndex = index;
      }
      return {
        html: outputHtml,
        tagType: block.tagType
      };
    }
    return block;
  });
  if (existant === undefined) {
    const caption = (contextualization.title ? contextualization.title : resources[0].title);
    const gallery = ReactDOMServer.renderToStaticMarkup(<StaticImageGallery resources={resources} captionContent={caption} figureNumber={figureNumber}/>);
    newContents = [...newContents.slice(0, firstMentionIndex + 1), {
      html: gallery,
      tagType: 'div'
    }, ...newContents.slice(firstMentionIndex + 1)];
  }

  // add figure number
  section.contextualizations = section.contextualizations.map((ocont) =>{
    if (ocont.citeKey === contextualization.citeKey) {
      ocont.figureNumber = figureNumber;
      return ocont;
    }
    return ocont;
  });
  return Object.assign({}, section, {figuresCount}, {contents: newContents});
}

export function contextualizeBlockStatic(section, contextualization, renderingParams) {
  const figuresCount = section.figuresCount + 1;
  const elRe = new RegExp('<BlockContextualization id="' + contextualization.citeKey + '"[^>]*>(.*)</BlockContextualization>');
  const resources = contextualization.resources.reduce((list, resKey) =>{
    const resource = section.resources.find((oRes) =>{
      return oRes.citeKey === resKey;
    });
    list.push(resource);
    return list;
  }, []);
  let match;
  const newContents = section.contents.map((block, index) =>{
    match = block.html.match(elRe);
    if (match) {
      const caption = (match[1] || contextualization.title || resources[0].title);
      const gallery = ReactDOMServer.renderToStaticMarkup(<StaticImageGallery resources={resources} captionContent={caption} figureNumber={figuresCount}/>);
      // const gallery = formatImagesGallery(resources, contextualization, comment, figuresCount);
      return {
        html: gallery,
        tagType: 'div'
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

export function contextualizeInlineDynamic(section, contextualization, renderingParams) {
  return section;
}

export function contextualizeBlockDynamic(section, contextualization, renderingParams) {
  return section;
}
