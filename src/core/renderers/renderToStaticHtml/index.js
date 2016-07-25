import {waterfall} from 'async';
import {readFile} from 'fs';
import {resolve} from 'path';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import {IntlProvider} from 'react-intl';

import {getMetaValue} from './../../utils/sectionUtils';
import {sectionTypeModels, renderingParamsModels} from './../../models';
import {eatNotes} from './../../converters/markdownConverter';
import {resolveContextualizationsImplementation} from './../../resolvers/resolveContextualizations';
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
  renderingParams = {},
  includeChildren = true
}, rendererCallback) {

  // populate rendering params with defaults if needed
  for (const param in renderingParamsModels) {
    if (renderingParams[param] === undefined) {
      renderingParams[param] = renderingParamsModels[param].default;
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
      // resolve contextualizations by adding blocks, footnotes, or mutating html contents
      let figuresCount = 0;
      const displaySections = sections.map((sectio, index) =>{
        sectio.figuresCount = figuresCount;
        const newSection = resolveContextualizationsImplementation(sectio, 'static', renderingParams);
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

      if (renderingParams.notesPosition === 'footnotes') {
        console.log('adding footnotes');
        style += `.peritext-contents-note-content
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

        const {outputHtml, notes} = eatNotes(assembled, getMetaValue(sectio.metadata, 'general', 'citeKey'), notesCount, renderingParams.notesPosition);

        if (renderingParams.notesPosition === 'documentend') {
          notesCount += notes.length;
        }

        return Object.assign({}, sectio, {outputHtml}, {notes});
      });

      // build metadata
      const metaHead = sections[0].metadata
                    .filter((meta) =>{
                      return meta.htmlHead;
                    })
                    .reduce((exp, meta) =>{
                      return exp + meta.htmlHead;
                    }, '') + '<meta name="generator" content="peritext"/>';

      // cover handling
      const sectionType = getMetaValue(sections[0].metadata, 'general', 'bibType');
      if (sectionTypeModels.acceptedTypes[sectionType].needsCover) {
        renderingParams.hasCover = true;
      }

      const lang = getMetaValue(sections[0].metadata, 'general', 'language') || 'en';
      const messages = require('./../../../../translations/locales/' + lang + '.json');
      const renderedContents = ReactDOMServer.renderToStaticMarkup(
        <IntlProvider locale={lang} messages={messages}>
          <StaticDocument sections={notedSections} renderingParams={renderingParams} />
        </IntlProvider>
      );
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
