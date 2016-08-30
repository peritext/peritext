'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _radium = require('radium');

var _radium2 = _interopRequireDefault(_radium);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * dumb component for rendering the structured representation of a date
 */

var StructuredDate = (0, _radium2.default)(_class = function (_React$Component) {
  _inherits(StructuredDate, _React$Component);

  function StructuredDate() {
    _classCallCheck(this, StructuredDate);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(StructuredDate).apply(this, arguments));
  }

  _createClass(StructuredDate, [{
    key: 'setFinalValue',


    /**
     * Resolves date value against modificator statement
     * @param {string|number} value - value of the date
     * @param {string} modificator - modificator to be applied
     * @return {Object} newVal - the modified value of the date
    */


    /**
     * propTypes
     * @property {number|string} value - the value of the date, as an absolute date number or as a string statement
     * @property {string} property - the schema property to use for microformatting the element
     * @property {string} modificator - the modificator statement to use for formatting the date
     */
    value: function setFinalValue(value, modificator) {
      if (typeof value === 'string' && modificator === 'year') {
        var match = value.match(/([\d]{2,4})/);
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

  }, {
    key: 'render',
    value: function render() {
      var finalValue = this.setFinalValue(this.props.value, this.props.modificator);
      return _react2.default.createElement(
        'time',
        {
          className: 'peritext-structured-date-container',
          property: this.props.property,
          itemProp: this.props.property,
          dateTime: finalValue
        },
        finalValue
      );
    }
  }]);

  return StructuredDate;
}(_react2.default.Component)) || _class;

StructuredDate.propTypes = {
  value: _react.PropTypes.oneOfType([_react.PropTypes.number, _react.PropTypes.string]),
  property: _react.PropTypes.string,
  modificator: _react.PropTypes.string
};
StructuredDate.defaultProps = {
  property: 'datePublished'
};
exports.default = StructuredDate;
module.exports = exports['default'];