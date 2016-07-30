'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseBibNestedValues = exports.parseBibContextualization = exports.parseBibAuthors = exports.parseBibTexStr = exports.serializeBibTexObject = undefined;

var _converter = require('./converter.js');

var lib = _interopRequireWildcard(_converter);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var serializeBibTexObject = exports.serializeBibTexObject = lib.serializeBibTexObject;
var parseBibTexStr = exports.parseBibTexStr = lib.parseBibTexStr;
var parseBibAuthors = exports.parseBibAuthors = lib.parseBibAuthors;
var parseBibContextualization = exports.parseBibContextualization = lib.parseBibContextualization;
var parseBibNestedValues = exports.parseBibNestedValues = lib.parseBibNestedValues;