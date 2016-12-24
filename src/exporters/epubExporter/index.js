/**
 * Epub exporter
 * @module exporters/epubExporter
 */


/**
 * This module inputs a specific peritext section, including possibly its children sections
 * and outputs an epub file ready to display.
 */

import epubGenerator from 'epub-gen';
import {resolve} from 'path';
import {waterfall} from 'async';
import {
  readFile,
  writeFile,
  exists,
  mkdir
} from 'fs';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import {IntlProvider} from 'react-intl';

import {resolveSettings} from './../../core/utils/modelUtils';
import {settingsModels} from './../../core/models';
import resolveDataDependencies from './../../core/resolvers/resolveDataDependencies';
import {
  resolveContextualizationImplementation,
  resolveContextualizationsRelations
} from './../../core/resolvers/resolveContextualizations';
import {
  composeRenderedSections,
  setStaticSectionContents
} from '../../renderers/renderingUtils';
import {
  StaticSectionFactory
} from './../../core/components';

const defaultStylesPath = './../../config/defaultStyles/';

/**
 * Exports a section representation of a peritext document to a pdf file
 * @param {Object} params - The params of the export
 * @param {Object} params.document - the document to export
 * @param {Object} params.settings - the specific rendering settings to use in order to produce the output
 * @param {string} params.destinationFolder - where to output the file
 * @params {Object} assetsController - the module to use in order to communicate with assets
 * @param {Object} assetsParams - the assets parameters to use while communicating with assetsController
 * @param {function(err:error)} callback - the possible errors encountered during export
 */
export const exportDocumentToEpub = ({
  document,
  settings,
  destinationFolder,
}, assetsController, assetsParams, finalCallback) =>{

  const motherKey = document.metadata.general.id.value;
  const path = destinationFolder || resolve(__dirname + '/temp/');
  console.log('export to path: ', path);

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
      // temp hack - for now resolveDataDependencies does not process document wide customizers (todo)
      let documentLevelSection = document.sections[document.metadata.general.id.value];
      renderedDocument.metadata = Object.assign({}, documentLevelSection.metadata);
      // build final css code (default + user-generated customizers)
      const cssCustomizers = documentLevelSection.customizers.styles;
      // const cssCustomizers = renderedDocument.customizers && renderedDocument.customizers.styles;
      if (cssCustomizers !== undefined) {
        for (const name in cssCustomizers) {
          if (name !== 'screen.css') {
            style += '\n\n' + cssCustomizers[name];
          }
        }
      }


      // order contextualizations (ibid/opCit, ...)
      renderedDocument = resolveContextualizationsRelations(renderedDocument, finalSettings);

      // resolve contextualizations js representation according to settings
      renderedDocument.figuresCount = 0;

      // renderedDocument = Object.keys(renderedDocument.contextualizations).reduce((doc, contId)=>{
      //   return resolveContextualizationImplementation(doc.contextualizations[contId], doc, 'static', finalSettings);
      // }, renderedDocument);

      // transform input js abstraction of contents to a js abstraction specific to rendering settings
      const sections = renderedDocument.summary.map(sectionKey => {
        const section1 = renderedDocument.sections[sectionKey];
        const contents = setStaticSectionContents(section1, 'contents', finalSettings);
        return Object.assign({}, section1, {contents}, {
          type: 'contents',
          title: section1.metadata.general.title.value
        });
      });

      // prepare translations
      const lang = renderedDocument.metadata.general.language ? renderedDocument.metadata.general.language.value : 'en';
      const messages = require('./../../../translations/locales/' + lang + '.json');
      // render sections
      const {renderedSections, finalStyle} = composeRenderedSections(sections, renderedDocument, finalSettings, style, messages);

      // render document
      const content = renderedSections.map((section, index) => {
        const ToMount = (
        <IntlProvider locale={lang} messages={messages}>
          {StaticSectionFactory(section, index, finalSettings)}
        </IntlProvider>);
        if (!section.title)
          console.log(section.type);
        return {
          title: section.title || (section.metadata && section.metadata.general.title.value) || section.type,
          author: section.metadata
                  && section.metadata.general.author
                  && JSON.stringify(section.metadata.general.author) !== JSON.stringify(document.metadata.general.author) ? section.metadata.general.author.value.map(author => {
                    return author.firstName + ' ' + author.lastName;
                  }).join(', ') : undefined,
          data: ReactDOMServer.renderToStaticMarkup(ToMount).replace(/itemscope=""/g, 'itemscope')
        };
      });

      const option = {
        title: renderedDocument.metadata.general.title.value,
        author: renderedDocument.metadata.general.author ? renderedDocument.metadata.general.author.value.map(author => {
          return author.firstName + ' ' + author.lastName;
        }).join(', ') : undefined,
        publisher: renderedDocument.metadata.general.publisher ? renderedDocument.metadata.general.publisher.value : undefined,
        content,
        css: style
      };

      const epubPath = path + '/' + motherKey + '.epub';
      console.log('export to path: ', epubPath);

      new epubGenerator(option, epubPath)
            .promise.then(function() {
              console.log('Ebook Generated Successfully!');
              cback(null, epubPath);
            }, function(err) {
              console.error('Failed to generate Ebook because of ', err);
              cback(err, epubPath);
            });
    }], finalCallback);
};
