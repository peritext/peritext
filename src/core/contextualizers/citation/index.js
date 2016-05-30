import {getMetaValue} from './../../utils/sectionUtils/';

export function contextualizeInlineStatic(inputSection, contextualization) {
  const section = Object.assign({}, inputSection);
  let res;
  let cnIndex;
  let previous;
  let withQuotes;
  const citationStyle = getMetaValue(section.metadata, 'general', 'citationStyle');
  const formatter = require('./../../utils/citationUtils/' + citationStyle + '.js');
  // find this citation in citations list
  section.contextualizations.some((context, index) =>{
    if (context.citeKey === contextualization.citeKey) {
      cnIndex = index;
      return true;
    }
  });
  // find previous citation
  for (let index = cnIndex - 1; index >= 0; index --) {
    if (section.contextualizations[index].contextualizerType === 'citation') {
      previous = section.contextualizations[index];
    }
  }

  let ibid;
  let opCit;
  // handle each resource separately (if several citations together)
  const expression = contextualization.resources.map((resourceKey) =>{
    res = section.resources.find((res2) =>{
      return res2.citeKey === resourceKey;
    });

    // look in immediately previous citation if sameRes (ibid)
    if (previous) {
      previous.resources.some((resK2) =>{
        // same res
        if (resK2 === resourceKey) {
          ibid = true;
          return true;
        }
      });
    }
    // if not sameRes (ibid) look for same res in remotely previous citations (op cit)
    if (previous && !ibid) {
      for (let index = cnIndex - 1; index >= 0; index --) {
        if (section.contextualizations[index].contextualizerType === 'citation') {
          const otherPrevious = section.contextualizations[index];
          otherPrevious.resources.some((resK2) =>{
            // same res
            if (resK2 === resourceKey) {
              opCit = true;
              return true;
            }
          });
        }
      }
    }
    // todo : generate COiNS here
    // apply appropriate html citation formatter
    return formatter.formatInlineCitation(contextualization, res, ibid, opCit);
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
        const newExpression = (withQuotes ? '<q id="' + contextualization.citeKey + '"  class="modulo-contents-inline-quoted">' + match[1] + '</q> (' : '') + expression;
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
  return Object.assign({}, inputSection, {contents: newContents});
}

export function contextualizeBlockStatic(inputSection, contextualization) {
  const section = Object.assign({}, inputSection);
  let res;
  let cnIndex;
  let previous;
  const citationStyle = getMetaValue(section.metadata, 'general', 'citationStyle');
  const formatter = require('./../../utils/citationUtils/' + citationStyle + '.js');
  // find previous citation
  section.contextualizations.some((context, index) =>{
    if (context.citeKey === contextualization.citeKey) {
      cnIndex = index;
      return true;
    }
  });
  for (let index = cnIndex - 1; index >= 0; index --) {
    if (section.contextualizations[index].contextualizerType === 'citation') {
      previous = section.contextualizations[index];
    }
  }
  let ibid;
  let opCit;
  // handle each resource separately (if several citations together)
  const expression = contextualization.resources.map((resourceKey) =>{
    res = section.resources.find((res2) =>{
      return res2.citeKey === resourceKey;
    });

    // look in immediately previous citation if sameRes (ibid)
    if (previous) {
      previous.resources.some((resK2) =>{
        // same res
        if (resK2 === resourceKey) {
          ibid = true;
          return true;
        }
      });
    }
    // if not sameRes (ibid) look for same res in remotely previous citations (op cit)
    if (previous && !ibid) {
      for (let index = cnIndex - 1; index >= 0; index --) {
        if (section.contextualizations[index].contextualizerType === 'citation') {
          const otherPrevious = section.contextualizations[index];
          otherPrevious.resources.some((resK2) =>{

            // same res
            if (resK2 === resourceKey) {
              opCit = true;
              return true;
            }
          });
        }
      }
    }
    // todo : generate COiNS here
    // apply appropriate html citation formatter
    return formatter.formatBlockCitation(contextualization, res, ibid, opCit);
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
  return Object.assign({}, inputSection, {contents: newContents});
}

export function contextualizeInlineDynamic(section, contextualization) {
  return section;
}

export function contextualizeBlockDynamic(section, contextualization) {
  return section;
}
