/**
 * Render to static html
 * @module renderers/renderToStaticHtml
 */

import {waterfall} from 'async';
import {readFile} from 'fs';
import {resolve} from 'path';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import {IntlProvider} from 'react-intl';

import resolveDataDependencies from './../../core/resolvers/resolveDataDependencies';
import {resolveSettings} from './../../core/utils/modelUtils';
import {settingsModels} from './../../core/models';
import {
  resolveContextualizationImplementation,
  resolveContextualizationsRelations
} from './../../core/resolvers/resolveContextualizations';
import {composeRenderedSections} from './../sharedStaticUtils';
import {
  StaticDocument,
  StaticFootnote,
  StaticNotePointer
} from './../../core/components';

const defaultStylesPath = './../../config/defaultStyles/';

const resolveNode = (inputNode, section, settings) =>{
  const node = Object.assign({}, inputNode);
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

const setSectionContents = (section, key, settings) =>{
  return section[key].map(node => {
    return resolveNode(node, section, settings);
  });
};

/**
 * Renders a section representation as a string representation of an html page
 * @param {Object} params - The params of the export
 * @param {Object} params.document - the document to export
 * @param {Object} params.settings - the specific rendering settings to use in order to produce the output
 * @param {string} params.destinationFolder - where to output the file
 * @params {Object} assetsController - the module to use in order to communicate with assets
 * @param {Object} assetsParams - the assets parameters to use while communicating with assetsController
 * @param {function(err:error, result:string)} rendererCallback - the possible errors encountered during rendering, and the resulting html data as a string
 */
export const renderDocument = ({
  document,
  settings = {}
}, assetsController, assetsParams, rendererCallback) =>{

  // populate rendering params with defaults if needed
  const finalSettings = resolveSettings(settings, document.metadata.general.bibType.value, settingsModels);
  let style = '';

  waterfall([
    // load default css rules
    (cback) =>{
      readFile(resolve(__dirname + defaultStylesPath + 'global.css'), (err, contents)=> {
        if (!err) {
          style += contents;
        }
        cback(err);
      });
    // load default @paged-related css rules
    }, (cback) =>{
      readFile(resolve(__dirname + defaultStylesPath + 'page.css'), (err, contents)=> {
        if (!err) {
          style += contents;
        }
        cback(err);
      });
    }, (depCallback) =>{
      resolveDataDependencies(document, assetsController, assetsParams, true, depCallback);
    // build html code
    }, (inputDocument, cback) =>{
      let renderedDocument = Object.assign({}, inputDocument);
      // build final css code (default + user-generated customizers)
      const cssCustomizers = renderedDocument.customizers && renderedDocument.customizers.styles;
      if (cssCustomizers !== undefined) {
        for (const name in cssCustomizers) {
          if (name !== 'screen.css') {
            style += '\n\n' + cssCustomizers[name];
          }
        }
      }
       // prepare translations
      const lang = renderedDocument.metadata.general.language ? renderedDocument.metadata.general.language.value : 'en';
      const messages = require('./../../../translations/locales/' + lang + '.json');
      // build metadata (todo : check if react-based helmet lib could cover all metadata props like dublincore ones)
      let metaHead = '<meta name="generator" content="peritext"/>';
      Object.keys(document.metadata).forEach(domain => {
        Object.keys(document.metadata[domain]).forEach(key => {
          if (renderedDocument.metadata[domain][key] && renderedDocument.metadata[domain][key].htmlHead) {
            metaHead += renderedDocument.metadata[domain][key].htmlHead;
          }
        });
      });

      // order contextualizations (ibid/opCit, ...)
      renderedDocument = resolveContextualizationsRelations(renderedDocument, finalSettings);

      // resolve contextualizations js representation according to settings
      renderedDocument.figuresCount = 0;

      renderedDocument = Object.keys(renderedDocument.contextualizations).reduce((doc, contId)=>{
        return resolveContextualizationImplementation(doc.contextualizations[contId], doc, 'static', finalSettings);
      }, renderedDocument);

      // transform input js abstraction of contents to a js abstraction specific to rendering settings
      const sections = renderedDocument.summary.map(sectionKey => {
        const section1 = renderedDocument.sections[sectionKey];
        const contents = setSectionContents(section1, 'contents', finalSettings);
        return Object.assign({}, section1, {contents}, {type: 'contents'});
      });

      const {renderedSections, finalStyle} = composeRenderedSections(sections, renderedDocument, finalSettings, style, messages);
      // render document
      const renderedContents = ReactDOMServer.renderToStaticMarkup(
        <IntlProvider locale={lang} messages={messages}>
          <StaticDocument document={renderedDocument} sections={renderedSections} settings={finalSettings} />
        </IntlProvider>);
      const html = `
<!doctype:html>
<html>
  <head>
    ${metaHead}
    <style>
      ${finalStyle}
    </style>
  </head>
  <body>
    ${renderedContents}
   </body>
</html>`.replace(/itemscope=""/g, 'itemscope');
      cback(null, html);
    }
  ], rendererCallback);
};
