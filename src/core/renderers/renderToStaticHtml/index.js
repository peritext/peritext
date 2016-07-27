import {waterfall} from 'async';
import {readFile} from 'fs';
import {resolve} from 'path';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import {IntlProvider} from 'react-intl';

import {getMetaValue} from './../../utils/sectionUtils';
import {sectionTypeModels, settingsModels} from './../../models';
import {eatNotes} from './../../converters/markdownConverter';
import {resolveContextualizationsImplementation, resolveContextualizationsRelations} from './../../resolvers/resolveContextualizations';
import {computeReferences} from './../../utils/referenceUtils';
import {
  StaticDocument
} from './../../components';

const defaultStylesPath = './../../../config/defaultStyles/';

function listChildren(sections, key) {
  let output = [];
  sections.forEach((thatSection) =>{
    if (thatSection.parent === key) {
      output = output.concat(thatSection);
      const thatKey = getMetaValue(thatSection.metadata, 'general', 'citeKey');
      output = output.concat(listChildren(sections, thatKey));
    }
  });
  return output;
}


export default function renderSection({
  section,
  sectionList,
  settings = {},
  includeChildren = true
}, rendererCallback) {

  // populate rendering params with defaults if needed
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
    function(cback) {
      readFile(resolve(__dirname + defaultStylesPath + 'global.css'), function(err, contents) {
        if (!err) {
          style += contents;
        }
        cback(null, sectios);
      });
    // load default paged-related css rules
    }, function(sections, cback) {
      readFile(resolve(__dirname + defaultStylesPath + 'page.css'), function(err, contents) {
        if (!err) {
          style += contents;
        }
        cback(null, sections);
      });
    // build html code
    }, function(sections, cback) {
      // order contextualizations (ibid/opCit, ...)
      const orderedSections = resolveContextualizationsRelations(sections, settings);
      // resolve contextualizations by adding blocks, footnotes, or mutating html contents
      let figuresCount = 0;
      const displaySections = orderedSections.map((sectio, index) =>{
        sectio.figuresCount = figuresCount;
        const newSection = resolveContextualizationsImplementation(sectio, 'static', settings);
        figuresCount = newSection.figuresCount;
        return newSection;
      });

      // build css code
      const cssCustomizers = sections[0].customizers && sections[0].customizers.styles;
      if (cssCustomizers !== undefined) {
        for (const name in cssCustomizers) {
          if (name !== 'screen.css') {
            style += '\n\n' + cssCustomizers[name];
          }
        }
      }

      if (settings.notesPosition === 'footnotes') {
        style += `.peritext-static-note-content-container
                {
                    display: prince-footnote;
                    counter-increment: footnote;
                }`;
      }

      // procesing notes
      let newHtml;
      let notesCount = 0;
      const notedSections = displaySections.map((sectio) =>{
        const assembled = sectio.contents.reduce((html, block)=>{
          newHtml = html + block.html + '\n';
          return newHtml;
        }, '');

        const {outputHtml, notes} = eatNotes(assembled, getMetaValue(sectio.metadata, 'general', 'citeKey'), notesCount, settings.notesPosition);

        if (settings.notesPosition === 'documentend') {
          notesCount += notes.length;
        }

        return Object.assign({}, sectio, {outputHtml}, {notes});
      });

      // build references/bibliography
      if (settings.referenceScope === 'document') {
        notedSections[0].references = computeReferences(notedSections, settings);
      }

      // build metadata
      const metaHead = sections[0].metadata
                    .filter((meta) =>{
                      return meta.htmlHead;
                    })
                    .reduce((exp, meta) =>{
                      return exp + meta.htmlHead;
                    }, '') + '<meta name="generator" content="peritext"/>';

      // prepare glossary
      const glossaryPointers = sections.reduce((results, thatSection)=>{
        const sectionCitekey = getMetaValue(thatSection.metadata, 'general', 'citeKey');
        return results.concat(
          thatSection.contextualizations
          .filter((thatContextualization)=> {
            return thatContextualization.contextualizerType === 'glossary';
          })
          .reduce((localResults, contextualization)=> {
            return localResults.concat({
              mentionId: '#peritext-content-entity-inline-' + sectionCitekey + '-' + contextualization.citeKey,
              entity: contextualization.resources[0],
              alias: contextualization.alias
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

      // cover handling
      const sectionType = getMetaValue(sections[0].metadata, 'general', 'bibType');
      if (sectionTypeModels.acceptedTypes[sectionType].needsCover) {
        settings.hasCover = true;
      }

      // preparing translations
      const lang = getMetaValue(sections[0].metadata, 'general', 'language') || 'en';
      const messages = require('./../../../../translations/locales/' + lang + '.json');

      // rendering document
      const renderedContents = ReactDOMServer.renderToStaticMarkup(
        <IntlProvider locale={lang} messages={messages}>
          <StaticDocument sections={notedSections} settings={settings} glossaryData={glossaryData} />
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
