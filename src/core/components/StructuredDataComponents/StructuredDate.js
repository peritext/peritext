import React, {PropTypes} from 'react';
import Radium from 'radium';

// let styles = {};

/**
 * dumb component for rendering the structured representation of a date
 */
@Radium
export default class StructuredDate extends React.Component {

  /**
   * propTypes
   */
  static propTypes = {
    value: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string
    ]),
    property: PropTypes.string,
    modificator: PropTypes.string
  };

  static defaultProps = {
    property: 'datePublished'
  };

  setFinalValue(value, modificator) {
    if (typeof value === 'string' && modificator === 'year') {
      const match = value.match(/([\d]{2,4})/);
      if (match) {
        return match[1];
      }
    }
    return value;
  }

  /**
   * render
   * @return {ReactElement} markup
   */
  render() {
    const finalValue = this.setFinalValue(this.props.value, this.props.modificator);
    return (
      <time
        className="peritext-contents-date"
        property={this.props.property}
        itemProp={this.props.property}
        dateTime={finalValue}
      >
        {finalValue}
      </time>
    );
  }
}
