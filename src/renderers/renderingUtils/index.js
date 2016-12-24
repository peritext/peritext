/**
 * Shared static rendering utils
 * @module renderers/sharedStaticUtils
 */

import {
  computeReferences
} from './../../core/utils/referenceUtils';
import {
  getGlossary,
} from './../../core/getters';

/**
 * Resolves a sections' list against rendering settings by modifying contents, adding output-related pseudo-sections, and updating css styles
 * @param {array} sections - the sections to render
 * @param {Object} document - the document reference
 * @param {Object} settings - the specific rendering settings to use in order to produce the output
 * @param {string} inputStyle - the css style data to use
 * @param {array} messages - the intl messages to use for some sections localization (e.g. : translation of "Table of contents")
 * @return {Object} results - an object composed of an array of rendered sections and a string with the updated css styles
 */
export const composeRenderedSections = (sections = [], document, settings = {}, inputStyle = '', messages = []) =>{
  const renderedSections = sections.slice();
  let style = typeof inputStyle === 'string' ? inputStyle : '';
  // transform regarding notes display settings
  if (settings.notesPosition === 'footnotes') {
    style += `.peritext-static-note-content-container
            {
                display: prince-footnote;
                counter-increment: footnote;
            }`;
  } else if (settings.notesPosition === 'document-end') {
    let noteNumber = 0;
    const contents = sections.reduce((notes, section2) =>{
      return notes.concat(section2.notes.map(note =>{
        return Object.assign(note, {noteNumber: ++noteNumber});
      }));
    }, []);
    if (contents.length) {
      renderedSections.push({
        type: 'endnotes',
        contents,
        title: messages.end_notes,
        id: 'peritext-end-notes'
      });
    }
  }

  // handle figures
  if (settings.figuresPosition === 'document-end') {
    const figures = sections.reduce((figs, section3)=>{
      if (section3.figures) {
        return figs.concat(section3.figures);
      }
      return figs;
    }, []);
    if (figures.length) {
      renderedSections.push({
        type: 'endfigures',
        contents: figures,
        title: messages.end_figures,
        id: 'peritext-end-figures'
      });
    }
  }

  // build references/bibliography
  if (settings.referenceScope === 'document') {
    const refs = computeReferences(document, settings);
    if (refs.length) {
      renderedSections.push({
        type: 'references',
        contents: refs,
        title: messages.references_title,
        id: 'peritext-end-references'
      });
    }
  }
  // handle glossary
  if (settings.glossaryPosition !== 'none') {
    // prepare glossary
    const glossaryData = getGlossary(document);
    const glossary = {
      type: 'glossary',
      contents: glossaryData,
      title: messages.glossary,
      id: 'peritext-end-glossary'
    };
    if (settings.glossaryPosition === 'begining' && glossary.contents.length) {
      renderedSections.splice(0, 0, glossary);
    } else if (glossary.contents.length) {
      renderedSections.push(glossary);
    }
  }

  // handle table of figures
  if (settings.figuresTablePosition !== 'none') {
    // making figures table data
    const figuresTableData = sections.reduce((figures, section4)=> {
      // 1. take numbered figures
      const figuresL = section4.contextualizations.filter((cont)=> {
        return document.contextualizations[cont].figureNumber !== undefined;
      })
      .map(contKey => document.contextualizations[contKey])
      // 2. filter uniques
      .filter((figure, index, self) => self.findIndex((other) => {
        return other.figureNumber === figure.figureNumber;
      }) === index)
      // 3. make table array
      .map((cont)=> {
        return {
          id: 'peritext-figure-' + cont.figureId,
          number: cont.figureNumber
        };
      });
      return figures.concat(figuresL);
    }, []);

    const figuresTable = {
      type: 'table-of-figures',
      contents: figuresTableData,
      title: messages.table_of_figures,
      id: 'peritext-end-table-of-figures'
    };
    if (settings.figuresTablePosition === 'begining' && figuresTable.contents.length) {
      renderedSections.splice(0, 0, figuresTable);
    } else if (figuresTable.contents.length) {
      renderedSections.push(figuresTable);
    }
  }

  // handle print table of contents
  if (settings.contentsTablePosition !== 'none') {
    const tocData = renderedSections.map((thisSection) => {
      return {
        id: thisSection.metadata ? thisSection.metadata.general.id.value : thisSection.id,
        title: thisSection.metadata ? thisSection.metadata.general.title.value : thisSection.title,
        level: thisSection.metadata ? thisSection.metadata.general.generalityLevel.value : 0
      };
    });
    const toc = {
      type: 'table-of-contents',
      title: messages.table_of_contents,
      contents: tocData
    };
    if (settings.contentsTablePosition === 'begining' && toc.contents.length) {
      renderedSections.splice(0, 0, toc);
    } else if (toc.contents.length) {
      renderedSections.push(toc);
    }
  }
  // handle forewords
  renderedSections.splice(0, 0, Object.assign({}, document.forewords, {
    type: 'forewords',
    title: messages.forewords,
  }));
  // handle cover
  if (settings.showCovers === 'yes') {
    renderedSections.splice(0, 0, {
      type: 'front-cover',
      title: document.metadata.general.title.value,
      metadata: document.metadata
    });
    renderedSections.push({
      type: 'back-cover',
      title: document.metadata.general.title.value,
      metadata: document.metadata
    });
  }
  return {
    renderedSections,
    finalStyle: style
  };
};

const resolveStaticNode = (inputNode, section, settings) =>{
  const node = Object.assign({}, inputNode);
  if (node.tag === 'note') {
    const note = section.notes.find(thatNote =>{
      return thatNote.id === node.target;
    });
    node.props = {note};
    if (settings.notesPosition === 'footnotes') {
      node.tag = 'StaticFootnote';
    } else {
      node.tag = 'StaticNotePointer';
    }
    node.special = true;
  }
  if (node.children) {
    node.children = node.children.map(child =>{
      return resolveStaticNode(child, section, settings);
    });
  }
  return node;
};

export const setStaticSectionContents = (section, key, settings) =>
  section[key].map(node => resolveStaticNode(node, section, settings));

const resolveDynamicNode = (inputNode, section, settings) =>{
  const node = Object.assign({}, inputNode);
  if (node.tag === 'note') {
    const note = section.notes.find(thatNote =>{
      return thatNote.id === node.target;
    });
    node.props = {note};
    node.tag = 'DynamicNotePointer';
    node.special = true;
  }
  if (node.children) {
    node.children = node.children.map(child =>{
      return resolveDynamicNode(child, section, settings);
    });
  }
  return node;
};

export const setDynamicSectionContents = (section, key, settings) =>
  section[key].map(node => resolveDynamicNode(node, section, settings));
