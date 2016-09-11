'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _componentsFactory = require('./../../utils/componentsFactory');

var _componentsFactory2 = _interopRequireDefault(_componentsFactory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * dumb component for containing either a static or dynamic note, acting whether as a pointer or as a container
 */

var StaticFootnote = function (_React$Component) {
  _inherits(StaticFootnote, _React$Component);

  function StaticFootnote() {
    _classCallCheck(this, StaticFootnote);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(StaticFootnote).apply(this, arguments));
  }

  _createClass(StaticFootnote, [{
    key: 'render',


    /**
     * render
     * @return {ReactElement} markup
     */


    /**
     * propTypes
     * @property {Object} note - the note object to use in order to render the footnote
     */
    value: function render() {
      return _react2.default.createElement(
        'sup',
        {
          className: 'peritext-static-note-content-container',
          name: 'peritext-static-note-content-' + this.props.note.id,
          id: 'peritext-static-note-content-' + this.props.note.id
        },
        (0, _componentsFactory2.default)(this.props.note.child)
      );
    }
  }]);

  return StaticFootnote;
}(_react2.default.Component);

StaticFootnote.propTypes = {
  note: _react.PropTypes.object
};
StaticFootnote.defaultProps = {};
exports.default = StaticFootnote;
module.exports = exports['default'];