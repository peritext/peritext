'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _StructuredPerson = require('../StructuredDataComponents/StructuredPerson');

var _StructuredPerson2 = _interopRequireDefault(_StructuredPerson);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * dumb component for cover page of a static publication of document
 */

var StaticFrontCover = function (_React$Component) {
  _inherits(StaticFrontCover, _React$Component);

  function StaticFrontCover() {
    _classCallCheck(this, StaticFrontCover);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(StaticFrontCover).apply(this, arguments));
  }

  _createClass(StaticFrontCover, [{
    key: 'render',


    /**
     * render
     * @return {ReactElement} markup
     */


    /**
     * propTypes
     * @property {Object} metadata a section metadata to parse in order to fill cover template
     */
    value: function render() {
      var bibType = this.props.metadata.general.bibType.value;
      if (bibType !== 'phdthesis') {
        return _react2.default.createElement(
          'section',
          {
            id: 'peritext-static-front-cover',
            className: 'peritext-static-front-cover-container'
          },
          _react2.default.createElement(
            'h1',
            null,
            this.props.metadata.general.title && this.props.metadata.general.title.value
          ),
          _react2.default.createElement(
            'h2',
            { className: 'peritext-static-authors' },
            this.props.metadata.general.author.value.map(function (person) {
              return _react2.default.createElement(_StructuredPerson2.default, { key: person.citeKey, resource: person });
            })
          )
        );
      }
      return _react2.default.createElement(
        'section',
        {
          id: 'peritext-static-front-cover',
          className: 'peritext-static-front-cover-container'
        },
        _react2.default.createElement('div', {
          style: { backgroundImage: 'url(' + (this.props.metadata.general.coverimage && this.props.metadata.general.coverimage.value) + ')' },
          id: 'peritext-static-front-cover-image-container'
        }),
        _react2.default.createElement(
          'div',
          {
            className: 'peritext-static-front-cover-texts-container'
          },
          _react2.default.createElement(
            'section',
            { className: 'peritext-static-front-cover-part-top-left' },
            _react2.default.createElement(
              'h3',
              { className: 'peritext-static-front-cover-dissertationinstitution' },
              'Thèse / ',
              this.props.metadata.general.dissertationinstitution && this.props.metadata.general.dissertationinstitution.value
            ),
            _react2.default.createElement(
              'p',
              null,
              'Pour obtenir le grade de DOCTEUR'
            ),
            _react2.default.createElement(
              'h4',
              { className: 'peritext-static-front-cover-dissertationcomment' },
              this.props.metadata.general.dissertationcomment && this.props.metadata.general.dissertationcomment.value
            ),
            _react2.default.createElement(
              'p',
              { className: 'peritext-static-front-cover-dissertationdoctoralschool' },
              'École doctorale ',
              this.props.metadata.general.dissertationdoctoralschool && this.props.metadata.general.dissertationdoctoralschool.value
            ),
            _react2.default.createElement(
              'p',
              { className: 'peritext-static-front-cover-dissertationdiscipline' },
              'Mention : ',
              _react2.default.createElement(
                'span',
                null,
                this.props.metadata.general.dissertationdiscipline && this.props.metadata.general.dissertationdiscipline.value
              )
            )
          ),
          _react2.default.createElement(
            'section',
            { className: 'peritext-static-front-cover-part-top-right' },
            _react2.default.createElement(
              'p',
              null,
              'présentée par'
            ),
            _react2.default.createElement(
              'h1',
              { className: 'peritext-static-authors' },
              this.props.metadata.general.author.value.map(function (person) {
                return _react2.default.createElement(_StructuredPerson2.default, { key: person.citeKey, resource: person });
              })
            ),
            _react2.default.createElement(
              'p',
              { className: 'peritext-static-front-cover-dissertationlab' },
              this.props.metadata.general.dissertationlab && this.props.metadata.general.dissertationlab.value
            )
          ),
          _react2.default.createElement(
            'section',
            { className: 'peritext-static-front-cover-part-bottom-left' },
            _react2.default.createElement(
              'h1',
              null,
              this.props.metadata.general.title && this.props.metadata.general.title.value
            )
          ),
          _react2.default.createElement(
            'section',
            { className: 'peritext-static-front-cover-part-bottom-right' },
            _react2.default.createElement(
              'p',
              { className: 'peritext-static-front-cover-date' },
              'Thèse soutenue le ',
              this.props.metadata.general.date && this.props.metadata.general.date.value
            ),
            _react2.default.createElement(
              'p',
              null,
              'devant le jury composé de :'
            ),
            this.props.metadata.general.dissertationjury.value.map(function (person) {
              return _react2.default.createElement(
                'p',
                { key: person.citeKey, className: 'peritext-static-front-cover-jury-member' },
                _react2.default.createElement(_StructuredPerson2.default, { resource: person, pattern: '${firstName} ${lastName:capitals} ${information} / ${role}' })
              );
            })
          )
        )
      );
    }
  }]);

  return StaticFrontCover;
}(_react2.default.Component);

StaticFrontCover.propTypes = {
  metadata: _react.PropTypes.object
};
StaticFrontCover.defaultProps = {};
exports.default = StaticFrontCover;
module.exports = exports['default'];