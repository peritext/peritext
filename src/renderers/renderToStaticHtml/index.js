import {waterfall} from 'async';
import {readFile} from 'fs';
import {resolve} from 'path';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import {IntlProvider} from 'react-intl';

import resolveDataDependencies from './../../core/resolvers/resolveDataDependencies';
import {getMetaValue} from './../../core/utils/sectionUtils';
import {sectionTypeModels, settingsModels} from './../../core/models';
import {resolveContextualizationsImplementation, resolveContextualizationsRelations} from './../../core/resolvers/resolveContextualizations';
import {computeReferences} from './../../core/utils/referenceUtils';
import {
  StaticDocument,
  StaticFootnote,
  StaticNotePointer
} from './../../core/components';

const defaultStylesPath = './../../config/defaultStyles/';

const listChildren = (sections, key)=> {
  let output = [];
  sections.forEach((thatSection) =>{
    if (thatSection.parent === key) {
      output = output.concat(thatSection);
      const thatKey = getMetaValue(thatSection.metadata, 'general', 'citeKey');
      output = output.concat(listChildren(sections, thatKey));
    }
  });
  return output;
};

const resolveNode = (node, section, settings) =>{
  if (node.tag === 'note') {
    const note = section.notes.find(thatNote =>{
      return thatNote.id === node.target;
    });
    node.props = {note};
    if (settings.notesPosition === 'footnotes') {
      node.tag = StaticFootnote;
    } else {
      node.tag = StaticNotePointer;
    }
    node.special = true;
  }
  if (node.child) {
    node.child = node.child.map(child =>{
      return resolveNode(child, section, settings);
    });
  }
  return node;
};

const setSectionContents = (section, settings) =>{
  return section.contents.map(node => {
    return resolveNode(node, section, settings);
  });
};

export default function renderSection({
  section,
  sectionList,
  settings = {},
  includeChildren = true
}, assetsController, assetsParams, rendererCallback) {

  // populate rendering params with defaults if needed
  // todo : resolve in a separate file (modelUtils)
  for (const param in settingsModels) {
    if (settings[param] === undefined) {
      settings[param] = settingsModels[param].default;
    }
  }

  // always work with a list of sections, even if just one
  let sectios = [section];
  let style = '';
  const motherKey = getMetaValue(section.metadata, 'general', 'citeKey');
  // delimitate the sections to render - if includeChildren is enabled filter parented
  if (includeChildren) {
    sectios = sectios.concat(listChildren(sectionList, motherKey));
  }
  waterfall([
    // load default css rules
    (cback) =>{
      readFile(resolve(__dirname + defaultStylesPath + 'global.css'), (err, contents)=> {
        if (!err) {
          style += contents;
        }
        cback(err, sectios);
      });
    // load default paged-related css rules
    }, (sections, cback) =>{
      readFile(resolve(__dirname + defaultStylesPath + 'page.css'), (err, contents)=> {
        if (!err) {
          style += contents;
        }
        cback(err, sections);
      });
    }, (inputSections, depCallback) =>{
      resolveDataDependencies(inputSections, assetsController, assetsParams, depCallback);
    // build html code
    }, (inputSections, cback) =>{
      let sections = inputSections.slice();
      // build final css code (default + user-generated customizers)
      const cssCustomizers = sections[0].customizers && sections[0].customizers.styles;
      if (cssCustomizers !== undefined) {
        for (const name in cssCustomizers) {
          if (name !== 'screen.css') {
            style += '\n\n' + cssCustomizers[name];
          }
        }
      }
       // prepare translations
      const lang = getMetaValue(sections[0].metadata, 'general', 'language') || 'en';
      const messages = require('./../../../translations/locales/' + lang + '.json');
      // build metadata (todo : check if react-based helmet lib could cover "rare" metadata props like dublincore ones)
      const metaHead = sections[0].metadata
                    .filter((meta) =>{
                      return meta.htmlHead;
                    })
                    .reduce((exp, meta) =>{
                      return exp + meta.htmlHead;
                    }, '') + '<meta name="generator" content="peritext"/>';
      // order contextualizations (ibid/opCit, ...)
      sections = resolveContextualizationsRelations(sections, settings);
      // resolve contextualizations js representation according to settings
      let figuresCount = 0;
      sections = sections.map((sectio, index) =>{
        sectio.figuresCount = figuresCount;
        const newSection = resolveContextualizationsImplementation(sectio, 'static', settings);
        figuresCount = newSection.figuresCount;
        return newSection;
      });
      // transform input js abstraction of contents to a js abstraction specific to rendering settings
      sections = sections.map(section1 => {
        const contents = setSectionContents(section1, settings);
        return Object.assign(section1, contents, {type: 'contents'});
      });
      const renderedSections = sections.slice();
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
      const sectionType = getMetaValue(sections[0].metadata, 'general', 'bibType');
      if (sectionTypeModels.acceptedTypes[sectionType].needsCover) {
        settings.hasCover = true;
        renderedSections.splice(0, 0, {
          type: 'front-cover',
          metadata: sections[0].metadata
        });
        renderedSections.push({
          type: 'back-cover',
          metadata: sections[0].metadata
        });
      }
      // render document
      const renderedContents = ReactDOMServer.renderToStaticMarkup(
        <IntlProvider locale={lang} messages={messages}>
          <StaticDocument sections={renderedSections} settings={settings} />
        </IntlProvider>);
      const html = `
<!doctype:html>
<html>
  <head>
    ${metaHead}
    <style>
      ${style}
    </style>
  </head>
  <body>
    ${renderedContents}
   </body>
</html>`.replace(/itemscope=""/g, 'itemscope');
      cback(null, html);
    }
  ], rendererCallback);
}
