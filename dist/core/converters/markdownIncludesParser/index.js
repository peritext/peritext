'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseMarkdown = undefined;

var _converter = require('./converter.js');

var lib = _interopRequireWildcard(_converter);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var parseMarkdown = exports.parseMarkdown = lib.parseMarkdown;