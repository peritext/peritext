'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.composeRenderedSections = undefined;

var _referenceUtils = require('./../../core/utils/referenceUtils');

var _sectionUtils = require('./../../core/utils/sectionUtils');

var composeRenderedSections = exports.composeRenderedSections = function composeRenderedSections(sections, settings, inputStyle, messages) {
  var renderedSections = sections.slice();
  var style = inputStyle;
  // transform regarding notes display settings
  if (settings.notesPosition === 'footnotes') {
    style += '.peritext-static-note-content-container\n            {\n                display: prince-footnote;\n                counter-increment: footnote;\n            }';
  } else if (settings.notesPosition === 'document-end') {
    (function () {
      var noteNumber = 0;
      var contents = sections.reduce(function (notes, section2) {
        return notes.concat(section2.notes.map(function (note) {
          return Object.assign(note, { noteNumber: ++noteNumber });
        }));
      }, []);
      renderedSections.push({
        type: 'endnotes',
        contents: contents,
        title: messages.end_notes,
        id: 'peritext-end-notes'
      });
    })();
  }

  // handle figures
  if (settings.figuresPosition === 'document-end') {
    var figures = sections.reduce(function (figs, section3) {
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
      contents: (0, _referenceUtils.computeReferences)(sections, settings),
      title: messages.references_title,
      id: 'peritext-end-references'
    });
  }
  // handle glossary
  if (settings.glossaryPosition !== 'none') {
    (function () {
      // prepare glossary
      var glossaryPointers = sections.reduce(function (results, thatSection) {
        var sectionCitekey = (0, _sectionUtils.getMetaValue)(thatSection.metadata, 'general', 'citeKey');
        return results.concat(thatSection.contextualizations.filter(function (thatContextualization) {
          return thatContextualization.contextualizer.type === 'glossary';
        }).reduce(function (localResults, contextualization) {
          return localResults.concat({
            mentionId: '#peritext-content-entity-inline-' + sectionCitekey + '-' + contextualization.citeKey,
            entity: contextualization.resources[0].citeKey,
            alias: contextualization.contextualizer.alias
          });
        }, []));
      }, []);

      var entitiesTypes = ['person', 'place', 'subject', 'concept', 'organization', 'technology', 'artefact'];

      var glossaryData = sections.reduce(function (results, thatSection) {
        return results.concat(thatSection.resources.filter(function (thatResource) {
          return thatResource.inheritedVerticallyFrom === undefined && entitiesTypes.indexOf(thatResource.bibType) > -1;
        }));
      }, []).map(function (glossaryEntry) {
        glossaryEntry.aliases = glossaryPointers.filter(function (pointer) {
          return pointer.entity === glossaryEntry.citeKey;
        }).reduce(function (aliases, entry) {
          var alias = entry.alias || 'no-alias';
          aliases[alias] = aliases[alias] ? aliases[alias].concat(entry) : [entry];
          return aliases;
        }, {});
        return glossaryEntry;
      }).sort(function (entry1, entry2) {
        return (entry1.name || entry1.lastname) > (entry2.name || entry2.lastname) ? 1 : -1;
      });

      var glossary = {
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
    })();
  }

  // handle table of figures
  if (settings.figuresTablePosition !== 'none') {
    // making figures table data
    var figuresTableData = sections.reduce(function (figures, section4) {
      // 1. take numbered figures
      var figuresL = section4.contextualizations.filter(function (cont) {
        return cont.figureNumber !== undefined;
      })
      // 2. filter uniques
      .filter(function (figure, index, self) {
        return self.findIndex(function (other) {
          return other.figureNumber === figure.figureNumber;
        }) === index;
      })
      // 3. make table array
      .map(function (cont) {
        return {
          id: 'peritext-figure-' + cont.figureId,
          number: cont.figureNumber
        };
      });
      return figures.concat(figuresL);
    }, []);
    var figuresTable = {
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
    var tocData = renderedSections.filter(function (sectio, index) {
      return index > 0;
    }).map(function (thisSection) {
      return {
        id: thisSection.metadata ? (0, _sectionUtils.getMetaValue)(thisSection.metadata, 'general', 'citeKey') : thisSection.id,
        title: thisSection.metadata ? (0, _sectionUtils.getMetaValue)(thisSection.metadata, 'general', 'title') : thisSection.title,
        level: thisSection.metadata ? (0, _sectionUtils.getMetaValue)(thisSection.metadata, 'general', 'generalityLevel') : 0
      };
    });
    var toc = { type: 'table-of-contents', contents: tocData };
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
    renderedSections: renderedSections,
    finalStyle: style
  };
};