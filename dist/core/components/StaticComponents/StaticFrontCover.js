'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _StructuredPerson = require('./../StructuredDataComponents/StructuredPerson.js');

var _StructuredPerson2 = _interopRequireDefault(_StructuredPerson);

var _radium = require('radium');

var _radium2 = _interopRequireDefault(_radium);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// let styles = {};

/**
 * dumb component for cover page of a static publication of document
 */

var StaticFrontCover = (0, _radium2.default)(_class = function (_React$Component) {
  _inherits(StaticFrontCover, _React$Component);

  function StaticFrontCover() {
    _classCallCheck(this, StaticFrontCover);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(StaticFrontCover).apply(this, arguments));
  }

  _createClass(StaticFrontCover, [{
    key: 'getGeneralProp',


    /**
     * propTypes
     * @property {array} metadata a section metadata to parse in order to fill cover template
     */
    value: function getGeneralProp(list, key) {
      var obj = list.find(function (meta) {
        return meta.domain === 'general' && meta.key === key;
      });
      if (obj) {
        return obj.value;
      }
      return undefined;
    }

    /**
     * render
     * @return {ReactElement} markup
     */

  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'section',
        {
          id: 'peritext-static-front-cover',
          className: 'peritext-static-front-cover-container'
        },
        _react2.default.createElement('div', {
          style: { backgroundImage: 'url(' + this.getGeneralProp(this.props.metadata, 'coverimage') + ')' },
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
              this.getGeneralProp(this.props.metadata, 'dissertationinstitution')
            ),
            _react2.default.createElement(
              'p',
              null,
              'Pour obtenir le grade de DOCTEUR'
            ),
            _react2.default.createElement(
              'h4',
              { className: 'peritext-static-front-cover-dissertationcomment' },
              this.getGeneralProp(this.props.metadata, 'dissertationcomment')
            ),
            _react2.default.createElement(
              'p',
              { className: 'peritext-static-front-cover-dissertationdoctoralschool' },
              'École doctorale ',
              this.getGeneralProp(this.props.metadata, 'dissertationdoctoralschool')
            ),
            _react2.default.createElement(
              'p',
              { className: 'peritext-static-front-cover-dissertationdiscipline' },
              'Mention : ',
              _react2.default.createElement(
                'span',
                null,
                this.getGeneralProp(this.props.metadata, 'dissertationdiscipline')
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
              this.getGeneralProp(this.props.metadata, 'author').map(function (person) {
                return _react2.default.createElement(_StructuredPerson2.default, { key: person.citeKey, resource: person });
              })
            ),
            _react2.default.createElement(
              'p',
              { className: 'peritext-static-front-cover-dissertationlab' },
              this.getGeneralProp(this.props.metadata, 'dissertationlab')
            )
          ),
          _react2.default.createElement(
            'section',
            { className: 'peritext-static-front-cover-part-bottom-left' },
            _react2.default.createElement(
              'h1',
              null,
              this.getGeneralProp(this.props.metadata, 'title')
            )
          ),
          _react2.default.createElement(
            'section',
            { className: 'peritext-static-front-cover-part-bottom-right' },
            _react2.default.createElement(
              'p',
              { className: 'peritext-static-front-cover-date' },
              'Thèse soutenue le ',
              this.getGeneralProp(this.props.metadata, 'date')
            ),
            _react2.default.createElement(
              'p',
              null,
              'devant le jury composé de :'
            ),
            this.getGeneralProp(this.props.metadata, 'dissertationjury').map(function (person) {
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
}(_react2.default.Component)) || _class;

StaticFrontCover.propTypes = {
  metadata: _react.PropTypes.array
};
StaticFrontCover.defaultProps = {};
exports.default = StaticFrontCover;
module.exports = exports['default'];