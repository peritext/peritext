'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactStringReplace = require('react-string-replace');

var _reactStringReplace2 = _interopRequireDefault(_reactStringReplace);

var _index = require('./../index');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * dumb component for rendering the structured representation of parent journal information
 */

var StructuredParentJournal = function (_React$Component) {
  _inherits(StructuredParentJournal, _React$Component);

  function StructuredParentJournal() {
    _classCallCheck(this, StructuredParentJournal);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(StructuredParentJournal).apply(this, arguments));
  }

  _createClass(StructuredParentJournal, [{
    key: 'updateHtml',


    /**
     * updateHtml : transform pattern+resource props into a react element
     * @param {object} resource - the resource to render
     * @param {string} pattern - the pattern to use for rendering the resource
     * @return {ReactElement} markup
     */


    /**
     * propTypes
     * @property {object} resource - the resource parsed for structuring data
     * @property {string} pattern - the pattern to apply for formatting thresource
     * @property {string} property - the microformat property to apply to the structured element
     */
    value: function updateHtml(resource, pattern) {
      var replacedText = void 0;
      replacedText = (0, _reactStringReplace2.default)(pattern, /(\${journal})/g, function (match, index) {
        return _react2.default.createElement(
          'span',
          { key: match + index, className: 'peritext-structured-parent-journal-journal' },
          resource.journal
        );
      });

      replacedText = (0, _reactStringReplace2.default)(replacedText, /(\${date})/g, function (match, index) {
        return _react2.default.createElement(
          'span',
          { key: match + index, className: 'peritext-structured-parent-journal-date' },
          resource.date || resource.year
        );
      });

      replacedText = (0, _reactStringReplace2.default)(replacedText, /(\${volume})/g, function (match, index) {
        return _react2.default.createElement(
          'span',
          { key: match + index, className: 'peritext-structured-parent-journal-volume' },
          resource.volume
        );
      });

      replacedText = (0, _reactStringReplace2.default)(replacedText, /(\${issue})/g, function (match, index) {
        return _react2.default.createElement(
          'span',
          { key: match + index, className: 'peritext-structured-parent-journal-issue' },
          resource.issue
        );
      });

      replacedText = (0, _reactStringReplace2.default)(replacedText, /(\${issn})/g, function (match, index) {
        return _react2.default.createElement(
          'span',
          { key: match + index, className: 'peritext-structured-parent-journal-issn' },
          resource.issn
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
          className: 'peritext-structured-parent-journal-container',
          itemProp: this.props.property,
          property: this.props.property,
          itemScope: true,
          itemType: 'http://schema.org/Periodical',
          'typeof': 'Periodical',
          resource: this.props.resource.issn + this.props.resource.journal
        },
        _react2.default.createElement(
          'span',
          { style: { display: 'none' }, itemProp: 'name', property: 'name' },
          this.props.resource.journal
        ),
        _react2.default.createElement(
          'span',
          {
            itemProp: 'hasPart',
            property: 'hasPart',
            itemScope: true,
            itemType: 'http://schema.org/PublicationVolume',
            'typeof': 'PublicationVolume',
            resource: this.props.resource.issn + this.props.resource.journal + '-volume' + this.props.resource.volume,
            style: { display: 'none' }
          },
          _react2.default.createElement(
            'span',
            { itemProp: 'volumeNumber', property: 'volumeNumber' },
            this.props.resource.volume
          ),
          _react2.default.createElement(
            'span',
            {
              itemProp: 'hasPart',
              property: 'hasPart',
              itemScope: true,
              itemType: 'http://schema.org/PublicationIssue',
              'typeof': 'PublicationIssue',
              resource: this.props.resource.issn + this.props.resource.journal + '-volume' + this.props.resource.volume + '-issue' + this.props.resource.issue
            },
            _react2.default.createElement(
              'span',
              { itemProp: 'issueNumber', property: 'issueNumber' },
              this.props.resource.issue
            ),
            _react2.default.createElement(_index.StructuredDate, { value: this.props.resource.date || this.props.resource.year })
          )
        ),
        _react2.default.createElement(
          'span',
          {
            itemProp: 'issn',
            style: { display: 'none' },
            property: 'issn' },
          this.props.resource.issn
        ),
        this.updateHtml(this.props.resource, this.props.pattern)
      );
    }
  }]);

  return StructuredParentJournal;
}(_react2.default.Component);

StructuredParentJournal.propTypes = {
  resource: _react.PropTypes.object,
  pattern: _react.PropTypes.string,
  property: _react.PropTypes.string
};
StructuredParentJournal.defaultProps = {
  pattern: '${journal}, ${date}, ${volume}(${issue}). ISSN : ${issn}',
  property: 'isPartOf'
};
exports.default = StructuredParentJournal;
module.exports = exports['default'];