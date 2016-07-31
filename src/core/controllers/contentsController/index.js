/**
 * Contents controller - a set of pure functions for parsing and serializing fsTree representations to peritextSections representations
 * @module controllers/contentsController
 */

import {waterfall, map as asyncMap} from 'async';
import {parseSection, serializeSectionList} from './../../converters/sectionConverter';
import {diff} from 'deep-diff';

let connector;
let connectorName;
let tempConnectorName;

/**
* Updates the active connector module according to connection params
* @param {Object} params - connection params
*/
const updateConnector = (params) => {
  tempConnectorName = params.connector;
  if (tempConnectorName !== connectorName) {
    connectorName = tempConnectorName;
    connector = require('./../../../connectors/' + params.connector);
  }
};

/**
* Resolves a difference object through Create/Update/Delete operations
* @param {Object} difference - the difference object specifying type of difference and details
* @param {Object} params - connection params
* @param {Object} connect - connector module
* @param {function(connectorError: error, connectorResult)} callback - provided by connector
*/
const applyDifference = (difference, params, connect, callback) => {
  let item;
  switch (difference.kind) {
  // new element
  case 'N':
    console.log('unhandled new element difference ', difference);
    break;
  // delete element
  case 'D':
    connect.deleteFromPath({path: difference.lhs.path, params}, callback);
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
      waterfall([
        // create root
        function(cb) {
          connect.createFromPath({path: item.path, params, type: item.type, overwrite: true, stringContents: (item.stringContents || '')}, cb);
        },
        // create children
        function(cb) {
          if (item.children) {
            asyncMap(item.children, function(child, cb2) {
              connect.createFromPath({path: child.path, params, type: child.type, overwrite: true, stringContents: (child.stringContents || '')}, cb2);
            }, cb);
          } else cb();
        }
      ], callback);
      break;

    case 'D':
      item = difference.item.lhs;
      connect.deleteFromPath({path: item.path, params}, callback);
      break;
    case 'E':
      item = difference.item.rhs;
      waterfall([
        // create root
        function(cb) {
          connect.updateFromPath({path: item.path, params, stringContents: (item.stringContents || '')}, cb);
        },
        // create children
        function(cb) {
          if (item.children) {
            asyncMap(item.children, function(child, cb2) {
              connect.updateFromPath({path: child.path, params, stringContents: (child.stringContents || '')}, cb2);
            }, cb);
          } else cb();
        }
      ], callback);
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
export const updateFromSource = (params, models, parameters, callback) => {
  updateConnector(params);
  waterfall([
    function(cb) {
      connector.readFromPath({params, path: [], depth: true, parseFiles: true}, function(err, results) {
        cb(err, results);
      });
    },
    function(tree, cb) {
      parseSection({tree, models, parameters}, cb);
    }
  ],
  function(err, results) {
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
export const updateToSource = (params, sections, models, oldFsTree, callback) => {
  updateConnector(params);
  serializeSectionList({sectionList: sections, models, basePath: params.basePath}, function(err, newFsTree) {
    const differences = diff(oldFsTree, newFsTree);
    asyncMap(differences, function(difference, cb) {
      applyDifference(difference, params, connector, cb);
    }, function(errors, res) {
      callback(errors, sections);
    });
  });
};
