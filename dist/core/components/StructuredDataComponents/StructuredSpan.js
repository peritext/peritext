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
 * dumb generic component for rendering the structured representation of a property
 */

var StructuredSpan = (0, _radium2.default)(_class = function (_React$Component) {
  _inherits(StructuredSpan, _React$Component);

  function StructuredSpan() {
    _classCallCheck(this, StructuredSpan);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(StructuredSpan).apply(this, arguments));
  }

  _createClass(StructuredSpan, [{
    key: 'render',


    /**
     * render
     * @return {ReactElement} markup
     */


    /**
     * propTypes
     * @property {string|number} value - the value to put in the span
     * @property {string} property - the schema property to microformat the span with
     * @property {string} htmlClass - the class to apply to the span element
     */
    value: function render() {
      return _react2.default.createElement(
        'span',
        {
          property: this.props.property,
          itemProp: this.props.property,
          className: this.props.htmlClass
        },
        this.props.value
      );
    }
  }]);

  return StructuredSpan;
}(_react2.default.Component)) || _class;

StructuredSpan.propTypes = {
  value: _react.PropTypes.oneOfType([_react.PropTypes.string, _react.PropTypes.number]),
  property: _react.PropTypes.string,
  htmlClass: _react.PropTypes.string
};
StructuredSpan.defaultProps = {
  property: 'name'
};
exports.default = StructuredSpan;
module.exports = exports['default'];