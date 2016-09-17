'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactIntl = require('react-intl');

var _microDataUtils = require('../../utils/microDataUtils');

var _index = require('../index');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * dumb component for rendering the structured representation of a static document
 */

var StaticDocument = function (_React$Component) {
  _inherits(StaticDocument, _React$Component);

  function StaticDocument() {
    _classCallCheck(this, StaticDocument);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(StaticDocument).apply(this, arguments));
  }

  _createClass(StaticDocument, [{
    key: 'render',


    /**
     * render
     * @return {ReactElement} markup
     */


    /**
     * propTypes
     * @property {Object} document - the reference to the whole document
     * @property {array} sections - the list of rendering sections to include - warning -> can include cover, table of contents, ... sections
     * @property {Object} settings - the rendering settings to use
     */
    value: function render() {
      var _this2 = this;

      var bibType = (0, _microDataUtils.bibToSchema)(this.props.document.metadata.general.bibType.value);
      var id = this.props.document.metadata.general.id.value;
      return _react2.default.createElement(
        'section',
        {
          itemScope: true,
          itemType: 'http://schema.org/' + bibType,
          'typeof': bibType,
          vocab: 'http://schema.org/',
          resource: '#' + id
        },
        _react2.default.createElement(_index.StructuredMetadataPlaceholder, { section: this.props.document }),
        this.props.sections.map(function (section, index) {
          switch (section.type) {

            case 'table-of-contents':
              return section.contents.length ? _react2.default.createElement(_index.StaticTableOfContents, { id: section.id, key: index, contents: section.contents }) : '';

            case 'table-of-figures':
              return section.contents.length ? _react2.default.createElement(_index.StaticTableOfFigures, { id: section.id, key: index, contents: section.contents }) : '';

            case 'front-cover':
              return _react2.default.createElement(_index.StaticFrontCover, { key: index, metadata: section.metadata });

            case 'back-cover':
              return _react2.default.createElement(_index.StaticBackCover, { key: index, metadata: section.metadata });

            case 'endnotes':
              return section.contents.length ? _react2.default.createElement(_index.StaticEndNotes, { id: section.id, key: index, notes: section.contents, classSuffix: 'document-end' }) : '';

            case 'endfigures':
              return section.contents.length ? _react2.default.createElement(_index.StaticEndFigures, { id: section.id, key: index, contents: section.contents, classSuffix: 'document-end' }) : '';

            case 'references':
              return section.contents.length ? _react2.default.createElement(_index.StaticReferencesList, { id: section.id, key: index, references: section.contents, settings: _this2.props.settings }) : '';

            case 'glossary':
              return section.contents.length ? _react2.default.createElement(_index.StaticGlossary, { id: section.id, key: index, elements: section.contents }) : '';

            case 'contents':
              return _react2.default.createElement(_index.StaticSection, { key: index, section: section, settings: _this2.props.settings });

            case 'forewords':
              return _react2.default.createElement(_index.StaticForewords, { key: index, section: section, settings: _this2.props.settings });

            default:
              break;
          }
        })
      );
    }
  }]);

  return StaticDocument;
}(_react2.default.Component);

StaticDocument.propTypes = {
  document: _react.PropTypes.object,
  sections: _react.PropTypes.array,
  settings: _react.PropTypes.object
};
StaticDocument.defaultProps = {};


StaticDocument.contextTypes = { intl: _reactIntl.intlShape };
exports.default = StaticDocument;
module.exports = exports['default'];