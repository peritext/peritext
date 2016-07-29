import StaticImageGallery from './StaticImageGallery.js';
import {getMetaValue} from './../../core/utils/sectionUtils';

export function contextualizeInlineStatic(inputSection, inputContextualization, settings) {
  const section = Object.assign({}, inputSection);
  const contextualization = Object.assign({}, inputContextualization);
  const citeKey = getMetaValue(section.metadata, 'general', 'citeKey');
  const node = contextualization.node;
  const blockIndex = node.blockIndex;
  let figureId;
  let number;
  const contents = node.child;
  // figure is not there yet, add it
  if (!contextualization.sectionOpCit) {
    section.figuresCount ++;
    figureId = citeKey + '-' + contextualization.citeKey;
    contextualization.figureId = figureId;
    contextualization.figureNumber = section.figuresCount;
    const figure = {
      node: 'element',
      special: true,
      tag: StaticImageGallery,
      props: {
        resources: contextualization.resources,
        captionContent: [{
          node: 'text',
          text: contextualization.title || contextualization.resources[0].title
        }],
        figureNumber: contextualization.figureNumber,
        id: figureId
      }
    };
    number = contextualization.figureNumber;
    if (settings.figuresPosition === 'inline') {
      section.contents.splice(blockIndex + section.figuresCount, 0, figure);
    } else {
      section.figures = section.figures ? section.figures.concat(figure) : [figure];
    }
  } else {
    figureId = citeKey + '-' + contextualization.precursorCiteKey;
    section.contextualizations.some(cont =>{
      if (cont.citeKey === contextualization.precursorCiteKey) {
        number = cont.figureNumber;
        return true;
      }
    });
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
  section.contextualizations = section.contextualizations.map(cont=> {
    if (cont.citeKey === contextualization.citeKey) {
      return contextualization;
    }
    return cont;
  });
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
    tag: StaticImageGallery,
    props: {
      resources: contextualization.resources,
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
