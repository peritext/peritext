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

var _index = require('./../index.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * dumb component for back cover page of a static publication of document
 */

var StaticBackCover = (0, _radium2.default)(_class = function (_React$Component) {
  _inherits(StaticBackCover, _React$Component);

  function StaticBackCover() {
    _classCallCheck(this, StaticBackCover);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(StaticBackCover).apply(this, arguments));
  }

  _createClass(StaticBackCover, [{
    key: 'getGeneralProp',


    /**
     * Util for returning the value of a "general" type metadata
     * @param {array} list - the list of metadata
     * @param {string} key - the key of the metadata prop
     * @return {string} value
     */


    /**
     * propTypes
     * @property {array} metadata - a section metadata to parse in order to fill cover template
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
          id: 'peritext-static-back-cover',
          className: 'peritext-static-back-cover'
        },
        _react2.default.createElement(
          'h2',
          null,
          this.getGeneralProp(this.props.metadata, 'title')
        ),
        _react2.default.createElement(
          'h3',
          { className: 'peritext-static-authors' },
          this.getGeneralProp(this.props.metadata, 'author').map(function (person) {
            return _react2.default.createElement(_index.StructuredPerson, { key: person.citeKey, resource: person });
          })
        ),
        _react2.default.createElement(
          'p',
          null,
          this.getGeneralProp(this.props.metadata, 'abstract')
        )
      );
    }
  }]);

  return StaticBackCover;
}(_react2.default.Component)) || _class;

StaticBackCover.propTypes = {
  metadata: _react.PropTypes.array
};
StaticBackCover.defaultProps = {};
exports.default = StaticBackCover;
module.exports = exports['default'];