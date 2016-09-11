'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactIntl = require('react-intl');

var _componentsFactory = require('./../../utils/componentsFactory');

var _componentsFactory2 = _interopRequireDefault(_componentsFactory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var translate = (0, _reactIntl.defineMessages)({
  endfigures: {
    id: 'end_figures',
    description: 'Title of the end figures',
    defaultMessage: 'Figures'
  }
});

/**
 * dumb component for rendering the structured representation of a static section
 */

var StaticEndFigures = function (_React$Component) {
  _inherits(StaticEndFigures, _React$Component);

  function StaticEndFigures() {
    _classCallCheck(this, StaticEndFigures);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(StaticEndFigures).apply(this, arguments));
  }

  _createClass(StaticEndFigures, [{
    key: 'render',


    /**
     * render
     * @return {ReactElement} markup
     */


    /**
     * propTypes
     */
    value: function render() {
      var formatMessage = this.context.intl.formatMessage;

      return _react2.default.createElement(
        'section',
        {
          className: 'peritext-static-end-figures-container peritext-static-end-figures-' + this.props.classSuffix + '-container',
          id: this.props.id
        },
        this.props.contents.length > 0 ? _react2.default.createElement(
          'h4',
          { className: 'peritext-static-end-figures-title' },
          formatMessage(translate.endfigures, {})
        ) : '',
        _react2.default.createElement(
          'div',
          { className: 'peritext-static-end-figures-figures-container' },
          (0, _componentsFactory2.default)(this.props.contents)
        )
      );
    }
  }]);

  return StaticEndFigures;
}(_react2.default.Component);

StaticEndFigures.propTypes = {
  contents: _react.PropTypes.array,
  classSuffix: _react.PropTypes.string,
  id: _react.PropTypes.string
};
StaticEndFigures.defaultProps = {};


StaticEndFigures.contextTypes = { intl: _reactIntl.intlShape };

exports.default = StaticEndFigures;
module.exports = exports['default'];