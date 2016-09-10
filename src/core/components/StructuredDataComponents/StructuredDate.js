import React, {PropTypes} from 'react';

/**
 * dumb component for rendering the structured representation of a date
 */
export default class StructuredDate extends React.Component {

  /**
   * propTypes
   * @property {number|string} value - the value of the date, as an absolute date number or as a string statement
   * @property {string} property - the schema property to use for microformatting the element
   * @property {string} modificator - the modificator statement to use for formatting the date
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

  /**
   * Resolves date value against modificator statement
   * @param {string|number} value - value of the date
   * @param {string} modificator - modificator to be applied
   * @return {Object} newVal - the modified value of the date
  */
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
        className="peritext-structured-date-container"
        property={this.props.property}
        itemProp={this.props.property}
        dateTime={finalValue}
      >
        {finalValue}
      </time>
    );
  }
}
