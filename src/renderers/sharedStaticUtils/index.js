/**
 * Shared static rendering utils
 * @module renderers/sharedStaticUtils
 */

import {computeReferences} from './../../core/utils/referenceUtils';
import {getMetaValue} from './../../core/utils/sectionUtils';

/**
 * Resolves a sections' list against rendering settings by modifying contents, adding output-related pseudo-sections, and updating css styles
 * @param {array} sections - the sections to render
 * @param {Object} settings - the specific rendering settings to use in order to produce the output
 * @param {string} inputStyle - the css style data to use
 * @param {array} messages - the intl messages to use for some sections localization (e.g. : translation of "Table of contents")
 */
export const composeRenderedSections = (sections, settings, inputStyle, messages) =>{
  const renderedSections = sections.slice();
  let style = inputStyle;
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
    renderedSections.push({
      type: 'endnotes',
      contents,
      title: messages.end_notes,
      id: 'peritext-end-notes'
    });
  }

  // handle figures
  if (settings.figuresPosition === 'document-end') {
    const figures = sections.reduce((figs, section3)=>{
      if (section3.figures) {
        return figs.concat(section3.figures);
      }
      return figs;
    }, []);
    renderedSections.push({
      type: 'endfigures',
      contents: figures,
      title: messages.end_figures,
      id: 'peritext-end-figures'
    });
  }

  // build references/bibliography
  if (settings.referenceScope === 'document') {
    renderedSections.push({
      type: 'references',
      contents: computeReferences(sections, settings),
      title: messages.references_title,
      id: 'peritext-end-references'
    });
  }
  // handle glossary
  if (settings.glossaryPosition !== 'none') {
    // prepare glossary
    const glossaryPointers = sections.reduce((results, thatSection)=>{
      const sectionCitekey = getMetaValue(thatSection.metadata, 'general', 'citeKey');
      return results.concat(
        thatSection.contextualizations
        .filter((thatContextualization)=> {
          return thatContextualization.contextualizer.type === 'glossary';
        })
        .reduce((localResults, contextualization)=> {
          return localResults.concat({
            mentionId: '#peritext-content-entity-inline-' + sectionCitekey + '-' + contextualization.citeKey,
            entity: contextualization.resources[0].citeKey,
            alias: contextualization.contextualizer.alias
          });
        }, []));
    }, []);

    const entitiesTypes = ['person', 'place', 'subject', 'concept', 'organization', 'technology', 'artefact'];

    const glossaryData = sections.reduce((results, thatSection)=>{
      return results.concat(
        thatSection.resources
        .filter((thatResource)=> {
          return thatResource.inheritedVerticallyFrom === undefined
                  && entitiesTypes.indexOf(thatResource.bibType) > -1;
        })
      );
    }, []).map((glossaryEntry)=> {
      glossaryEntry.aliases = glossaryPointers.filter((pointer)=> {
        return pointer.entity === glossaryEntry.citeKey;
      }).reduce((aliases, entry)=> {
        const alias = entry.alias || 'no-alias';
        aliases[alias] = aliases[alias] ? aliases[alias].concat(entry) : [entry];
        return aliases;
      }, {});
      return glossaryEntry;
    }).sort((entry1, entry2)=> {
      return (entry1.name || entry1.lastname) > (entry2.name || entry2.lastname) ? 1 : -1;
    });

    const glossary = {
      type: 'glossary',
      contents: glossaryData,
      title: messages.glossary,
      id: 'peritext-end-glossary'
    };
    if (settings.glossaryPosition === 'begining') {
      renderedSections.splice(0, 0, glossary);
    } else {
      renderedSections.push(glossary);
    }
  }

  // handle table of figures
  if (settings.figuresTablePosition !== 'none') {
    // making figures table data
    const figuresTableData = sections.reduce((figures, section4)=> {
      // 1. take numbered figures
      const figuresL = section4.contextualizations.filter((cont)=> {
        return cont.figureNumber !== undefined;
      })
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
    if (settings.figuresTablePosition === 'begining') {
      renderedSections.splice(0, 0, figuresTable);
    } else {
      renderedSections.push(figuresTable);
    }
  }

  // handle toc
  if (settings.contentsTablePosition !== 'none') {
    const tocData = renderedSections.filter((sectio, index) =>{
      return index > 0;
    }).map((thisSection) => {
      return {
        id: thisSection.metadata ? getMetaValue(thisSection.metadata, 'general', 'citeKey') : thisSection.id,
        title: thisSection.metadata ? getMetaValue(thisSection.metadata, 'general', 'title') : thisSection.title,
        level: thisSection.metadata ? getMetaValue(thisSection.metadata, 'general', 'generalityLevel') : 0
      };
    });
    const toc = {type: 'table-of-contents', contents: tocData};
    if (settings.contentsTablePosition === 'begining') {
      renderedSections.splice(0, 0, toc);
    } else {
      renderedSections.push(toc);
    }
  }
  // handle cover
  if (settings.showCovers === 'yes') {
    renderedSections.splice(0, 0, {
      type: 'front-cover',
      metadata: sections[0].metadata
    });
    renderedSections.push({
      type: 'back-cover',
      metadata: sections[0].metadata
    });
  }
  return {
    renderedSections,
    finalStyle: style
  };
};
