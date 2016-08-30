'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _index = require('./../index.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * dumb component for rendering the structured representation of a section
 */

var StructuredMetadataPlaceholder = function (_React$Component) {
  _inherits(StructuredMetadataPlaceholder, _React$Component);

  function StructuredMetadataPlaceholder() {
    _classCallCheck(this, StructuredMetadataPlaceholder);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(StructuredMetadataPlaceholder).apply(this, arguments));
  }

  _createClass(StructuredMetadataPlaceholder, [{
    key: 'render',


    /**
     * render
     * @return {ReactElement} markup
     */


    /**
     * propTypes
     * @property {Object} section - section to represent with metadata
     */
    value: function render() {
      return _react2.default.createElement(
        'div',
        {
          className: 'peritext-structured-metadata-placeholder-container',
          style: { visibility: 'hidden' }
        },
        this.props.section.metadata.filter(function (prop) {
          return prop.domain === 'general';
        }).map(function (meta) {
          switch (meta.key) {
            case 'title':
              return _react2.default.createElement(_index.StructuredSpan, { key: meta.key, property: 'name', value: meta.value });
            case 'date':
              return _react2.default.createElement(_index.StructuredDate, { key: meta.key, property: 'datePublished', value: meta.value });
            case 'author':
              return _react2.default.createElement(
                'span',
                { key: meta.key },
                meta.value.map(function (author) {
                  return _react2.default.createElement(_index.StructuredPerson, { resource: author, key: author.citeKey });
                })
              );
            // TODO : continue along with other metadata-to-schema conversions
            default:
              return '';
          }
        })
      );
    }
  }]);

  return StructuredMetadataPlaceholder;
}(_react2.default.Component);

StructuredMetadataPlaceholder.propTypes = {
  section: _react.PropTypes.object
};
StructuredMetadataPlaceholder.defaultProps = {};
exports.default = StructuredMetadataPlaceholder;
module.exports = exports['default'];