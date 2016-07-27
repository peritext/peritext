import React, {PropTypes} from 'react';
import Radium from 'radium';
import {
  StructuredDate,
  StructuredSpan,
  StructuredPerson
} from './../index.js';

// let styles = {};

/**
 * dumb component for rendering the structured representation of a section
 */
@Radium
export default class StructuredMetadataPlaceholder extends React.Component {

  /**
   * propTypes
   */
  static propTypes = {
    section: PropTypes.object
  };

  static defaultProps = {
  };

  /**
   * render
   * @return {ReactElement} markup
   */
  render() {
    return (
      <div
        className="peritext-structured-metadata-placeholder-container"
        style={{visibility: 'hidden'}}
      >
        {this.props.section.metadata.filter((prop) =>{
          return prop.domain === 'general';
        }).map((meta) =>{
          switch (meta.key) {
          case 'title':
            return <StructuredSpan key={meta.key} property="name" value={meta.value} />;
          case 'date':
            return <StructuredDate key={meta.key} property="datePublished" value={meta.value} />;
          case 'author':
            return (
              <span key={meta.key}>
                {
                  meta.value.map((author)=> {
                    return <StructuredPerson resource={author} key={author.citeKey} />;
                  })
                }
              </span>
            );
          // TODO : continue along with other metadata-to-schema conversions
          default:
            return '';
          }
        })}
      </div>
    );
  }
}
