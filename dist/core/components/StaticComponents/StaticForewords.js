'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _microDataUtils = require('../../utils/microDataUtils');

var _index = require('../index');

var _componentsFactory = require('../../utils/componentsFactory');

var _componentsFactory2 = _interopRequireDefault(_componentsFactory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * dumb component for rendering the structured representation of a static section
 */

var StaticForewords = function (_React$Component) {
  _inherits(StaticForewords, _React$Component);

  function StaticForewords() {
    _classCallCheck(this, StaticForewords);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(StaticForewords).apply(this, arguments));
  }

  _createClass(StaticForewords, [{
    key: 'render',


    /**
     * render
     * @return {ReactElement} markup
     */


    /**
     * propTypes
     * @property {Object} section - the section to render
     * @property {Object} settings - the settings to use for section rendering
     */
    value: function render() {
      var bibType = (0, _microDataUtils.bibToSchema)(this.props.section.metadata.general.bibType.value);
      var id = this.props.section.metadata.general.id.value;
      return _react2.default.createElement(
        'section',
        {
          className: 'peritext-static-section-container peritext-static-forewords-container',
          id: id,
          itemScope: true,
          itemType: 'http://schema.org/' + bibType,
          'typeof': bibType,
          resource: '#' + id,
          itemProp: 'hasPart',
          property: 'hasPart'
        },
        _react2.default.createElement(_index.StructuredMetadataPlaceholder, { section: this.props.section }),
        (0, _componentsFactory2.default)(this.props.section.contents),
        this.props.settings.figuresPosition === 'section-end' && this.props.section.figures ? _react2.default.createElement(_index.StaticEndFigures, {
          contents: this.props.section.figures,
          classSuffix: 'section-end'
        }) : '',
        this.props.settings.notesPosition === 'section-end' && this.props.section.notes.length ? _react2.default.createElement(_index.StaticEndNotes, {
          classSuffix: 'section-end',
          notes: this.props.section.notes
        }) : ''
      );
    }
  }]);

  return StaticForewords;
}(_react2.default.Component);

StaticForewords.propTypes = {
  section: _react.PropTypes.object,
  settings: _react.PropTypes.object
};
StaticForewords.defaultProps = {};
exports.default = StaticForewords;
module.exports = exports['default'];