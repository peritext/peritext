import React, {PropTypes} from 'react';
import Radium from 'radium';

/**
 * dumb component for rendering the structured representation of a cite element
 */
@Radium
export default class StructuredCite extends React.Component {

  /**
   * propTypes
   * @property {string} value - the value of the cite item
   * @property {string} property - the schema property to apply
   */
  static propTypes = {
    value: PropTypes.string,
    property: PropTypes.string
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
      <cite
        className="peritext-structred-cite-container"
        property={this.props.property}
        itemProp={this.props.property}
      >
        {this.props.value}
      </cite>
    );
  }
}
