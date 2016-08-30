'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactStringReplace = require('react-string-replace');

var _reactStringReplace2 = _interopRequireDefault(_reactStringReplace);

var _radium = require('radium');

var _radium2 = _interopRequireDefault(_radium);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * dumb component for rendering the structured representation of a person
 */

var StructuredPerson = (0, _radium2.default)(_class = function (_React$Component) {
  _inherits(StructuredPerson, _React$Component);

  function StructuredPerson() {
    _classCallCheck(this, StructuredPerson);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(StructuredPerson).apply(this, arguments));
  }

  _createClass(StructuredPerson, [{
    key: 'transformValues',


    /**
     * transformValues modifies firstName and lastName according to pattern indications
     * @param {Object} author - the person representation to transform
     * @param {string} pattern - the pattern to use for transforming person representation
     * @return {Object} newAuthor - new author object
     */


    /**
     * propTypes
     * @property {object} resource - the person object which may contain the following props : "lastName", "firstName", "role", and "information"
     * @property {string} pattern - the pattern to apply for formatting the person name to html, eg : " ${lastName:capitals}, ${firstName:initials}"
     * @property {string} property - the microformat property to apply to the structured element
     */
    value: function transformValues(author, pattern) {
      var vals = Object.assign({}, author);
      // catch format transformers
      var transformFirstNameMatch = pattern.match(/(\${firstName(:[^}]*)?})/);
      var transformLastNameMatch = pattern.match(/(\${lastName(:[^}]*)?})/);
      // if transformers - transform
      if (transformFirstNameMatch) {
        if (transformFirstNameMatch[2] === ':initials') {
          // processing composed names (e.g. Gian-Marco Patalucci)
          var initials = vals.firstName.split('-').map(function (term) {
            if (term.length > 0) {
              return term.toUpperCase().substr(0, 1) + '.';
            }
            return term;
          }).join('-');
          // processing multiple names (e.g. Donald Ronald Romuald Ronaldo Reagan)
          initials = vals.firstName.split(' ').map(function (term) {
            if (term.length > 0) {
              return term.toUpperCase().substr(0, 1) + '.';
            }
            return term;
          }).join(' ');
          vals.firstName = initials;
        }
      }
      if (transformLastNameMatch) {
        if (transformLastNameMatch[2] === ':capitals') {
          vals.lastName = vals.lastName.toUpperCase();
        }
      }
      return vals;
    }

    /**
     * updateHtml : transform pattern+person props into a react element
     * @return {ReactElement} markup
     */

  }, {
    key: 'updateHtml',
    value: function updateHtml() {
      var vals = this.transformValues(this.props.resource, this.props.pattern);

      var firstNameExp = this.props.pattern.match(/(\${firstName(:[^}]*)?})/);
      var lastNameExp = this.props.pattern.match(/(\${lastName(:[^}]*)?})/);
      var replacedText = this.props.pattern;
      if (firstNameExp) {
        replacedText = (0, _reactStringReplace2.default)(replacedText, new RegExp('(\\' + firstNameExp[0] + ')', 'g'), function (match, index) {
          return _react2.default.createElement(
            'span',
            { key: match + index, className: 'peritext-structured-person-firstname', itemProp: 'givenName', property: 'givenName' },
            vals.firstName
          );
        });
      }

      if (lastNameExp) {
        replacedText = (0, _reactStringReplace2.default)(replacedText, new RegExp('(\\' + lastNameExp[0] + ')', 'g'), function (match, index) {
          return _react2.default.createElement(
            'span',
            { key: match + index, className: 'peritext-structured-person-lastname', itemProp: 'familyName', property: 'familyName' },
            vals.lastName
          );
        });
      }

      replacedText = (0, _reactStringReplace2.default)(replacedText, /(\${role})/g, function (match, index) {
        return _react2.default.createElement(
          'span',
          { key: match + index, className: 'peritext-structured-person-role' },
          vals.role
        );
      });

      if (vals.information) {
        replacedText = (0, _reactStringReplace2.default)(replacedText, /(\${information})/g, function (match, index) {
          return _react2.default.createElement(
            'span',
            { key: match + index, className: 'peritext-structured-person-information' },
            vals.information
          );
        });
      }

      return replacedText;
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
          className: 'peritext-structured-person-container',
          itemProp: this.props.property,
          itemScope: true,
          itemType: 'http://schema.org/Person',
          property: this.props.property,
          'typeof': 'Person',
          resource: this.props.resource.citeKey
        },
        this.updateHtml()
      );
    }
  }]);

  return StructuredPerson;
}(_react2.default.Component)) || _class;

StructuredPerson.propTypes = {
  resource: _react.PropTypes.object,
  pattern: _react.PropTypes.string,
  property: _react.PropTypes.string
};
StructuredPerson.defaultProps = {
  pattern: '${firstName} ${lastName}',
  property: 'author'
};
exports.default = StructuredPerson;
module.exports = exports['default'];