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
 * dumb component for rendering the structured representation of a static note
 */

var StaticNote = function (_React$Component) {
  _inherits(StaticNote, _React$Component);

  function StaticNote() {
    _classCallCheck(this, StaticNote);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(StaticNote).apply(this, arguments));
  }

  _createClass(StaticNote, [{
    key: 'render',


    /**
     * render
     * @return {ReactElement} markup
     */


    /**
     * propTypes
     * @property {Object} note - the note object to use in order to render the note content
     */
    value: function render() {
      return _react2.default.createElement(
        'span',
        {
          style: { display: 'block' },
          className: 'peritext-static-note-content-container',
          name: 'peritext-static-note-content-' + this.props.note.id,
          id: 'peritext-static-note-content-' + this.props.note.id
        },
        _react2.default.createElement(
          'a',
          {
            href: '#peritext-static-note-pointer-' + this.props.note.id,
            className: 'peritext-static-note-content-number'
          },
          this.props.note.noteNumber
        ),
        (0, _componentsFactory2.default)(this.props.note.child)
      );
    }
  }]);

  return StaticNote;
}(_react2.default.Component);

StaticNote.propTypes = {
  note: _react.PropTypes.object
};
StaticNote.defaultProps = {};
exports.default = StaticNote;
module.exports = exports['default'];