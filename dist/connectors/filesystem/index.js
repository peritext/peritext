'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAssetUri = exports.updateFromPath = exports.deleteFromPath = exports.createFromPath = exports.readFromPath = undefined;

var _connector = require('./connector.js');

var lib = _interopRequireWildcard(_connector);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var readFromPath = exports.readFromPath = lib.readFromPath;
var createFromPath = exports.createFromPath = lib.createFromPath;
var deleteFromPath = exports.deleteFromPath = lib.deleteFromPath;
var updateFromPath = exports.updateFromPath = lib.updateFromPath;

var getAssetUri = exports.getAssetUri = lib.getAssetUri;