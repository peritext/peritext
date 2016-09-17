'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.composeRenderedSections = undefined;

var _referenceUtils = require('./../../core/utils/referenceUtils');

var _getters = require('./../../core/getters');

/**
 * Resolves a sections' list against rendering settings by modifying contents, adding output-related pseudo-sections, and updating css styles
 * @param {array} sections - the sections to render
 * @param {Object} document - the document reference
 * @param {Object} settings - the specific rendering settings to use in order to produce the output
 * @param {string} inputStyle - the css style data to use
 * @param {array} messages - the intl messages to use for some sections localization (e.g. : translation of "Table of contents")
 * @return {Object} results - an object composed of an array of rendered sections and a string with the updated css styles
 */
/**
 * Shared static rendering utils
 * @module renderers/sharedStaticUtils
 */

var composeRenderedSections = exports.composeRenderedSections = function composeRenderedSections() {
  var sections = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
  var document = arguments[1];
  var settings = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
  var inputStyle = arguments.length <= 3 || arguments[3] === undefined ? '' : arguments[3];
  var messages = arguments.length <= 4 || arguments[4] === undefined ? [] : arguments[4];

  var renderedSections = sections.slice();
  var style = typeof inputStyle === 'string' ? inputStyle : '';
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
      if (contents.length) {
        renderedSections.push({
          type: 'endnotes',
          contents: contents,
          title: messages.end_notes,
          id: 'peritext-end-notes'
        });
      }
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
    var refs = (0, _referenceUtils.computeReferences)(sections, document, settings);
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
    var glossaryData = (0, _getters.getGlossary)(document);
    var glossary = {
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
    var figuresTableData = sections.reduce(function (figures, section4) {
      // 1. take numbered figures
      var figuresL = section4.contextualizations.filter(function (cont) {
        return document.contextualizations[cont].figureNumber !== undefined;
      }).map(function (contKey) {
        return document.contextualizations[contKey];
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
    if (settings.figuresTablePosition === 'begining' && figuresTable.contents.length) {
      renderedSections.splice(0, 0, figuresTable);
    } else if (figuresTable.contents.length) {
      renderedSections.push(figuresTable);
    }
  }

  // handle print table of contents
  if (settings.contentsTablePosition !== 'none') {
    var tocData = renderedSections.map(function (thisSection) {
      return {
        id: thisSection.metadata ? thisSection.metadata.general.id.value : thisSection.id,
        title: thisSection.metadata ? thisSection.metadata.general.title.value : thisSection.title,
        level: thisSection.metadata ? thisSection.metadata.general.generalityLevel.value : 0
      };
    });
    var toc = { type: 'table-of-contents', contents: tocData };
    if (settings.contentsTablePosition === 'begining' && toc.contents.length) {
      renderedSections.splice(0, 0, toc);
    } else if (toc.contents.length) {
      renderedSections.push(toc);
    }
  }
  // handle forewords
  renderedSections.splice(0, 0, Object.assign({}, document.forewords, { type: 'forewords' }));
  // handle cover
  if (settings.showCovers === 'yes') {
    renderedSections.splice(0, 0, {
      type: 'front-cover',
      metadata: document.metadata
    });
    renderedSections.push({
      type: 'back-cover',
      metadata: document.metadata
    });
  }
  return {
    renderedSections: renderedSections,
    finalStyle: style
  };
};