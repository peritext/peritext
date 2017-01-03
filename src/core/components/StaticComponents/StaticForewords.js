import React, {PropTypes} from 'react';

import {bibToSchema} from '../../utils/microDataUtils';
import {
  intlShape,
  // defineMessages
} from 'react-intl';

// const translate = defineMessages({
//   tableofcontents: {
//     id: 'forewords',
//     description: 'Forewords',
//     defaultMessage: 'Forewords',
//   }
// });

import {
  StructuredMetadataPlaceholder,
  StaticEndNotes,
  StaticEndFigures
} from '../index';

import renderContents from '../../utils/componentsFactory';

/**
 * dumb component for rendering the structured representation of a static section
 */
class StaticForewords extends React.Component {

  /**
   * propTypes
   * @property {Object} section - the section to render
   * @property {Object} settings - the settings to use for section rendering
   */
  static propTypes = {
    section: PropTypes.object,
    settings: PropTypes.object
  };

  static defaultProps = {
  };

  /**
   * render
   * @return {ReactElement} markup
   */
  render() {
    const bibType = bibToSchema(this.props.section.metadata.general.bibType.value);
    const id = this.props.section.metadata.general.id.value;
    // const { formatMessage } = this.context.intl;
    return (
      <section
        className={'peritext-static-section-container peritext-static-forewords-container'}
        id={id}
        itemScope
        itemType={'http://schema.org/' + bibType}
        typeof={bibType}
        resource={'#' + id}
        itemProp="hasPart"
        property="hasPart"
      >
        <StructuredMetadataPlaceholder section={this.props.section} />
        {renderContents(this.props.section.contents)}
        {this.props.settings.figuresPosition === 'section-end' && this.props.section.figures ?
          <StaticEndFigures
            contents={this.props.section.figures}
            classSuffix="section-end"
          /> : ''}
        {this.props.settings.notesPosition === 'section-end' && this.props.section.notes.length ?
          <StaticEndNotes
            classSuffix="section-end"
            notes={this.props.section.notes}
          /> : ''}
      </section>
    );
  }
}

StaticForewords.contextTypes = { intl: intlShape };

export default StaticForewords;
