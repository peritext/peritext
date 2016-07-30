'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.InlineCitationModel = exports.BlockCitationModel = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _components = require('./../../components');

var _microDataUtils = require('./../microDataUtils/');

var formatter = _interopRequireWildcard(_microDataUtils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Virtual component class for rendering generic block citations
 */

var BlockCitationModel = exports.BlockCitationModel = function (_React$Component) {
  _inherits(BlockCitationModel, _React$Component);

  function BlockCitationModel() {
    _classCallCheck(this, BlockCitationModel);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(BlockCitationModel).apply(this, arguments));
  }

  _createClass(BlockCitationModel, [{
    key: 'getSchemaType',
    value: function getSchemaType() {
      return this.props.schemaType || formatter.bibToSchema(this.props.resource.bibType);
    }

    /**
     * render
     * @return {ReactElement} markup
     */

  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'p',
        {
          id: this.props.contextualization.citeKey,
          className: 'peritext-block-citation',
          itemProp: 'citation',
          property: 'citation',
          itemScope: true,
          itemType: 'http://schema.org/' + this.getSchemaType(),
          'typeof': this.getSchemaType()
        },
        _react2.default.createElement(_components.StructuredCOinS, { resource: this.props.resource }),
        this.renderReference(),
        this.renderAdditionnal(this.props)
      );
    }
  }], [{
    key: 'defaultProps',
    value: function defaultProps() {}
    /**
     * propTypes
     * @property {object} resource the resource to use for making the citation
     * @property {object} contextualization the details of contextualization (e.g. page)
     * @property {boolean} ibid immediately recurrent citation ?
     * @property {boolean} opCit not immediately recurent citation ?
     * @property {string} schemaType microformat type fo the item
     */

  }]);

  return BlockCitationModel;
}(_react2.default.Component);

/**
 * Virtual component class for rendering generic inline citations
 */


BlockCitationModel.propTypes = {
  resource: _react.PropTypes.object,
  contextualization: _react.PropTypes.object,
  ibid: _react.PropTypes.bool,
  opCit: _react.PropTypes.bool,
  schemaType: _react.PropTypes.string
};

var InlineCitationModel = exports.InlineCitationModel = function (_React$Component2) {
  _inherits(InlineCitationModel, _React$Component2);

  function InlineCitationModel() {
    _classCallCheck(this, InlineCitationModel);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(InlineCitationModel).apply(this, arguments));
  }

  _createClass(InlineCitationModel, [{
    key: 'getSchemaType',
    value: function getSchemaType() {
      return this.props.schemaType || formatter.bibToSchema(this.props.resource.bibType);
    }

    /**
     * render
     * @return {ReactElement} markup
     */

  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'span',
        {
          id: this.props.contextualization.citeKey,
          className: 'peritext-inline-citation',
          itemProp: 'citation',
          property: 'citation',
          itemScope: true,
          itemType: 'http://schema.org/' + this.getSchemaType(),
          'typeof': this.getSchemaType()
        },
        this.renderReference(),
        this.renderAdditionnal(this.props)
      );
    }
  }], [{
    key: 'defaultProps',
    value: function defaultProps() {}
    /**
     * propTypes
     * @property {object} resource the resource to use for making the citation
     * @property {object} contextualization the details of contextualization (e.g. page)
     * @property {boolean} ibid immediately recurent citation ?
     * @property {boolean} opCit not immediately recurent citation ?
     * @property {string} schemaType microformat type fo the item
     */

  }]);

  return InlineCitationModel;
}(_react2.default.Component);

InlineCitationModel.propTypes = {
  resource: _react.PropTypes.object,
  contextualization: _react.PropTypes.object,
  ibid: _react.PropTypes.bool,
  opCit: _react.PropTypes.bool,
  schemaType: _react.PropTypes.string
};