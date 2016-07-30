'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _radium = require('radium');

var _radium2 = _interopRequireDefault(_radium);

var _reactIntl = require('react-intl');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// let styles = {};

var translate = (0, _reactIntl.defineMessages)({
  tableofcontents: {
    id: 'table_of_contents',
    description: 'Table of contents title',
    defaultMessage: 'Table of contents'
  }
});

/**
 * dumb component for rendering a static table of contents
 */

var StaticTableOfContents = (0, _radium2.default)(_class = function (_React$Component) {
  _inherits(StaticTableOfContents, _React$Component);

  function StaticTableOfContents() {
    _classCallCheck(this, StaticTableOfContents);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(StaticTableOfContents).apply(this, arguments));
  }

  _createClass(StaticTableOfContents, [{
    key: 'render',


    /**
     * render
     * @return {ReactElement} markup
     */


    /**
     * propTypes
     */
    value: function render() {
      var _this2 = this;

      var formatMessage = this.context.intl.formatMessage;

      return _react2.default.createElement(
        'section',
        {
          id: this.props.id,
          className: 'peritext-static-table-of-contents-container'
        },
        _react2.default.createElement(
          'h2',
          null,
          formatMessage(translate.tableofcontents, {})
        ),
        _react2.default.createElement(
          'section',
          { className: 'peritext-static-table-of-contents-elements-container' },
          this.props.contents.map(function (element) {
            return _react2.default.createElement(StaticTableOfContentsElement, { id: element.id, key: element.id, title: element.title, level: element.level, levelDisplacement: _this2.props.level });
          })
        )
      );
    }
  }]);

  return StaticTableOfContents;
}(_react2.default.Component)) || _class;

StaticTableOfContents.propTypes = {
  contents: _react.PropTypes.array,
  level: _react.PropTypes.number,
  id: _react.PropTypes.string
};
StaticTableOfContents.defaultProps = {
  title: 'Table of contents',
  level: 1
};


StaticTableOfContents.contextTypes = { intl: _reactIntl.intlShape };

exports.default = StaticTableOfContents;

var StaticTableOfContentsElement = function (_React$Component2) {
  _inherits(StaticTableOfContentsElement, _React$Component2);

  function StaticTableOfContentsElement() {
    _classCallCheck(this, StaticTableOfContentsElement);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(StaticTableOfContentsElement).apply(this, arguments));
  }

  _createClass(StaticTableOfContentsElement, [{
    key: 'render',


    /**
     * render
     * @return {ReactElement} markup
     */


    /**
     * propTypes
     */
    value: function render() {
      return _react2.default.createElement(
        'section',
        {
          className: 'peritext-static-table-of-contents-element-container',
          style: { paddingLeft: (this.props.level - this.props.levelDisplacement - 1) * this.props.paddingDisplacement + 'cm' }
        },
        _react2.default.createElement(
          'a',
          {
            href: '#' + this.props.id
          },
          this.props.title
        )
      );
    }
  }]);

  return StaticTableOfContentsElement;
}(_react2.default.Component);

StaticTableOfContentsElement.propTypes = {
  title: _react.PropTypes.string,
  level: _react.PropTypes.number,
  id: _react.PropTypes.string,
  paddingDisplacement: _react.PropTypes.number,
  levelDisplacement: _react.PropTypes.number
};
StaticTableOfContentsElement.defaultProps = {
  level: 0,
  paddingDisplacement: 0.5,
  levelDisplacement: 0
};
module.exports = exports['default'];