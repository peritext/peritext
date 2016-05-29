import {formatLink, formatImageFigure} from './../../utils/microDataUtils';


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

  const figuresCount = (section.figuresCount) ? section.figuresCount++ : 1;
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
      const figureMark = '<span class="modulo-contents-figure-mark" id="figure-mark-' + figuresCount + '">Figure ' + figuresCount + ' – </span>';
      const caption = match[1]
                      + (contextualizer.comment ? '. '
                          + contextualizer.comment : '')
                      + (contextualizer.caption ? '. '
                          + contextualizer.caption : '');
      const link = '<a class="modulo-contents-hyperlink" itemprop="url"'
                              + ' target="_blank"'
                              + ' href="'
                              + resource.url
                              + '" >'
                              + resource.url
                              + '</a>';
      const captionContent = figureMark + caption + ' – ' + link;
      const figureHtml = formatImageFigure(resource, 'posterurl', captionContent);
      const outputHtml = block.html.substr(0, match.index) + figureHtml + block.html.substr(match.index + match[0].length);
      return {
        html: outputHtml,
        tagType: block.tagType
      };
    }
    return block;
  });

  return Object.assign({}, section, {figuresCount}, {contents: newContents});
}

export function contextualizeInlineDynamic(section, contextualization) {
  return section;
}

export function contextualizeBlockDynamic(section, contextualization) {
  return section;
}
