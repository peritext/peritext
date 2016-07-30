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

// let styles = {};
/**
 * dumb component for displaying a simple structured image figure
 */

var StaticImageFigure = (0, _radium2.default)(_class = function (_React$Component) {
  _inherits(StaticImageFigure, _React$Component);

  function StaticImageFigure() {
    _classCallCheck(this, StaticImageFigure);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(StaticImageFigure).apply(this, arguments));
  }

  _createClass(StaticImageFigure, [{
    key: 'render',


    /**
     * render
     * @return {ReactElement} markup
     */


    /**
     * propTypes
     * @property {string} schematype html schema type of the element
     * @property {object} resource the resource to be parsed
     * @property {string} captionContent what to display as caption
     * @property {number} figureNumber in static mode, the number of the figure
     */
    value: function render() {
      return _react2.default.createElement(
        'figure',
        {
          className: 'peritext-static-image-figure-container',
          itemProp: 'image',
          value: 'image',
          itemScope: true,
          itemType: 'http://schema.org/ImageObject',
          'typeof': 'ImageObject'
        },
        _react2.default.createElement('a', {
          href: this.props.resource[this.props.imageKey],
          itemProp: 'url',
          property: 'url',
          value: this.props.resource[this.props.imageKey]
        }),
        _react2.default.createElement('img', {
          itemProp: 'contentUrl',
          value: 'contentUrl',
          src: this.props.resource[this.props.imageKey],
          alt: this.props.resource.title
        })
      );
    }
  }]);

  return StaticImageFigure;
}(_react2.default.Component)) || _class;

StaticImageFigure.propTypes = {
  schematype: _react.PropTypes.string,
  resource: _react.PropTypes.object,
  imageKey: _react.PropTypes.string,
  captionContent: _react.PropTypes.array,
  figureNumber: _react.PropTypes.number
};
StaticImageFigure.defaultProps = {
  schematype: 'ImageObject',
  captionContent: [],
  imageKey: 'imageurl'
};
exports.default = StaticImageFigure;
module.exports = exports['default'];