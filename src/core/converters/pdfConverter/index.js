/*
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

import {getMetaValue} from './../../utils/sectionUtils';
import {eatNotes} from './../markdownConverter';
import {resolveContextualizationsImplementation} from './../../resolvers/resolveContextualizations';
import {metadataToSchema, setSectionMeta} from './../../utils/microDataUtils';
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
    function(cback) {
      readFile(resolve(__dirname + defaultStylesPath + 'global.css'), function(err, contents) {
        if (!err) {
          style += contents;
        }
        cback(null, sectios);
      });
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
        const notes = '<section class="modulo-contents-notes modulo-contents-end-notes">'
          + '<h4 class="notes-title">Notes</h4>'
          + notesList.map((not, num)=>{
            return not.content;
          }).join('\n')
          + '</section>';
        outputHtml = outputHtml + notes;
      }

      // build css code
      const cssCustomizers = sections[0].customizers && sections[0].customizers.styles;

      if (cssCustomizers) {
        for (const name in cssCustomizers) {
          if (name !== 'screen.css') {
            style += '\n\n' + cssCustomizers[name];
          }
        }
      }

      const metaHead = sections[0].metadata
                    .filter((meta) =>{
                      return meta.htmlHead;
                    })
                    .reduce((exp, meta) =>{
                      return exp + meta.htmlHead;
                    }, '') + '<meta name="generator" content="modulo"/>';


      // cover handling - to externalize
      const needsCover = ['book', 'booklet', 'collection', 'mastersthesis', 'phdthesis', 'proceedings', 'techreport', 'unpublished'];
      const type = getMetaValue(sections[0].metadata, 'general', 'bibType');
      const hasCover = needsCover.find((typ) =>{
        return typ === type;
      });
      if (hasCover) {
        const coverImage = getMetaValue(sections[0].metadata, 'general', 'coverimage');
        const coverHtml = '<section id="modulo-contents-cover">'
                            + '<div id="modulo-contents-cover-image-container"></div>'
                            + '<div class="modulo-contents-cover-title">'
                            + '<h1>' + getMetaValue(sections[0].metadata, 'general', 'title') + '</h1>'
                            + '</div>'
                        + '</section>';
        // toc handling - to externalize
        const tocHtml = '<section id="toc">'
                  + '<h2>Table of contents</h2>'
                  + sections.reduce((extHtml, section) =>{
                    const id = getMetaValue(section.metadata, 'general', 'citeKey');
                    const title = getMetaValue(section.metadata, 'general', 'title');
                    return extHtml + '<div><a href="#' + id + '">' + title + '</a></div>'
                  }, '')
                  + '</section>';
        outputHtml = coverHtml + tocHtml + outputHtml;
      }


      const html = '<!doctype:html><html>'
          + '<head>' + metaHead + '<style>' + style + '</style>' + '</head>'
          + '<body ' + setSectionMeta(sections[0]) + '>'
          + metadataToSchema(sections[0])
          + outputHtml + '</body>'
          + '</html>';
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
      // callback();
    });
  });
}
