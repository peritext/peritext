'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _components = require('./../../core/components');

var _componentsFactory = require('./../../core/utils/componentsFactory');

var _componentsFactory2 = _interopRequireDefault(_componentsFactory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * dumb static-oriented component for displaying a webpage poster image
 */

var StructuredWebsitePoster = function (_React$Component) {
  _inherits(StructuredWebsitePoster, _React$Component);

  function StructuredWebsitePoster() {
    _classCallCheck(this, StructuredWebsitePoster);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(StructuredWebsitePoster).apply(this, arguments));
  }

  _createClass(StructuredWebsitePoster, [{
    key: 'render',


    /**
     * render
     * @return {ReactElement} markup
     */


    /**
     * propTypes
     * @property {string} schematype html schema type of the element
     * @property {object} resource the resource to be parsed
     * @property {array} captionContent what to display as caption
     * @property {number} figureNumber in static mode, the number of the figure
     */
    value: function render() {
      var invisibleStyle = {
        display: 'none'
      };
      var contents = [{
        node: 'text',
        text: this.props.resource.url
      }];
      return _react2.default.createElement(
        'figure',
        {
          role: 'group',
          className: 'peritext-static-website-poster-container peritext-figure-container',
          itemScope: true,
          itemProp: 'citation',
          itemType: 'http://schema.org/' + this.props.schematype,
          'typeof': this.props.schematype,
          resource: '#' + this.props.resource.citeKey,
          id: 'peritext-figure-' + this.props.id
        },
        _react2.default.createElement(
          'span',
          {
            itemProp: 'name',
            property: 'name',
            style: invisibleStyle
          },
          this.props.resource.title
        ),
        _react2.default.createElement(_components.StaticImageFigure, this.props),
        _react2.default.createElement(
          'figcaption',
          {
            itemProp: 'description',
            property: 'description'
          },
          'Figure ',
          this.props.figureNumber,
          ' – ',
          (0, _componentsFactory2.default)(this.props.captionContent),
          ' – ',
          _react2.default.createElement(_components.StructuredHyperLink, { contents: contents, resource: this.props.resource })
        )
      );
    }
  }]);

  return StructuredWebsitePoster;
}(_react2.default.Component);

StructuredWebsitePoster.propTypes = {
  schematype: _react.PropTypes.string,
  resource: _react.PropTypes.object.isRequired,
  captionContent: _react.PropTypes.array,
  figureNumber: _react.PropTypes.number,
  id: _react.PropTypes.string
};
StructuredWebsitePoster.defaultProps = {
  schematype: 'website',
  captionContent: ''
};
exports.default = StructuredWebsitePoster;
module.exports = exports['default'];