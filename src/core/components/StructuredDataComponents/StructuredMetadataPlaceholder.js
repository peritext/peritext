import React, {PropTypes} from 'react';
import {
  StructuredDate,
  StructuredSpan,
  StructuredPerson
} from '../index';

/**
 * dumb component for rendering the structured representation of a section
 */
export default class StructuredMetadataPlaceholder extends React.Component {

  /**
   * propTypes
   * @property {Object} section - section to represent with metadata
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
    const metadata = Object.keys(this.props.section.metadata).reduce((metas, domainKey) => {
      return metas.concat(
        Object.keys(this.props.section.metadata[domainKey]).map(propKey => {
          return {
            key: propKey,
            domain: domainKey,
            value: this.props.section.metadata[domainKey][propKey].value
          };
        }
      ));
    }, []);
    return (
      <div
        className="peritext-structured-metadata-placeholder-container"
        style={{visibility: 'hidden'}}
      >
        {metadata.filter((prop) =>{
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
