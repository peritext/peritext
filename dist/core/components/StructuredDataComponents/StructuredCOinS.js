'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _microDataUtils = require('./../../utils/microDataUtils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// let styles = {};

/**
 * dumb component for rendering the structured representation of a cited element in the format of openUrl/Context Object in Span
 */

var StructuredCOinS = function (_React$Component) {
  _inherits(StructuredCOinS, _React$Component);

  function StructuredCOinS() {
    _classCallCheck(this, StructuredCOinS);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(StructuredCOinS).apply(this, arguments));
  }

  _createClass(StructuredCOinS, [{
    key: 'render',


    /**
     * render
     * @return {ReactElement} markup
     */


    /**
     * propTypes
     */
    value: function render() {
      var openUrl = (0, _microDataUtils.generateOpenUrl)(this.props.resource);
      return _react2.default.createElement('span', { className: 'peritext-structured-context-object-in-span-container Z3988', title: openUrl });
    }
  }]);

  return StructuredCOinS;
}(_react2.default.Component);

StructuredCOinS.propTypes = {
  resource: _react.PropTypes.object
};
StructuredCOinS.defaultProps = {};
exports.default = StructuredCOinS;
module.exports = exports['default'];