import React from 'react';
import ReactDOMServer from 'react-dom/server';

export function contextualizeInlineStatic(inputSection, inputContextualization, renderingParams) {
  const section = Object.assign({}, inputSection);
  const contextualization = Object.assign({}, inputContextualization);
  let res;
  let withQuotes;
  const formatter = require('./../../utils/citationUtils/' + renderingParams.citationStyle + '.js');
  const InlineCitation = formatter.InlineCitation;

  // handle each resource separately (if several citations together)
  const expression = contextualization.resources.map((resourceKey) =>{
    res = section.resources.find((res2) =>{
      return res2.citeKey === resourceKey;
    });

    // todo : generate COiNS here
    // apply appropriate html citation formatter
    return ReactDOMServer.renderToStaticMarkup(<InlineCitation resource={res} contextualization={contextualization} ibid={contextualization.sectionIbid} opCit={contextualization.sectionOpCit}/>);
  }).join(', ');

  // interpolate html
  const elRe = new RegExp('<InlineContextualization id="' + contextualization.citeKey + '"[^>]*>(.*)</InlineContextualization>');
  let match;
  // console.log('looking for ', contextualization.citeKey, 'to replace with ', expression);
  const newContents = section.contents.map((block) =>{
    let outputHtml;
    match = block.html.match(elRe);
    if (match) {
      withQuotes = match[1].trim().length;
      // attaching cite tag to the whole block
      if (block.tagType === 'blockquote') {
        outputHtml = block.html.trim().substr(0, block.html.length - '</blockquote>'.length) + '<footer>' + expression + '</footer></blockquote>';
      } else {
        const newExpression = (withQuotes ? '<q id="' + contextualization.citeKey + '"  class="peritext-contents-inline-quoted">' + match[1] + '</q> (' : '') + expression;
        outputHtml = block.html.substr(0, match.index) + newExpression + (withQuotes ? ')' : '') + block.html.substr(match.index + match[0].length);
      }
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
  let res;
  const formatter = require('./../../utils/citationUtils/' + renderingParams.citationStyle + '.js');
  const BlockCitation = formatter.BlockCitation;

  // handle each resource separately (if several citations together)
  const expression = contextualization.resources.map((resourceKey) =>{
    res = section.resources.find((res2) =>{
      return res2.citeKey === resourceKey;
    });

    // todo : generate COiNS here
    // apply appropriate html citation formatter
    return ReactDOMServer.renderToStaticMarkup(<BlockCitation resource={res} contextualization={contextualization} ibid={contextualization.sectionIbid} opCit={contextualization.sectionOpCit}/>);
    // return formatter.formatBlockCitation(contextualization, res, ibid, opCit);
  }).join(', ');

  // interpolate html
  const elRe = new RegExp('<BlockContextualization id="' + contextualization.citeKey + '"[^>]*>(.*)</BlockContextualization>');
  let match;
  const newContents = section.contents.map((block) =>{
    let outputHtml;
    match = block.html.match(elRe);
    if (match) {
      outputHtml = '<p>' + expression + '</p>';
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

export function contextualizeInlineDynamic(section, contextualization, renderingParams) {
  return section;
}

export function contextualizeBlockDynamic(section, contextualization, renderingParams) {
  return section;
}
