import {formatLink} from './../../utils/microDataUtils';


export function contextualizeInlineStatic(section, contextualization) {
  const elRe = new RegExp('<InlineContextualization id="' + contextualization.citeKey + '"[^>]*>(.*)</InlineContextualization>');
  let match;
  const resource = section.resources.find((res) =>{
    return res.citeKey === contextualization.resources[0];
  });
  const newContents = section.contents.map((block) =>{
    match = block.html.match(elRe);
    if (match) {
      const outputHtml = block.html.substr(0, match.index) + match[1] + '[^]{' + formatLink(resource, resource.url) + '}' + block.html.substr(match.index + match[0].length);
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
  return section;
}

export function contextualizeInlineDynamic(section, contextualization) {
  return section;
}

export function contextualizeBlockDynamic(section, contextualization) {
  return section;
}
