'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _microDataUtils = require('./../../core/utils/microDataUtils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * dumb component and placeholder for rendering the structured representation of an entity long citation (in a glossary for example)
 */

var StaticEntityBlock = function (_React$Component) {
  _inherits(StaticEntityBlock, _React$Component);

  function StaticEntityBlock() {
    _classCallCheck(this, StaticEntityBlock);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(StaticEntityBlock).apply(this, arguments));
  }

  _createClass(StaticEntityBlock, [{
    key: 'renderMentions',


    /**
     * render a structured representation of the entities mentions, sorted by aliases
     * @return {ReactElement} markup
     */


    /**
     * propTypes
     * @property {object} entity - the entity resource to contextualize
     * @property {object} contextualizer - the contextualizer params to use for contextualization
     * @property {object} contextualization - the contextualization object
     * @property {object} settings - the set of settings to use for rendering
     */
    value: function renderMentions() {
      var self = this;
      return Object.keys(this.props.entity.aliases).map(function (alias, aliasIndex) {
        return _react2.default.createElement(
          'p',
          { key: alias, className: 'peritext-static-entity-block-page-mentions-container' },
          _react2.default.createElement(
            'span',
            null,
            alias === 'no-alias' ? '' : alias + ' : '
          ),
          self.props.entity.aliases[alias].map(function (entry, index) {
            return _react2.default.createElement(
              'span',
              { key: entry.mentionId },
              'p. ',
              _react2.default.createElement('a', { className: 'peritext-static-entity-block-page-pointer', href: entry.mentionId })
            );
          }).reduce(function (accu, elem) {
            return accu === null ? [elem] : [].concat(_toConsumableArray(accu), [', ', elem]);
          }, null)
        );
      });
    }

    /**
     * render component
     * @return {ReactElement} markup
     */

  }, {
    key: 'render',
    value: function render() {
      var itemType = (0, _microDataUtils.bibToSchema)(this.props.entity.bibType);
      return _react2.default.createElement(
        'section',
        {
          className: 'peritext-static-entity-block-container',
          name: 'peritext-static-entity-block-' + this.props.entity.id,
          id: 'peritext-static-entity-block-' + this.props.entity.id,
          itemProp: 'mentions',
          value: 'mentions',
          itemScope: true,
          itemType: 'http://schema.org/' + itemType,
          'typeof': itemType,
          resource: this.props.entity.id
        },
        _react2.default.createElement(
          'h5',
          {
            className: 'peritext-static-entity-block-name' },
          itemType === 'Person' ? [_react2.default.createElement(
            'span',
            {
              itemProp: 'familyName',
              property: 'familyName',
              key: 'familyName'
            },
            this.props.entity.lastname
          ), _react2.default.createElement(
            'span',
            { key: 'separator1' },
            ' ('
          ), _react2.default.createElement(
            'span',
            {
              itemProp: 'givenName',
              property: 'givenName',
              key: 'givenName'
            },
            this.props.entity.firstname
          ), _react2.default.createElement(
            'span',
            { key: 'separator2' },
            ')'
          )] : _react2.default.createElement(
            'span',
            {
              property: 'name',
              itemProp: 'name'
            },
            this.props.entity.name
          )
        ),
        this.props.entity.aliases ? this.renderMentions() : '',
        this.props.entity.description && this.props.contextualizer.showdescription === 'yes' ? _react2.default.createElement(
          'p',
          { className: 'peritext-static-entity-block-description' },
          this.props.entity.description
        ) : ''
      );
    }
  }]);

  return StaticEntityBlock;
}(_react2.default.Component);

StaticEntityBlock.propTypes = {
  entity: _react.PropTypes.object,
  contextualizer: _react.PropTypes.object,
  contextualization: _react.PropTypes.object,
  settings: _react.PropTypes.object
};
StaticEntityBlock.defaultProps = {
  contextualizer: {
    showdescription: 'yes'
  }
};
exports.default = StaticEntityBlock;
module.exports = exports['default'];