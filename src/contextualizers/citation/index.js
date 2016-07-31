/**
 * Citation contextualizer that resolve sections data according to contextualization+settings params
 * @module contextualizers/citation
 */

/**
 * Handle an inline contextualization for static outputs
 * @param {Object} inputSection - The representation of the peritext section to update
 * @param {Object} inputContextualization - The representation of the contextualization to resolve
 * @param {Object} settings - the specific rendering settings to use for resolving the contextualization
 * @return {Object} newSection - the updated representation of the peritext section in which the contextualization was made
 */
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

/**
 * Handle a block contextualization for static outputs
 * @param {Object} inputSection - The representation of the peritext section to update
 * @param {Object} inputContextualization - The representation of the contextualization to resolve
 * @param {Object} settings - the specific rendering settings to use for resolving the contextualization
 * @return {Object} newSection - the updated representation of the peritext section in which the contextualization was made
 */
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

/**
 * Handle an inline contextualization for dynamic outputs
 * @param {Object} inputSection - The representation of the peritext section to update
 * @param {Object} inputContextualization - The representation of the contextualization to resolve
 * @param {Object} settings - the specific rendering settings to use for resolving the contextualization
 * @return {Object} newSection - the updated representation of the peritext section in which the contextualization was made
 */
export const contextualizeInlineDynamic = (section, contextualization, settings) => {
  return section;
};

/**
 * Handle an block contextualization for dynamic outputs
 * @param {Object} inputSection - The representation of the peritext section to update
 * @param {Object} inputContextualization - The representation of the contextualization to resolve
 * @param {Object} settings - the specific rendering settings to use for resolving the contextualization
 * @return {Object} newSection - the updated representation of the peritext section in which the contextualization was made
 */
export const contextualizeBlockDynamic = (section, contextualization, settings) => {
  return section;
};
