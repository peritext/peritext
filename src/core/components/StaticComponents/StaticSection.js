import React, {PropTypes} from 'react';

import {bibToSchema} from '../../utils/microDataUtils';

import {
  StructuredMetadataPlaceholder,
  StaticEndNotes,
  StaticEndFigures
} from './../index';

import renderContents from './../../utils/componentsFactory';

/**
 * dumb component for rendering the structured representation of a static section
 */
export default class StaticSection extends React.Component {

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
    const title = this.props.section.metadata.general.title.value;
    const generalityLevel = this.props.section.metadata.general.generalityLevel.value;
    return (
      <section
        className={'peritext-static-section-container peritext-static-section-level-' + generalityLevel}
        id={id}
        itemScope
        itemType={'http://schema.org/' + bibType}
        typeof={bibType}
        resource={'#' + id}
        itemProp="hasPart"
        property="hasPart"
        title={title}
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
