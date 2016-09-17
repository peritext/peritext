'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDocumentMetadata = exports.getGlossary = exports.getContextualizerContextualizations = exports.getResourceContextualizations = exports.getTableOfFigures = exports.getTableOfSections = exports.getForewords = exports.getSection = exports.packSection = exports.renderContents = exports.exportSectionToPdf = exports.defaultParameters = exports.defaultModels = exports.contentsController = exports.assetsController = undefined;

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

var _componentsFactory = require('./core/utils/componentsFactory');

var _componentsFactory2 = _interopRequireDefault(_componentsFactory);

var _getters = require('./core/getters');

var getters = _interopRequireWildcard(_getters);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
var renderContents = exports.renderContents = _componentsFactory2.default;

var packSection = exports.packSection = getters.packSection;
var getSection = exports.getSection = getters.getSection;
var getForewords = exports.getForewords = getters.getForewords;
var getTableOfSections = exports.getTableOfSections = getters.getTableOfSections;
var getTableOfFigures = exports.getTableOfFigures = getters.getTableOfFigures;
var getResourceContextualizations = exports.getResourceContextualizations = getters.getResourceContextualizations;
var getContextualizerContextualizations = exports.getContextualizerContextualizations = getters.getContextualizerContextualizations;
var getGlossary = exports.getGlossary = getters.getGlossary;
var getDocumentMetadata = exports.getDocumentMetadata = getters.getDocumentMetadata;