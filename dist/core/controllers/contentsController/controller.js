'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateToSource = exports.updateFromSource = undefined;

var _async = require('async');

var _sectionConverter = require('./../../converters/sectionConverter');

var _deepDiff = require('deep-diff');

var connector = void 0;
var connectorName = void 0;
var tempConnectorName = void 0;

var updateConnector = function updateConnector(params) {
  tempConnectorName = params.connector;
  if (tempConnectorName !== connectorName) {
    connectorName = tempConnectorName;
    connector = require('./../../../connectors/' + params.connector);
  }
};

/**
 * I echo an expected/actual fstree difference with Create/Update/Delete operations
 * on the content source through the appropriate connector middleware
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
 * I parse source through connector and returns a peritextSectionArray javascript representation
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
 * I update a data source from a peritextSectionArray, by "diffing" new fsTree with previous fsTree
 * I compare new peritextSectionArray javascript state to old fsTree tree
 * then make a diff list with deep-diff
 * then monitor source tree updating (with C.U.D. operations) accordingly
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