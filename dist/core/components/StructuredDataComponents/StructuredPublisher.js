'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactStringReplace = require('react-string-replace');

var _reactStringReplace2 = _interopRequireDefault(_reactStringReplace);

var _radium = require('radium');

var _radium2 = _interopRequireDefault(_radium);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * dumb component for rendering the structured representation of publisher information
 */

var StructuredPublisher = (0, _radium2.default)(_class = function (_React$Component) {
  _inherits(StructuredPublisher, _React$Component);

  function StructuredPublisher() {
    _classCallCheck(this, StructuredPublisher);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(StructuredPublisher).apply(this, arguments));
  }

  _createClass(StructuredPublisher, [{
    key: 'updateHtml',


    /**
     * updateHtml : transform pattern+resource props into a react element
     * @param {object} resource - the resource to represent
     * @param {string} pattern - the pattern to represent the resource with
     * @return {ReactElement} markup
     */


    /**
     * propTypes
     * @property {object} resource - the resource parsed for structuring data
     * @property {string} pattern - the pattern to apply for formatting thresource
     * @property {string} property - the microformat property to apply to the structured element
     */
    value: function updateHtml(resource, pattern) {

      var replacedText = (0, _reactStringReplace2.default)(pattern, /(\${publisher})/g, function (match, index) {
        return _react2.default.createElement(
          'span',
          { key: match + index, itemProp: 'name', property: 'name', className: 'peritext-structured-publisher-publisher' },
          resource.publisher
        );
      });

      replacedText = (0, _reactStringReplace2.default)(replacedText, /(\${address})/g, function (match, index) {
        return _react2.default.createElement(
          'span',
          { key: match + index, itemProp: 'address', value: 'address', className: 'peritext-structured-publisher-address' },
          resource.address
        );
      });

      return replacedText;
    }

    /**
     * render
     * @return {ReactElement} markup
     */

  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'span',
        {
          className: 'peritext-structured-publisher-container',
          itemProp: this.props.property,
          property: this.props.property,
          itemScope: true,
          itemType: 'http://schema.org/Organization',
          'typeof': 'Organization',
          resource: this.props.resource.publisher
        },
        this.updateHtml(this.props.resource, this.props.pattern)
      );
    }
  }]);

  return StructuredPublisher;
}(_react2.default.Component)) || _class;

StructuredPublisher.propTypes = {
  resource: _react.PropTypes.object,
  pattern: _react.PropTypes.string,
  property: _react.PropTypes.string
};
StructuredPublisher.defaultProps = {
  pattern: '${publisher} : ${address}',
  property: 'publisher'
};
exports.default = StructuredPublisher;
module.exports = exports['default'];