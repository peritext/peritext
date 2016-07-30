export const contextualizeInlineStatic = (inputSection, inputContextualization, settings) => {
  const contextualization = Object.assign({}, inputContextualization);
  const formatter = require('./../../referencers/' + settings.citationStyle + '.js');
  const node = contextualization.node;
  const props = {
    contextualization,
    resource: contextualization.resources[0],
    ibid: contextualization.sectionIbid,
    opCit: contextualization.sectionOpCit
  };
  // citation text --> wrap in span > q + citation
  if (node.child) {
    const citation = {
      node: 'element',
      special: true,
      tag: formatter.InlineCitation,
      props
    };
    const child = node.child.slice();
    const quote = {
      attr: {
        class: 'peritext-quote-container',
        id: contextualization.citeKey
      },
      node: 'element',
      tag: 'q',
      child
    };
    node.node = 'element';
    node.tag = 'span';
    node.child = [
      quote,
      {
        node: 'text',
        text: ' ('
      },
      citation,
      {
        node: 'text',
        text: ')'
      }
    ];
  } else {
    node.special = true;
    node.tag = formatter.InlineCitation;
    node.props = props;
  }
  return Object.assign({}, inputSection);
};

export const contextualizeBlockStatic = (inputSection, inputContextualization, settings) => {
  const contextualization = Object.assign({}, inputContextualization);
  const formatter = require('./../../referencers/' + settings.citationStyle + '.js');
  const node = contextualization.node;
  const props = {
    contextualization,
    resource: contextualization.resources[0],
    ibid: contextualization.sectionIbid,
    opCit: contextualization.sectionOpCit
  };
  node.special = true;
  node.tag = formatter.BlockCitation;
  node.props = props;
  return Object.assign({}, inputSection);
};

export const contextualizeInlineDynamic = (section, contextualization, settings) => {
  return section;
};

export const contextualizeBlockDynamic = (section, contextualization, settings) => {
  return section;
};
