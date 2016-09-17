'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _index = require('../index');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * dumb component for back cover page of a static publication of document
 */

var StaticBackCover = function (_React$Component) {
  _inherits(StaticBackCover, _React$Component);

  function StaticBackCover() {
    _classCallCheck(this, StaticBackCover);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(StaticBackCover).apply(this, arguments));
  }

  _createClass(StaticBackCover, [{
    key: 'render',


    /**
     * render
     * @return {ReactElement} markup
     */


    /**
     * propTypes
     * @property {Object} metadata - a section metadata to parse in order to fill cover template
     */
    value: function render() {
      return _react2.default.createElement(
        'section',
        {
          id: 'peritext-static-back-cover',
          className: 'peritext-static-back-cover-container'
        },
        _react2.default.createElement(
          'h2',
          null,
          this.props.metadata.general.title && this.props.metadata.general.title.value
        ),
        _react2.default.createElement(
          'h3',
          { className: 'peritext-static-authors' },
          this.props.metadata.general.author.value.map(function (person) {
            return _react2.default.createElement(_index.StructuredPerson, { key: person.id, resource: person });
          })
        ),
        _react2.default.createElement(
          'p',
          null,
          this.props.metadata.general.abstract && this.props.metadata.general.abstract.value
        )
      );
    }
  }]);

  return StaticBackCover;
}(_react2.default.Component);

StaticBackCover.propTypes = {
  metadata: _react.PropTypes.object
};
StaticBackCover.defaultProps = {};
exports.default = StaticBackCover;
module.exports = exports['default'];