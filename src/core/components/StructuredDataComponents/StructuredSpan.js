import React, {PropTypes} from 'react';
import Radium from 'radium';

/**
 * dumb generic component for rendering the structured representation of a property
 */
@Radium
export default class StructuredSpan extends React.Component {

  /**
   * propTypes
   * @property {string|number} value - the value to put in the span
   * @property {string} property - the schema property to microformat the span with
   * @property {string} htmlClass - the class to apply to the span element
   */
  static propTypes = {
    value: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]),
    property: PropTypes.string,
    htmlClass: PropTypes.string
  };

  static defaultProps = {
    property: 'name'
  };

  /**
   * render
   * @return {ReactElement} markup
   */
  render() {
    return (
      <span
        property={this.props.property}
        itemProp={this.props.property}
        className={this.props.htmlClass}
      >
        {this.props.value}
      </span>
    );
  }
}
