import React, {PropTypes} from 'react';
import { intlShape } from 'react-intl';
import {bibToSchema} from '../../utils/microDataUtils';
import {
  StructuredMetadataPlaceholder,
  StaticSectionFactory as yeldSection
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
    const id = this.props.document.metadata.general.id.value;
    const makeSection = (section, index) => yeldSection(section, index, this.props.settings);
    return (
        <section
          itemScope
          itemType={'http://schema.org/' + bibType}
          typeof={bibType}
          vocab="http://schema.org/"
          resource={'#' + id}
        >
          {<StructuredMetadataPlaceholder section={this.props.document} />}

          {this.props.sections.map(makeSection)}
        </section>
    );
  }
}

StaticDocument.contextTypes = { intl: intlShape };
export default StaticDocument;
