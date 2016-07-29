import {StructuredHyperLink} from './../../core/components';
import StaticWebsitePoster from './StaticWebsitePoster.js';
import {getMetaValue} from './../../core/utils/sectionUtils';

export function contextualizeInlineStatic(inputSection, inputContextualization, settings) {
  const section = Object.assign({}, inputSection);
  const contextualization = Object.assign({}, inputContextualization);
  const citeKey = getMetaValue(section.metadata, 'general', 'citeKey');
  const node = contextualization.node;
  const link = {
    node: 'element',
    tag: StructuredHyperLink,
    special: true,
    props: {
      resource: contextualization.resources[0],
      contents: [{
        node: 'text',
        text: contextualization.resources[0].url
      }]
    }
  };
  const noteNumber = section.notes.length + 1;
  const noteId = citeKey + noteNumber;
  section.notes.push({
    noteNumber,
    contents: [link],
    id: noteId
  });
  node.child = [
    ...node.child,
    {
      element: 'node',
      tag: 'note',
      target: noteId
    }
  ];

  return Object.assign({}, section);
}

export function contextualizeBlockStatic(inputSection, inputContextualization, settings) {
  const section = Object.assign({}, inputSection);
  const contextualization = Object.assign({}, inputContextualization);
  const citeKey = getMetaValue(section.metadata, 'general', 'citeKey');
  const node = contextualization.node;
  const blockIndex = node.blockIndex;
  let figureId;
  section.figuresCount ++;
  figureId = citeKey + '-' + contextualization.citeKey;
  contextualization.figureId = figureId;
  contextualization.figureNumber = section.figuresCount;
  const figure = {
    node: 'element',
    special: true,
    tag: StaticWebsitePoster,
    props: {
      imageKey: 'posterurl',
      resource: contextualization.resources[0],
      captionContent: node.child[0].child,
      figureNumber: contextualization.figureNumber,
      id: figureId
    }
  };
  if (settings.figuresPosition === 'inline') {
    section.contents[blockIndex + section.figuresCount - 1] = figure;
  } else {
    section.figures = section.figures ? section.figures.concat(figure) : [figure];
  }
  section.contextualizations = section.contextualizations.map(cont=> {
    if (cont.citeKey === contextualization.citeKey) {
      return contextualization;
    }
    return cont;
  });
  return Object.assign({}, section);
}

export function contextualizeInlineDynamic(section, contextualization, settings) {
  return section;
}

export function contextualizeBlockDynamic(section, contextualization, settings) {
  return section;
}
