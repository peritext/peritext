import React, {PropTypes} from 'react';
import {
  StaticBackCover,
  StaticEndNotes,
  StaticEndFigures,
  StaticFrontCover,
  StaticForewords,
  StaticGlossary,
  StaticReferencesList,
  StaticSection,
  StaticTableOfContents,
  StaticTableOfFigures,
  StructuredMetadataPlaceholder,
  StaticSectionFactory
} from '../index';

export default function yeldSection(section, index, settings) {
  switch (section.type) {

  case 'table-of-contents':
    return (section.contents.length) ? <StaticTableOfContents id={section.id} key={index} contents={section.contents} /> : '';

  case 'table-of-figures':
    return (section.contents.length) ? <StaticTableOfFigures id={section.id} key={index} contents={section.contents} /> : '';

  case 'front-cover':
    return <StaticFrontCover key={index} metadata={section.metadata} />;

  case 'back-cover':
    return <StaticBackCover key={index} metadata={section.metadata} />;

  case 'endnotes':
    return (section.contents.length) ? <StaticEndNotes id={section.id} key={index} notes={section.contents} classSuffix="document-end" /> : '';

  case 'endfigures':
    return (section.contents.length) ? <StaticEndFigures id={section.id} key={index} contents={section.contents} classSuffix="document-end" /> : '';

  case 'references':
    return (section.contents.length) ? <StaticReferencesList id={section.id} key={index} references={section.contents} settings={settings} /> : '';

  case 'glossary':
    return (section.contents.length) ? <StaticGlossary id={section.id} key={index} elements={section.contents} /> : '';

  case 'contents':
    return <StaticSection key={index} section={section} settings={settings} />;

  case 'forewords':
    return <StaticForewords key={index} section={section} settings={settings} />;

  default:
    break;
  }
}
