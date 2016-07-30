import React, {PropTypes} from 'react';
import Radium from 'radium';
import { intlShape } from 'react-intl';

import {getMetaValue} from './../../utils/sectionUtils';
import {bibToSchema} from './../../utils/microDataUtils';
import {
  StaticBackCover,
  StaticEndNotes,
  StaticEndFigures,
  StaticFrontCover,
  StaticGlossary,
  StaticReferencesList,
  StaticSection,
  StaticTableOfContents,
  StaticTableOfFigures,
  StructuredMetadataPlaceholder
} from './../index.js';

// let styles = {};

/**
 * dumb component for rendering the structured representation of a static document
 */
@Radium
class StaticDocument extends React.Component {

  /**
   * propTypes
   */
  static propTypes = {
    rootSection: PropTypes.object,
    sections: PropTypes.array,
    settings: PropTypes.object
  };

  static defaultProps = {
  };

  /**
   * render
   * @return {ReactElement} markup
   */
  render() {
    const bibType = bibToSchema(getMetaValue(this.props.rootSection.metadata, 'general', 'bibType'));
    const citeKey = getMetaValue(this.props.rootSection.metadata, 'general', 'citeKey');
    return (
        <section
          itemScope
          itemType={'http://schema.org/' + bibType}
          typeof={bibType}
          vocab="http://schema.org/"
          resource={'#' + citeKey}
        >
          <StructuredMetadataPlaceholder section={this.props.rootSection} />

          {this.props.sections.map((section, index)=> {
            switch (section.type) {
            case 'table-of-contents':
              return <StaticTableOfContents id={section.id} key={index} contents={section.contents} />;
            case 'table-of-figures':
              return <StaticTableOfFigures id={section.id} key={index} contents={section.contents} />;
            case 'front-cover':
              return <StaticFrontCover key={index} metadata={section.metadata} />;
            case 'back-cover':
              return <StaticBackCover key={index} metadata={section.metadata} />;
            case 'endnotes':
              return <StaticEndNotes id={section.id} key={index} notes={section.contents} classSuffix="document-end" />;
            case 'endfigures':
              return <StaticEndFigures id={section.id} key={index} contents={section.contents} classSuffix="document-end" />;
            case 'references':
              return <StaticReferencesList id={section.id} key={index} references={section.contents} settings={this.props.settings} />;
            case 'glossary':
              return <StaticGlossary id={section.id} key={index} elements={section.contents} />;
            case 'contents':
              return <StaticSection key={index} section={section} settings={this.props.settings} />;
            default:
              break;
            }
          })}
        </section>
    );
  }
}

StaticDocument.contextTypes = { intl: intlShape };
export default StaticDocument;
