'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactIntl = require('react-intl');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var translate = (0, _reactIntl.defineMessages)({
  tableoffigures: {
    id: 'table_of_figures',
    description: 'Table of figures title',
    defaultMessage: 'Table of figures'
  },
  figurename: {
    id: 'figure',
    description: 'Name of a figure',
    defaultMessage: 'Figure'
  }
});

/**
 * dumb component for rendering a static table of figures
 */

var StaticTableOfFigures = function (_React$Component) {
  _inherits(StaticTableOfFigures, _React$Component);

  function StaticTableOfFigures() {
    _classCallCheck(this, StaticTableOfFigures);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(StaticTableOfFigures).apply(this, arguments));
  }

  _createClass(StaticTableOfFigures, [{
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
          id: this.props.id,
          className: 'peritext-static-table-of-figures-container'
        },
        _react2.default.createElement(
          'h2',
          null,
          formatMessage(translate.tableoffigures, {})
        ),
        _react2.default.createElement(
          'section',
          { className: 'peritext-static-table-of-figures-elements-container' },
          this.props.contents.map(function (element, index) {
            return _react2.default.createElement(
              'section',
              {
                className: 'peritext-static-table-of-figures-element',
                key: element.id + index },
              _react2.default.createElement(
                'a',
                {
                  href: '#' + element.id
                },
                formatMessage(translate.figurename, {}),
                ' ',
                element.number
              )
            );
          })
        )
      );
    }
  }]);

  return StaticTableOfFigures;
}(_react2.default.Component);

StaticTableOfFigures.propTypes = {
  contents: _react.PropTypes.array,
  id: _react.PropTypes.string
};
StaticTableOfFigures.defaultProps = {
  contents: []
};


StaticTableOfFigures.contextTypes = { intl: _reactIntl.intlShape };

exports.default = StaticTableOfFigures;
module.exports = exports['default'];