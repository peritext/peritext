import React, {PropTypes} from 'react';
import Radium from 'radium';
import {getMetaValue} from './../../utils/sectionUtils';
import {bibToSchema} from './../../utils/microDataUtils';

import {
  StructuredMetadataPlaceholder,
  StaticEndNotes
} from './../index.js';


// let styles = {};

/**
 * dumb component for rendering the structured representation of a static section
 */
@Radium
export default class StaticSection extends React.Component {

  /**
   * propTypes
   */
  static propTypes = {
    section: PropTypes.object,
    renderingParams: PropTypes.object
  };

  static defaultProps = {
  };

  /**
   * render
   * @return {ReactElement} markup
   */
  render() {
    const bibType = bibToSchema(getMetaValue(this.props.section.metadata, 'general', 'bibType'));
    const citeKey = getMetaValue(this.props.section.metadata, 'general', 'citeKey');
    return (
      <section
        className={'modulo-contents-section modulo-contents-section-level-' + getMetaValue(this.props.section.metadata, 'general', 'generalityLevel')}
        id={getMetaValue(this.props.section.metadata, 'general', 'citeKey')}
        itemScope
        itemType={'http://schema.org/' + bibType}
        typeof={bibType}
        resource={'#' + citeKey}
        itemProp="hasPart"
        property="hasPart"
      >
        <StructuredMetadataPlaceholder section={this.props.section} />
        <section
          className="modulo-contents-section-contents"
          dangerouslySetInnerHTML={{
            __html: this.props.section.outputHtml
          }}
        ></section>
        {this.props.renderingParams.notesPosition === 'sectionend' ?
          <StaticEndNotes
            classSuffix="section-end"
            notes={this.props.section.notes}
          /> : ''
        }
      </section>
    );
  }
}
