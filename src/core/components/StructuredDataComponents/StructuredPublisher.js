import React, {PropTypes} from 'react';
import reactStringReplace from 'react-string-replace';
import Radium from 'radium';

// let styles = {};

/**
 * dumb component for rendering the structured representation of publisher information
 */
@Radium
export default class StructuredPublisher extends React.Component {

  /**
   * propTypes
   * @property {object} resource the resource parsed for structuring data
   * @property {string} pattern the pattern to apply for formatting thresource
   * @property {string} property the microformat property to apply to the structured element
   */
  static propTypes = {
    resource: PropTypes.object,
    pattern: PropTypes.string,
    property: PropTypes.string
  };

  static defaultProps = {
    pattern: '${publisher} : ${address}',
    property: 'publisher'
  };

  /**
   * updateHtml : transform pattern+resource props into a react element
   * @return {ReactElement} markup
   */
  updateHtml(resource, pattern) {

    let replacedText = reactStringReplace(pattern, /(\${publisher})/g, (match, index)=> (
      <span key={match + index} itemProp="name" property="name" className="peritext-contents-citation-publisher">{resource.publisher}</span>
    ));

    replacedText = reactStringReplace(replacedText, /(\${address})/g, (match, index)=> (
      <span key={match + index} itemProp="address" value="address" className="peritext-contents-citation-address">{resource.address}</span>
    ));

    return replacedText;
  }

  /**
   * render
   * @return {ReactElement} markup
   */
  render() {
    return (
      <span
        className="peritext-contents-publisher"
        itemProp={this.props.property}
        property={this.props.property}
        itemScope
        itemType="http://schema.org/Organization"
        typeof="Organization"
        resource={this.props.resource.publisher}
      >
        {this.updateHtml(this.props.resource, this.props.pattern)}
      </span>
    );
  }
}
