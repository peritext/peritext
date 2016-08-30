'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.exportSectionToPdf = exports.defaultParameters = exports.defaultModels = exports.contentsController = exports.assetsController = undefined;

var _pdfExporter = require('./exporters/pdfExporter');

Object.defineProperty(exports, 'exportSectionToPdf', {
  enumerable: true,
  get: function get() {
    return _pdfExporter.exportSectionToPdf;
  }
});

var _assetsController = require('./core/controllers/assetsController');

var assetsC = _interopRequireWildcard(_assetsController);

var _contentsController = require('./core/controllers/contentsController');

var contentsC = _interopRequireWildcard(_contentsController);

var _models = require('./core/models');

var models = _interopRequireWildcard(_models);

var _defaultParameters = require('./config/defaultParameters');

var parameters = _interopRequireWildcard(_defaultParameters);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * Exposes assets communication methods
 * @property {Object} assetsController
 */
/**
 * Peritext library entrypoint
 * @module peritext
 */

var assetsController = exports.assetsController = assetsC;
/**
 * Exposes contents communication methods
 * @property {Object} contentsController
 */
var contentsController = exports.contentsController = contentsC;
/**
 * Exposes peritext default models for metadata, resources, contextualizers, and rendering settings
 * @property {Object} defaultModels
 */
var defaultModels = exports.defaultModels = models;
/**
 * Exposes default language parameters for includes and templates
 * @property {Object} defaultParameters
 */
var defaultParameters = exports.defaultParameters = parameters;

/**
 * Exposes section export to pdf with print renderer function
 * @property {function} exportSectionToPdf
 */