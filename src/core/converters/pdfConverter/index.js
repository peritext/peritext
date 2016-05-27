/*
 * This module inputs a specific modulo section
 * and outputs a pdf file ready to display.
 * The converter used is PrinceXML non-commercial version.
 * After endless trials with free software converters such as wkhtmltopdf or phantomjs-pdf,
 * I could not find a way to create a sufficiently reliable and user-customizable pdf output (notably via css3 @paged-media props).
 * For instance, wkhtmltopdf (and webkit-based converters in general) does not support 'float:footnotes' which is mandatory for scholarly outputs
 * Therefore proprietary software PrinceXML, which works very very good, is used in its free version for now (logo added on the first page, no commercial use license)
 */

import {waterfall} from 'async';
const Prince = require('prince');
import {readFile, writeFile} from 'fs';
import {resolve} from 'path';

import {getMetaValue} from './../../utils/sectionUtils';
import {eatNotes} from './../markdownConverter';
import {resolveContextualizationsImplementation} from './../../resolvers/resolveContextualizations';

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
      // TODO : resolve contextualizations dependencies (data fetching, images loading ?, ...) here
      cback(null, sectios);
    }, function(sections, cback) {
      readFile(resolve(__dirname + defaultStylesPath + 'global.css'), function(err, contents) {
        if (!err) {
          style += contents;
        }
        cback(null, sections);
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
      const displaySections = sections.map((sectio) =>{
        return resolveContextualizationsImplementation(sectio, 'static');
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
      let outputHtml = notedSections.map((sectio) => {
        let notes = '';
        if (notesPosition === 'sectionend') {
          notes = '<section class="modulo-contents-notes modulo-contents-section-end-notes">'
          + '<h4 class="notes-title">Notes</h4>'
          + sectio.notes.map((note, num) =>{
            return note.content;
          }).join('\n')
          + '</section>';
        }
        return '<section class="modulo-contents-section modulo-contents-section-level-' + getMetaValue(sectio.metadata, 'general', 'generalityLevel') + '" id="' + getMetaValue(sectio.metadata, 'general', 'citeKey') + '">\n'
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

      let metaHead = '<meta name="generator" content="modulo"/>';
      metaHead += sections[0].metadata
                    .filter((meta) =>{
                      return meta.htmlHead;
                    })
                    .reduce((exp, meta) =>{
                      return exp + meta.htmlHead;
                    }, metaHead);

      cback(null, sections, '<!doctype:html><html><head>' + metaHead + '</head><body><style>' + style + '</style>' + outputHtml + '</body></html>');
    }, function(sections, html, cback) {

      writeFile(resolve(__dirname + destinationFolder + motherKey + '.html'), html, 'utf-8', function(err) {
        console.log('written, out');
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
      callback(error);
    });
  });
}
