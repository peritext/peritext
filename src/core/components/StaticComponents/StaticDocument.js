import React, {PropTypes} from 'react';
import { intlShape } from 'react-intl';
import {bibToSchema} from '../../utils/microDataUtils';
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
  StructuredMetadataPlaceholder
} from '../index';


/**
 * dumb component for rendering the structured representation of a static document
 */
class StaticDocument extends React.Component {

  /**
   * propTypes
   * @property {Object} document - the reference to the whole document
   * @property {array} sections - the list of rendering sections to include - warning -> can include cover, table of contents, ... sections
   * @property {Object} settings - the rendering settings to use
   */
  static propTypes = {
    document: PropTypes.object,
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
    const bibType = bibToSchema(this.props.document.metadata.general.bibType.value);
    const citeKey = this.props.document.metadata.general.citeKey.value;
    return (
        <section
          itemScope
          itemType={'http://schema.org/' + bibType}
          typeof={bibType}
          vocab="http://schema.org/"
          resource={'#' + citeKey}
        >
          {<StructuredMetadataPlaceholder section={this.props.document} />}

          {this.props.sections.map((section, index)=> {
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
              return (section.contents.length) ? <StaticReferencesList id={section.id} key={index} references={section.contents} settings={this.props.settings} /> : '';
            case 'glossary':
              return (section.contents.length) ? <StaticGlossary id={section.id} key={index} elements={section.contents} /> : '';
            case 'contents':
              return <StaticSection key={index} section={section} settings={this.props.settings} />;
            case 'forewords':
              return <StaticForewords key={index} section={section} settings={this.props.settings} />;
              break;
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
