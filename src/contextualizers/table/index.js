/**
 * Table contextualizer that resolve sections data according to contextualization+settings params
 * @module contextualizers/table
 */
import { get as getByPath } from 'object-path';

import StaticTable from './StaticTable';

/**
 * Handle an inline contextualization for static outputs
 * @param {Object} inputDocument - The representation of the peritext document to update
 * @param {Object} inputContextualization - The representation of the contextualization to resolve
 * @param {Object} settings - the specific rendering settings to use for resolving the contextualization
 * @return {Object} newDocument - the updated representation of the peritext document in which the contextualization was made
 */
export const contextualizeInlineStatic = (inputDocument, inputContextualization, settings) => {
  const document = Object.assign({}, inputDocument);
  const contextualization = Object.assign({}, inputContextualization);
  const sectionCiteKey = contextualization.nodePath[0];
  const path = ['sections', ...contextualization.nodePath.slice()];
  const node = getByPath(document, path);
  const section = document.sections[sectionCiteKey];
  const data = document.data[contextualization.resources[0]];
  const nodeBlockIndex = path[3];
  let figureId;
  let number;
  const contents = node.child;
  // if figure is not there yet, add it
  if (!contextualization.sectionOpCit) {
    figureId = sectionCiteKey + '-' + contextualization.citeKey;
    contextualization.figureId = figureId;
    document.figuresCount = document.figuresCount ? document.figuresCount + 1 : 1;
    contextualization.figureNumber = document.figuresCount;
    contextualization.figureId = figureId;
    const figure = {
      node: 'element',
      special: true,
      tag: StaticTable,
      props: {
        resources: contextualization.resources.map(key => document.resources[key]),
        data,
        captionContent: [{
          node: 'text',
          text: contextualization.title || document.resources[contextualization.resources[0]].title
        }],
        figureNumber: contextualization.figureNumber,
        id: figureId
      }
    };
    number = contextualization.figureNumber;
    if (settings.figuresPosition === 'inline') {
      // insert block
      section.contents = [
        ...section.contents.slice(0, nodeBlockIndex),
        figure,
        ...section.contents.slice(nodeBlockIndex)
      ];
      const newNodePath = [sectionCiteKey, 'contents', nodeBlockIndex + 1];
      document.contextualizations[contextualization.citeKey].nodePath = newNodePath;
      // update contextualizations that target subsequent contents blocks
      Object
      .keys(document.contextualizations)
      .map(key => document.contextualizations[key])
      .filter(cont =>
        cont.nodePath.slice(0, 2).join() === newNodePath.slice(0, 2).join()
        && cont.nodePath[2] > nodeBlockIndex
      )
      .forEach(cont => {
        cont.nodePath[2]++;
      });
    } else {
      section.figures = section.figures ? section.figures.concat(figure) : [figure];
    }
  } else {
    figureId = sectionCiteKey + '-' + contextualization.precursorCiteKey;
    number = document.contextualizations[contextualization.precursorCiteKey].figureNumber;
  }
  const displayId = '#peritext-figure-' + figureId;
  const newContents = [
    ...contents.slice(),
    {
      node: 'text',
      text: ' ('
    },
    {
      node: 'element',
      tag: 'a',
      attr: {
        href: displayId
      },
      child: [
        {
          node: 'text',
          text: 'figure ' + number
        }
      ]
    },
    {
      node: 'text',
      text: ') '
    }
  ];
  node.tag = 'span';
  node.child = newContents;
  document.contextualizations[contextualization.citeKey] = contextualization;
  return document;
};

/**
 * Handle a block contextualization for static outputs
 * @param {Object} inputDocument - The representation of the peritext document to update
 * @param {Object} inputContextualization - The representation of the contextualization to resolve
 * @param {Object} settings - the specific rendering settings to use for resolving the contextualization
 * @return {Object} newDocument - the updated representation of the peritext document in which the contextualization was made
 */
export const contextualizeBlockStatic = (inputDocument, inputContextualization, settings) => {
  return Object.assign({}, inputDocument);
};

/**
 * Handle an inline contextualization for dynamic outputs
 * @param {Object} inputDocument - The representation of the peritext document to update
 * @param {Object} inputContextualization - The representation of the contextualization to resolve
 * @param {Object} settings - the specific rendering settings to use for resolving the contextualization
 * @return {Object} newDocument - the updated representation of the peritext document in which the contextualization was made
 */
export const contextualizeInlineDynamic = (inputDocument, inputContextualization, settings) => {
  return Object.assign({}, inputDocument);
};

/**
 * Handle a block contextualization for dynamic outputs
 * @param {Object} inputDocument - The representation of the peritext document to update
 * @param {Object} inputContextualization - The representation of the contextualization to resolve
 * @param {Object} settings - the specific rendering settings to use for resolving the contextualization
 * @return {Object} newDocument - the updated representation of the peritext document in which the contextualization was made
 */
export const contextualizeBlockDynamic = (inputDocument, inputContextualization, settings) => {
  return Object.assign({}, inputDocument);
};
