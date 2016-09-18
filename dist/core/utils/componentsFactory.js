'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.jsToComponent = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /**
                                                                                                                                                                                                                                                                   * Utils - dedicated to consuming peritext contents' pseudo-dom representations by returning React markup
                                                                                                                                                                                                                                                                   * @module utils/modelUtils
                                                                                                                                                                                                                                                                   */


exports.default = renderContents;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Consumes a peritext content's pseudo-dom node (described as a js object) and returns a react component
 * @param {Object} node - the pseudo-dom node
 * @param {number} index - the index of the node (used for providing react keys)
 * @return {ReactElement} markup describing the node
 */
var jsToComponent = exports.jsToComponent = function jsToComponent(node, index) {
  if (node.node === 'text') {
    return node.text;
  }
  if (node.special) {
    // Component class stored as referenced object
    var Component = node.tag;
    return _react2.default.createElement(Component, _extends({ key: index }, node.props));
  }
  // plain string tag name
  var Tag = node.tag;
  return _react2.default.createElement(
    Tag,
    { key: index, id: node.attr && node.attr.id, href: node.attr && node.attr.href },
    node.children && node.children.map(jsToComponent)
  );
};

/**
 * Consumes a peritext content's pseudo-dom nodes list to produce react markup
 * @param {Object} contents - the pseudo-dom nodes array
 * @return {ReactElement|string} markup or string contents
 */
function renderContents(contents) {
  if (Array.isArray(contents)) {
    return contents.map(jsToComponent);
  } else if (typeof contents === 'string') {
    return contents;
  }
  return '';
}