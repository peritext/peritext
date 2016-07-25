import React, {PropTypes} from 'react';
import Radium from 'radium';

import {getMetaValue} from './../../utils/sectionUtils';
import {bibToSchema} from './../../utils/microDataUtils';
import {
  StaticBackCover,
  StaticEndNotes,
  StaticFrontCover,
  StaticSection,
  StaticTableOfContents,
  StructuredDate,
  StructuredMetadataPlaceholder,
  StructuredPerson,
  StructuredSpan,
} from './../index.js';

// let styles = {};

/**
 * dumb component for rendering the structured representation of a static document
 */
@Radium
export default class StaticDocument extends React.Component {

  /**
   * propTypes
   */
  static propTypes = {
    sections: PropTypes.array,
    renderingParams: PropTypes.object
  };

  static defaultProps = {
  };

  /**
   * render
   * @return {ReactElement} markup
   */
  render() {
    const bibType = bibToSchema(getMetaValue(this.props.sections[0].metadata, 'general', 'bibType'));
    const citeKey = getMetaValue(this.props.sections[0].metadata, 'general', 'citeKey');
    const tocData = this.props.sections.filter((sectio, index) =>{
      return index > 0;
    }).map((thisSection) => {
      return {
        id: getMetaValue(thisSection.metadata, 'general', 'citeKey'),
        title: getMetaValue(thisSection.metadata, 'general', 'title'),
        level: getMetaValue(thisSection.metadata, 'general', 'generalityLevel')
      };
    });
    return (
        <section
          itemScope
          itemType={'http://schema.org/' + bibType}
          typeof={bibType}
          vocab="http://schema.org/"
          resource={'#' + citeKey}
        >
          <StructuredMetadataPlaceholder section={this.props.sections[0]} />

          {
            this.props.renderingParams.hasCover ?
            <StaticFrontCover metadata={this.props.sections[0].metadata} />
            : ''
          }

          {
            this.props.renderingParams.tocPosition === 'begining' ?
            <StaticTableOfContents elements={tocData} level={getMetaValue(this.props.sections[0].metadata, 'general', 'generalityLevel')} />
            : ''
          }

          <section
            className="peritext-contents-section-contents"
            dangerouslySetInnerHTML={{
              __html: this.props.sections[0].outputHtml
            }}
          ></section>
          {
            this.props.renderingParams.notesPosition === 'sectionend' ?
              <StaticEndNotes
                classSuffix="section-end"
                notes={this.props.sections[0].notes}
              /> : ''
          }

          {
            this.props.sections.slice(1).map((section, sectionIndex)=> {
              return <StaticSection section={section} key={sectionIndex} renderingParams={this.props.renderingParams} />;
            })
          }

          {
            this.props.renderingParams.notesPosition === 'documentend' ?
            <StaticEndNotes
              classSuffix="document-end"
              notes={
                this.props.sections.reduce((nots, sectio) =>{
                  return nots.concat(sectio.notes || []);
                }, [])
              }
            /> : ''
          }

          {
            this.props.renderingParams.tocPosition === 'end' ?
            <StaticTableOfContents elements={tocData} level={getMetaValue(this.props.sections[0].metadata, 'general', 'generalityLevel')} />
            : ''
          }

          {
            this.props.renderingParams.hasCover ?
            <StaticBackCover metadata={this.props.sections[0].metadata} />
            : ''
          }
        </section>
    );
  }
}
