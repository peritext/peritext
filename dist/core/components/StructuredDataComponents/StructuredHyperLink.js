'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class;

// let styles = {};


var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _radium = require('radium');

var _radium2 = _interopRequireDefault(_radium);

var _componentsFactory = require('./../../utils/componentsFactory');

var _componentsFactory2 = _interopRequireDefault(_componentsFactory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * dumb component for displaying a structured simple hyperlink <a>
 */

var StructuredHyperLink = (0, _radium2.default)(_class = function (_React$Component) {
  _inherits(StructuredHyperLink, _React$Component);

  function StructuredHyperLink() {
    _classCallCheck(this, StructuredHyperLink);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(StructuredHyperLink).apply(this, arguments));
  }

  _createClass(StructuredHyperLink, [{
    key: 'render',


    /**
     * render
     * @return {ReactElement} markup
     */


    /**
     * propTypes
     * @property {string} schematype html schema type of the element
     * @property {array} contents the text to display inside the hyperlink
     * @property {object} resource the resource to be parsed
     * @property {object} property the microformat property of the hyperlink
     */
    value: function render() {
      var invisibleStyle = {
        display: 'none'
      };
      return _react2.default.createElement(
        'a',
        { className: 'peritext-structured-hyperlink-container',
          itemScope: true,
          itemProp: this.props.property,
          itemType: 'http://schema.org/' + this.props.schematype,
          'typeof': this.props.schematype,
          resource: '#' + this.props.resource.citeKey,
          href: this.props.resource.url
        },
        _react2.default.createElement(
          'span',
          {
            itemProp: 'name',
            property: 'name',
            value: this.props.resource.title,
            style: invisibleStyle
          },
          this.props.resource.title
        ),
        _react2.default.createElement(
          'span',
          {
            itemrop: 'name',
            property: 'name',
            value: this.props.resource.url,
            style: invisibleStyle
          },
          this.props.resource.url
        ),
        _react2.default.createElement(
          'span',
          null,
          (0, _componentsFactory2.default)(this.props.contents)
        )
      );
    }
  }]);

  return StructuredHyperLink;
}(_react2.default.Component)) || _class;

StructuredHyperLink.propTypes = {
  contents: _react.PropTypes.array,
  schematype: _react.PropTypes.string,
  resource: _react.PropTypes.object,
  property: _react.PropTypes.string
};
StructuredHyperLink.defaultProps = {
  schematype: 'website',
  property: 'citation'
};
exports.default = StructuredHyperLink;
module.exports = exports['default'];