'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.table = exports.glossary = exports.webpage = exports.imagegallery = exports.timeline = exports.citation = undefined;

var _citation = require('./citation');

var citationLib = _interopRequireWildcard(_citation);

var _timeline = require('./timeline');

var timelineLib = _interopRequireWildcard(_timeline);

var _imagegallery = require('./imagegallery');

var imagegalleryLib = _interopRequireWildcard(_imagegallery);

var _webpage = require('./webpage');

var webpageLib = _interopRequireWildcard(_webpage);

var _glossary = require('./glossary');

var glossaryLib = _interopRequireWildcard(_glossary);

var _table = require('./table');

var tableLib = _interopRequireWildcard(_table);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * Citation contextualizer that resolve sections data according to contextualization+settings params
 */
/**
 * Contextualizers - pure functions that resolve sections against contextualizations+settings objects
 * @module contextualizers
 */
var citation = exports.citation = citationLib;
/**
 * Timeline contextualizer that resolve sections data according to contextualization+settings params
 */
var timeline = exports.timeline = timelineLib;
/**
 * Image gallery contextualizer that resolve sections data according to contextualization+settings params
 */
var imagegallery = exports.imagegallery = imagegalleryLib;
/**
 * Webpage contextualizer that resolve sections data according to contextualization+settings params
 */
var webpage = exports.webpage = webpageLib;
/**
 * Glossary contextualizer that resolve sections data according to contextualization+settings params
 */
var glossary = exports.glossary = glossaryLib;
/**
 * Table contextualizer that resolve sections data according to contextualization+settings params
 */
var table = exports.table = tableLib;