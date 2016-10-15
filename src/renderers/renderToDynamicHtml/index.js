/**
 * Render a document to dynamic html
 * @module renderers/renderToDynamicHtml
 */

import {waterfall} from 'async';
// import {readFile} from 'fs';
// import {resolve} from 'path';
// import React from 'react';
// import {IntlProvider} from 'react-intl';

// import resolveDataDependencies from './../../core/resolvers/resolveDataDependencies';
import {resolveSettings} from './../../core/utils/modelUtils';
import {settingsModels} from './../../core/models';
import {
  resolveContextualizationImplementation,
  resolveContextualizationsRelations
} from './../../core/resolvers/resolveContextualizations';
import {
  setDynamicSectionContents
} from './../renderingUtils';
/*
import {
  StaticDocument
} from './../../core/components';
*/

// const defaultStylesPath = './../../config/defaultStyles/';

/**
 * Renders a section representation as a string representation of an html page
 * @param {Object} params - The params of the rendering
 * @param {Object} params.document - the document to render
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
  // let style = '';

  waterfall([
    // load default css rules
    /*
    (cback) =>{
      readFile(resolve(__dirname + defaultStylesPath + 'global.css'), (err, contents)=> {
        if (!err) {
          style += contents;
        }
        cback(err);
      });
    // load default @paged-related css rules
    },
    */
    (depCallback) =>{
      resolveDataDependencies(document, assetsController, assetsParams, false, depCallback);
    },
    // build html code
    (inputDocument,
      cback) =>{
      let renderedDocument = Object.assign({}, document); // inputDocument
      // build final css code (default + user-generated customizers)

      const cssCustomizers = renderedDocument.customizers && renderedDocument.customizers.styles;
      if (cssCustomizers !== undefined) {
        for (const name in cssCustomizers) {
          if (name !== 'screen.css') {
            style += '\n\n' + cssCustomizers[name];
          }
        }
      }
      // build metadata html head at document level
      // todo : check if react-helmet renders dublincore metadata properly
      // (reason why I don't use it at first)
      let metaHead = '';
      Object.keys(document.metadata).forEach(domain => {
        Object.keys(document.metadata[domain]).forEach(key => {
          if (renderedDocument.metadata[domain][key] && renderedDocument.metadata[domain][key].htmlHead) {
            metaHead += renderedDocument.metadata[domain][key].htmlHead;
          }
        });
      });
      renderedDocument.metaHead = renderObjectMetadata(document);

      // order contextualizations (ibid/opCit, ...)
      renderedDocument = resolveContextualizationsRelations(renderedDocument, finalSettings);

      renderedDocument = Object.keys(renderedDocument.contextualizations).reduce((doc, contId)=>{
        return resolveContextualizationImplementation(doc.contextualizations[contId], doc, 'dynamic', finalSettings);
      }, renderedDocument);

      // transform input js abstraction of contents to a js abstraction specific to rendering settings
      const sections = renderedDocument.summary.map(sectionKey => {
        const section1 = renderedDocument.sections[sectionKey];
        const contents = setDynamicSectionContents(section1, 'contents', finalSettings);
        return Object.assign({}, section1, {contents}, {type: 'contents'});
      });

      sections.forEach(section => {
        renderedDocument.sections[section.metadata.general.id.value] = section;
      });

      cback(null, renderedDocument);
    }
  ], rendererCallback);
};

export function renderObjectMetadata (document) {
  return Object.keys(document.metadata).forEach(domain => {
        Object.keys(document.metadata[domain]).forEach(key => {
          if (renderedDocument.metadata[domain][key] && renderedDocument.metadata[domain][key].htmlHead) {
            metaHead += renderedDocument.metadata[domain][key].htmlHead;
          }
        });
      }).join('\n');
}
