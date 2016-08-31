'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateToSource = exports.updateFromSource = undefined;

var _async = require('async');

var _sectionConverter = require('./../../converters/sectionConverter');

var _deepDiff = require('deep-diff');

var _filesystem = require('./../../../connectors/filesystem');

var filesystem = _interopRequireWildcard(_filesystem);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * Contents controller - a set of pure functions for parsing and serializing fsTree representations to peritextSections representations
 * @module controllers/contentsController
 */

var connector = void 0;
var connectorName = void 0;
var tempConnectorName = void 0;

/**
* Updates the active connector module according to connection params
* @param {Object} params - connection params
*/
var updateConnector = function updateConnector(params) {
  tempConnectorName = params.connector;
  if (tempConnectorName !== connectorName) {
    connectorName = tempConnectorName;
    if (connectorName === 'filesystem') {
      connector = filesystem;
    }
    // this method is better but does not work when integrating the lib with webpack
    // connector = require('./../../../connectors/' + params.connector);
  }
};

/**
* Resolves a difference object through Create/Update/Delete operations
* @param {Object} difference - the difference object specifying type of difference and details
* @param {Object} params - connection params
* @param {Object} connect - connector module
* @param {function(connectorError: error, connectorResult)} callback - provided by connector
*/
var applyDifference = function applyDifference(difference, params, connect, callback) {
  var item = void 0;
  switch (difference.kind) {
    // new element
    case 'N':
      console.log('unhandled new element difference ', difference);
      break;
    // delete element
    case 'D':
      connect.deleteFromPath({ path: difference.lhs.path, params: params }, callback);
      break;
    // edit element
    case 'E':
      if (difference.path.pop() === 'path') {
        return callback();
      }
      console.log('unhandled edit difference ', difference);
      break;
    // change in array
    case 'A':
      switch (difference.item.kind) {
        case 'N':
          item = difference.item.rhs;
          (0, _async.waterfall)([
          // create root
          function (cb) {
            connect.createFromPath({ path: item.path, params: params, type: item.type, overwrite: true, stringContents: item.stringContents || '' }, cb);
          },
          // create children
          function (cb) {
            if (item.children) {
              (0, _async.map)(item.children, function (child, cb2) {
                connect.createFromPath({ path: child.path, params: params, type: child.type, overwrite: true, stringContents: child.stringContents || '' }, cb2);
              }, cb);
            } else cb();
          }], callback);
          break;

        case 'D':
          item = difference.item.lhs;
          connect.deleteFromPath({ path: item.path, params: params }, callback);
          break;
        case 'E':
          item = difference.item.rhs;
          (0, _async.waterfall)([
          // create root
          function (cb) {
            connect.updateFromPath({ path: item.path, params: params, stringContents: item.stringContents || '' }, cb);
          },
          // create children
          function (cb) {
            if (item.children) {
              (0, _async.map)(item.children, function (child, cb2) {
                connect.updateFromPath({ path: child.path, params: params, stringContents: child.stringContents || '' }, cb2);
              }, cb);
            } else cb();
          }], callback);
          break;
        default:
          console.log('unhandled difference ', difference);
          break;
      }
      break;
    default:
      console.log('unhandled difference ', difference);
      break;
  }
  callback();
};

/**
  * @param {Object} params - connection params
  * @param {Object} models - peritext models to use
  * @param {Object} parametesr - language templates parameters - with which expressions are templates or includes wrapped ?
  * @param {function(parsingErrors: error, results:Object)} callback - block errors and a result object containing section and an array of warnings+parsing errors
  */
var updateFromSource = exports.updateFromSource = function updateFromSource(params, models, parameters, callback) {
  updateConnector(params);
  (0, _async.waterfall)([function (cb) {
    connector.readFromPath({ params: params, path: [], depth: true, parseFiles: true }, function (err, results) {
      cb(err, results);
    });
  }, function (tree, cb) {
    (0, _sectionConverter.parseSection)({ tree: tree, models: models, parameters: parameters }, cb);
  }], function (err, results) {
    callback(err, results);
  });
};

/**
* Serializes the representation of a series of peritext sections to an fsTree representation by "diffing" new fsTree with previous fsTree
* then makes a diff list with deep-diff
* then monitor source tree updating (with C.U.D. operations) accordingly
* @param {Object} params - connection params
* @param {array} sections - the peritext sections to serialize
* @param {Object} models - peritext models to use
* @param {Object} oldFsTree - the previous fsTree representation to compare with the new
* @param {function(serializingErrors: error, sections:array)} callback - errors and input sections
*/
var updateToSource = exports.updateToSource = function updateToSource(params, sections, models, oldFsTree, callback) {
  updateConnector(params);
  (0, _sectionConverter.serializeSectionList)({ sectionList: sections, models: models, basePath: params.basePath }, function (err, newFsTree) {
    var differences = (0, _deepDiff.diff)(oldFsTree, newFsTree);
    (0, _async.map)(differences, function (difference, cb) {
      applyDifference(difference, params, connector, cb);
    }, function (errors, res) {
      callback(errors, sections);
    });
  });
};