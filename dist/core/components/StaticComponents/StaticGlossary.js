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

var _StaticEntityBlock = require('./../../../contextualizers/glossary/StaticEntityBlock.js');

var _StaticEntityBlock2 = _interopRequireDefault(_StaticEntityBlock);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// let styles = {};

var translate = (0, _reactIntl.defineMessages)({
  glossary: {
    id: 'glossary',
    description: 'Title of glossary section',
    defaultMessage: 'Glossary'
  }
});

/**
 * dumb component for rendering a static table of contents
 */

var StaticGlossary = (0, _radium2.default)(_class = function (_React$Component) {
  _inherits(StaticGlossary, _React$Component);

  function StaticGlossary() {
    _classCallCheck(this, StaticGlossary);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(StaticGlossary).apply(this, arguments));
  }

  _createClass(StaticGlossary, [{
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
          className: 'peritext-static-glossary-container'
        },
        _react2.default.createElement(
          'h2',
          null,
          formatMessage(translate.glossary, {})
        ),
        _react2.default.createElement(
          'section',
          {
            className: 'peritext-static-glossary-elements-container'
          },
          this.props.elements.map(function (entity, index) {
            return _react2.default.createElement(_StaticEntityBlock2.default, { key: index, entity: entity });
          })
        )
      );
    }
  }]);

  return StaticGlossary;
}(_react2.default.Component)) || _class;

StaticGlossary.propTypes = {
  elements: _react.PropTypes.array,
  id: _react.PropTypes.string
};
StaticGlossary.defaultProps = {
  elements: []
};

StaticGlossary.contextTypes = { intl: _reactIntl.intlShape };

exports.default = StaticGlossary;
module.exports = exports['default'];