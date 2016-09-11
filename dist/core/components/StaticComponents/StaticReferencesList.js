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

// let styles = {};

var translate = (0, _reactIntl.defineMessages)({
  referencestitle: {
    id: 'references_title',
    description: 'Title of references/bibliography section',
    defaultMessage: 'References'
  }
});

/**
 * dumb component for rendering a static table of figures
 */

var StaticReferencesList = function (_React$Component) {
  _inherits(StaticReferencesList, _React$Component);

  function StaticReferencesList() {
    _classCallCheck(this, StaticReferencesList);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(StaticReferencesList).apply(this, arguments));
  }

  _createClass(StaticReferencesList, [{
    key: 'render',


    /**
     * render
     * @return {ReactElement} markup
     */


    /**
     * propTypes
     */
    value: function render() {
      var citationRenderer = require('./../../../referencers/' + this.props.settings.citationStyle + '.js');
      var BlockCitation = citationRenderer.BlockCitation;
      var formatMessage = this.context.intl.formatMessage;

      return _react2.default.createElement(
        'section',
        {
          className: 'peritext-static-references-list-container',
          id: this.props.id
        },
        _react2.default.createElement(
          'h2',
          null,
          formatMessage(translate.referencestitle, {})
        ),
        _react2.default.createElement(
          'section',
          { className: 'peritext-static-references-list-items-container' },
          this.props.references.map(function (reference) {
            return _react2.default.createElement(BlockCitation, { key: reference.citeKey, resource: reference, contextualization: {} });
          })
        )
      );
    }
  }]);

  return StaticReferencesList;
}(_react2.default.Component);

StaticReferencesList.propTypes = {
  references: _react.PropTypes.array,
  settings: _react.PropTypes.object,
  id: _react.PropTypes.string
};
StaticReferencesList.defaultProps = {
  references: []
};


StaticReferencesList.contextTypes = { intl: _reactIntl.intlShape };

exports.default = StaticReferencesList;
module.exports = exports['default'];