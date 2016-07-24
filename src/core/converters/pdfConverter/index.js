/**
 * This module inputs a specific modulo section, including then possibly its children sections
 * and outputs a pdf file ready to display.
 * The converter used is PrinceXML non-commercial version.
 * After endless trials with free software converters such as wkhtmltopdf, weasyprint or phantomjs-pdf,
 * I could not find a way to produce a sufficiently reliable and user-customizable pdf output (notably via css3 @paged-media props).
 * For instance, wkhtmltopdf (and webkit-based converters in general) does not support 'float:footnotes' feature which is mandatory for scholarly outputs like modulo's ones
 * Therefore I chose proprietary software PrinceXML, which works very very well. It is used in its free version for now (logo added on the first page, no commercial use license)
 */

import {waterfall} from 'async';
const Prince = require('prince');
import {readFile, writeFile} from 'fs';
import {resolve} from 'path';
import React from 'react';
import ReactDOMServer from 'react-dom/server';

import {getMetaValue} from './../../utils/sectionUtils';
import {sectionTypeModels} from './../../models';
import {eatNotes} from './../markdownConverter';
import {resolveContextualizationsImplementation} from './../../resolvers/resolveContextualizations';
import {metadataToSchema, setSectionMeta} from './../../utils/microDataUtils';
import {
  StaticDocument,
  CoverPage,
  StaticTableOfContents
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

export function exportSection({section, sectionList, includeChildren = true, destinationFolder = './../../../temp/'}, callback) {
  let sectios = [section];
  let style = '';
  const notesPosition = getMetaValue(section.metadata, 'general', 'notesPosition');
  const motherKey = getMetaValue(section.metadata, 'general', 'citeKey');
  // delimitate the sections to render
  // if includeChildren is enabled filter parented
  if (includeChildren) {
    sectios = sectios.concat(listChildren(sectionList, motherKey));
  }
  waterfall([
    // load global css rules
    function(cback) {
      readFile(resolve(__dirname + defaultStylesPath + 'global.css'), function(err, contents) {
        if (!err) {
          style += contents;
        }
        cback(null, sectios);
      });
    // rule paged-related css rules
    }, function(sections, cback) {
      readFile(resolve(__dirname + defaultStylesPath + 'page.css'), function(err, contents) {
        if (!err) {
          style += contents;
        }
        cback(null, sections);
      });
    }, function(sections, cback) {
      // resolve contextualizations by adding blocks, footnotes, or mutating html contents
      let figuresCount = 0;
      const displaySections = sections.map((sectio, index) =>{
        sectio.figuresCount = figuresCount;
        const newSection = resolveContextualizationsImplementation(sectio, 'static');
        figuresCount = newSection.figuresCount;
        return newSection;
      });

      // build css code
      const cssCustomizers = sections[0].customizers && sections[0].customizers.styles;
      if (cssCustomizers) {
        for (const name in cssCustomizers) {
          if (name !== 'screen.css') {
            style += '\n\n' + cssCustomizers[name];
          }
        }
      }

      if (notesPosition === 'inline') {
        style += `.modulo-contents-note-content
                {
                    display: prince-footnote;
                    counter-increment: footnote;
                }`;
      }

      // todo : handle reference building
      let newHtml;
      let notesCount = 0;
      const notedSections = displaySections.map((sectio) =>{
        const assembled = sectio.contents.reduce((html, block)=>{
          newHtml = html + block.html + '\n';
          return newHtml;
        }, '');

        const {outputHtml, notes} = eatNotes(assembled, getMetaValue(sectio.metadata, 'general', 'citeKey'), notesCount, notesPosition);

        if (notesPosition === 'documentend') {
          notesCount += notes.length;
        }

        return Object.assign({}, sectio, {outputHtml}, {notes});
      });

      // assemble html contents according to params
      // todo : reactify all that
      let outputHtml = notedSections.map((sectio, index) => {

        let notes = '';

        if (notesPosition === 'sectionend') {
          notes = '<section class="modulo-contents-notes modulo-contents-section-end-notes">'
          + '<h4 class="notes-title">Notes</h4>'
          + sectio.notes.map((note, num) =>{
            return note.content;
          }).join('\n')
          + '</section>';
        }

        return '<section '
                + (index > 0 ? setSectionMeta(sectio) : '')
                + ' class="modulo-contents-section modulo-contents-section-level-' + getMetaValue(sectio.metadata, 'general', 'generalityLevel') + '" id="' + getMetaValue(sectio.metadata, 'general', 'citeKey') + '">\n'
                + (index > 0 ? metadataToSchema(sectio) : '')
                + sectio.outputHtml
                + notes
                + '</section>\n';
      }).join('\n');

      const notesList = notedSections.reduce((nots, sectio) =>{
        return nots.concat(sectio.notes || []);
      }, []);

      if (notesPosition === 'documentend') {
        const notes = '<section class="modulo-contents-notes modulo-contents-document-end-notes">'
          + '<h4 class="notes-title">Notes</h4>'
          + notesList.map((not, num)=>{
            return not.content;
          }).join('\n')
          + '</section>';
        outputHtml = outputHtml + notes;
      }

      // build meta
      const metaHead = sections[0].metadata
                    .filter((meta) =>{
                      return meta.htmlHead;
                    })
                    .reduce((exp, meta) =>{
                      return exp + meta.htmlHead;
                    }, '') + '<meta name="generator" content="modulo"/>';

      // cover handling
      const sectionType = getMetaValue(sections[0].metadata, 'general', 'bibType');
      if (sectionTypeModels.acceptedTypes[sectionType].needsCover) {
        const coverHtml = ReactDOMServer.renderToStaticMarkup(<CoverPage metadata={sections[0].metadata} />);
        // toc handling - to externalize
        const tocData = sections.filter((sectio, index) =>{
          return index > 0;
        }).map((thisSection) => {
          return {
            id: getMetaValue(thisSection.metadata, 'general', 'citeKey'),
            title: getMetaValue(thisSection.metadata, 'general', 'title'),
            level: getMetaValue(thisSection.metadata, 'general', 'generalityLevel')
          };
        });
        const tocHtml = ReactDOMServer.renderToStaticMarkup(<StaticTableOfContents elements={tocData} level={getMetaValue(sections[0].metadata, 'general', 'generalityLevel')} />);
        outputHtml = coverHtml + tocHtml + outputHtml;
      }

      const html = '<!doctype:html><html>'
          + '<head>' + metaHead
          + '<style>' + style + '</style>'
          + '</head>'
          + '<body>'
          + ReactDOMServer.renderToStaticMarkup(<StaticDocument sections={notedSections} />)
          + '</body>'
          + '</html>';
      // const html = '<!doctype:html><html>'
      //     + '<head>' + metaHead + '<style>' + style + '</style>' + '</head>'
      //     + '<body ' + setSectionMeta(sections[0]) + '>'
      //     + metadataToSchema(sections[0])
      //     + outputHtml + '</body>'
      //     + '</html>';
      cback(null, sections, html);
    }, function(sections, html, cback) {
      writeFile(resolve(__dirname + destinationFolder + motherKey + '.html'), html, 'utf-8', function(err) {
        cback(err, sections, html);
      });
    }
  ], function(err, sections, html) {
    Prince()
    .inputs(resolve(__dirname + destinationFolder + motherKey + '.html'))
    .output(resolve(__dirname + destinationFolder + motherKey + '.pdf'))
    .execute()
    .then(function() {
      console.log('OK: done');
      callback();
    }, function(error) {
      console.log('Prince ERROR: ', error);
    });
  });
}
