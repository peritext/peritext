import React, {PropTypes} from 'react';
import HtmlToReact from 'html-to-react';
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

  htmlToReactParser = new HtmlToReact.Parser(React);

  /**
   * updateHtml : transform pattern+resource props into a react element
   * @return {ReactElement} markup
   */
  updateHtml(resource, pattern) {
    const publisherExpression = ['<span itemProp="name" property="name">',
                                  '</span>'];

    let expression = pattern.replace('${publisher}', publisherExpression[0] + resource.publisher + publisherExpression[1]);

    if (resource.address) {
      expression = expression.replace('${address}', '<span itemProp="address" value="address">' + resource.address + '</span>');
    }

    return this.htmlToReactParser.parse('<span>' + expression + '</span>');
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
