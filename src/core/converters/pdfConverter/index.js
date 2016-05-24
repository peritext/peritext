import {convert} from 'phantomjs-pdf';
import {resolve} from 'path';
import {getMetaValue} from './../../utils/sectionUtils';
import {resolveContextualizationsImplementation} from './../../resolvers/resolveContextualizations';

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
  let sections = [section];
  const motherKey = getMetaValue(section.metadata, 'general', 'citeKey');
  // delimitate the sections to render
  // if includeChildren is enabled filter parented
  if (includeChildren) {
    sections = sections.concat(listChildren(sectionList, motherKey));
  }
  // resolve contextualizations by adding blocks, footnotes, or mutating html contents
  const displaySections = sections.map((sectio) => {
    return resolveContextualizationsImplementation(sectio, 'static');
  });

  // assemble html contents according to params
  const bodyHtml = displaySections.map((sectio) => {
    let newHtml;
    return '<section class="modulo-section" id="' + getMetaValue(sectio.metadata, 'general', 'citeKey') + '">\n' + sectio.contents.reduce((html, block)=> {
      newHtml = html + block.html + '\n';
      return newHtml;
    }, '') + '</section>\n';
  }).join('\n');

  // todo: resolve notes according to doc params
  const bodyNotes  = displaySections.map((sectio) => {
    let newHtml;
    return sectio.notes.reduce((html, note) => {
      return html + note.content;
    }, '');
  }).join('\n');

  // build css code
  let style = ''; // todo : require default style : require('./../../../config/defaultStyles/page.css');
  const cssCustomizers = sections[0].customizers && sections[0].customizers.styles;

  if (cssCustomizers) {
    for (const name in cssCustomizers) {
      if (name !== 'screen.css') {
        style += '\n\n' + cssCustomizers[name];
      }
    }
  }

  // export html file to pdf with css print
  const options = {
    'html': bodyHtml + bodyNotes,
    'css': style,
    // "js" : ""
    'deleteOnAction': true
  };

  convert(options, function(result) {

    /* Using a buffer and callback */
    // result.toBuffer(function(returnedBuffer) {});

    /* Using a readable stream */
    const stream = result.toStream();

    /* Using the temp file path */
    // const tmpPath = result.getTmpPath();


    /* Using the file writer and callback - temp */
    const destination = resolve(__dirname + destinationFolder + motherKey + '.pdf');
    result.toFile(destination, function() {});

    // calling back a stream
    callback(null, stream);
  });
}
