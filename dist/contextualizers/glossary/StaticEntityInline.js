'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _microDataUtils = require('./../../core/utils/microDataUtils');

var _componentsFactory = require('./../../core/utils/componentsFactory');

var _componentsFactory2 = _interopRequireDefault(_componentsFactory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * dumb component and placeholder for rendering the structured representation of an entity citation
 */

var StaticEntityInline = function (_React$Component) {
  _inherits(StaticEntityInline, _React$Component);

  function StaticEntityInline() {
    _classCallCheck(this, StaticEntityInline);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(StaticEntityInline).apply(this, arguments));
  }

  _createClass(StaticEntityInline, [{
    key: 'render',


    /**
     * render
     * @return {ReactElement} markup
     */


    /**
     * propTypes
     * @property {object} entity - the entity resource to contextualize
     * @property {string} sectionId - the host section id (used for identifying the element)
     * @property {object} contextualization - the contextualization object
     * @property {array} contents - the pseudo-dom js representation of contextualization's pointer contents
     */
    value: function render() {
      var itemType = (0, _microDataUtils.bibToSchema)(this.props.entity.bibType);
      return _react2.default.createElement(
        'a',
        {
          className: 'peritext-static-entity-container-inline',
          name: 'peritext-content-entity-inline-' + this.props.sectionId + '-' + this.props.contextualization.id,
          id: 'peritext-static-entity-inline-' + this.props.sectionId + '-' + this.props.contextualization.id,
          href: '#peritext-static-entity-block-' + this.props.entity.id,
          itemProp: 'mentions',
          value: 'mentions',
          itemScope: true,
          itemType: 'http://schema.org/' + itemType,
          'typeof': itemType,
          resource: this.props.entity.id
        },
        itemType === 'Person' ? [_react2.default.createElement(
          'span',
          {
            style: { display: 'none' },
            itemProp: 'givenName',
            property: 'givenName',
            key: 'givenName'
          },
          this.props.entity.firstname
        ), _react2.default.createElement(
          'span',
          {
            style: { display: 'none' },
            itemProp: 'familyName',
            property: 'familyName',
            key: 'familyName'
          },
          this.props.entity.lastname
        )] : _react2.default.createElement(
          'span',
          {
            style: { display: 'none' },
            property: 'name',
            itemProp: 'name'
          },
          this.props.entity.name
        ),
        _react2.default.createElement(
          'span',
          null,
          (0, _componentsFactory2.default)(this.props.contents)
        )
      );
    }
  }]);

  return StaticEntityInline;
}(_react2.default.Component);

StaticEntityInline.propTypes = {
  entity: _react.PropTypes.object,
  sectionId: _react.PropTypes.string,
  contextualization: _react.PropTypes.object,
  contents: _react.PropTypes.array
};
StaticEntityInline.defaultProps = {};
exports.default = StaticEntityInline;
module.exports = exports['default'];