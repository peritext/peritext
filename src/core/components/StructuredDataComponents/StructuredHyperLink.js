import React, {PropTypes} from 'react';
import Radium from 'radium';

// let styles = {};

/**
 * dumb component for displaying a structured simple hyperlink <a>
 */
@Radium
export default class StructuredHyperLink extends React.Component {

  /**
   * propTypes
   * @property {string} schematype html schema type of the element
   * @property {string} text the text to display inside the hyperlink
   * @property {object} resource the resource to be parsed
   * @property {object} property the microformat property of the hyperlink
   */
  static propTypes = {
    text: PropTypes.string,
    schematype: PropTypes.string,
    resource: PropTypes.object,
    property: PropTypes.string
  };

  static defaultProps = {
    schematype: 'website',
    property: 'citation'
  };

  /**
   * render
   * @return {ReactElement} markup
   */
  render() {
    const invisibleStyle = {
      display: 'none'
    };
    return (
            <a className="peritext-structured-hyperlink-container"
                itemScope
                itemProp={this.props.property}
                itemType={'http://schema.org/' + this.props.schematype}
                typeof={this.props.schematype}
                resource={'#' + this.props.resource.citeKey}
            >
              <span
                itemProp="name"
                property="name"
                value={this.props.resource.title}
                style={invisibleStyle}
              >
                {this.props.resource.title}
              </span>
              <span
                itemrop="name"
                property="name"
                value={this.props.resource.url}
                style={invisibleStyle}
              >
                {this.props.resource.url}
              </span>
              <span>
                {this.props.text}
              </span>
            </a>
          );
  }
}
