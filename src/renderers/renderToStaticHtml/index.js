import {waterfall} from 'async';
import {readFile} from 'fs';
import {resolve} from 'path';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import {IntlProvider} from 'react-intl';

import resolveDataDependencies from './../../core/resolvers/resolveDataDependencies';
import {getMetaValue} from './../../core/utils/sectionUtils';
import {resolveSettings} from './../../core/utils/modelUtils';
import {settingsModels} from './../../core/models';
import {resolveContextualizationsImplementation, resolveContextualizationsRelations} from './../../core/resolvers/resolveContextualizations';
import {composeRenderedSections} from './../sharedStaticUtils';
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
  const finalSettings = resolveSettings(settings, getMetaValue(section.metadata, 'general', 'bibType'), settingsModels);

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
      sections = resolveContextualizationsRelations(sections, finalSettings);
      // resolve contextualizations js representation according to settings
      let figuresCount = 0;
      sections = sections.map((sectio, index) =>{
        sectio.figuresCount = figuresCount;
        const newSection = resolveContextualizationsImplementation(sectio, 'static', finalSettings);
        figuresCount = newSection.figuresCount;
        return newSection;
      });
      // transform input js abstraction of contents to a js abstraction specific to rendering settings
      sections = sections.map(section1 => {
        const contents = setSectionContents(section1, finalSettings);
        return Object.assign(section1, contents, {type: 'contents'});
      });
      const {renderedSections, finalStyle} = composeRenderedSections(sections, finalSettings, style, messages);
      // render document
      const renderedContents = ReactDOMServer.renderToStaticMarkup(
        <IntlProvider locale={lang} messages={messages}>
          <StaticDocument sections={renderedSections} rootSection={sections[0]} settings={finalSettings} />
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
}
