'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * dumb component for rendering the structured representation of a cite element
 */

var StructuredCite = function (_React$Component) {
  _inherits(StructuredCite, _React$Component);

  function StructuredCite() {
    _classCallCheck(this, StructuredCite);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(StructuredCite).apply(this, arguments));
  }

  _createClass(StructuredCite, [{
    key: 'render',


    /**
     * render
     * @return {ReactElement} markup
     */


    /**
     * propTypes
     * @property {string} value - the value of the cite item
     * @property {string} property - the schema property to apply
     */
    value: function render() {
      return _react2.default.createElement(
        'cite',
        {
          className: 'peritext-structred-cite-container',
          property: this.props.property,
          itemProp: this.props.property
        },
        this.props.value
      );
    }
  }]);

  return StructuredCite;
}(_react2.default.Component);

StructuredCite.propTypes = {
  value: _react.PropTypes.string,
  property: _react.PropTypes.string
};
StructuredCite.defaultProps = {
  property: 'name'
};
exports.default = StructuredCite;
module.exports = exports['default'];