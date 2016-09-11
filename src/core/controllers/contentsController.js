/**
 * Contents controller - a set of pure functions for parsing and serializing fsTree representations to peritextSections representations
 * @module controllers/contentsController
 */

import {
  waterfall,
  mapSeries,
  ensureAsync
} from 'async';
import {
  parseSection,
  serializeDocument
} from '../converters/sectionConverter';
import { diff } from 'deep-diff';
import * as filesystem from '../../connectors/filesystem';
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
    if ( connectorName === 'filesystem' ) {
      connector = filesystem;
    }
    // this method is better but does not work when integrating the lib with webpack-based app (to investigate)
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
const applyDifference = (difference, params, connect, callback) => {
  let item;
  switch (difference.kind) {
  // new element
  case 'N':
    item = difference.rhs;
    return connect.createFromPath({
      path: item.path,
      params,
      type: item.type,
      overwrite: true,
      stringContents: (item.stringContents || '')
    }, callback);
  // delete element
  case 'D':
    return connect.deleteFromPath({
      path: difference.lhs.path,
      params
    }, callback);
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
      return waterfall([
        (containerCb) => {
          connect.createFromPath({
            path: item.path,
            params,
            type: item.type,
            overwrite: true,
            stringContents: (item.stringContents || '')
          }, containerCb);
        },
        (childrenCb)=> {
          if (item.children) {
            return mapSeries(item.children, ensureAsync((child, childCb)=>{
              return connect.createFromPath({
                path: child.path,
                params,
                type: child.type,
                overwrite: true,
                stringContents: (child.stringContents || '')
              }, childCb);
            }), childrenCb);
          }
          // default callback
          return childrenCb(null);
        }
      ], callback);

    case 'D':
      item = difference.item.lhs;
      return connect.deleteFromPath({
        path: item.path,
        params
      }, callback);

    case 'E':
      item = difference.item.rhs;
      return waterfall([
        // create root
        (cb)=> {
          connect.updateFromPath({
            path: item.path,
            params,
            stringContents: (item.stringContents || '')
          }, cb);
        },
        // update children
        (cb)=> {
          if (item.children) {
            mapSeries(item.children, ensureAsync((child, cb2)=> {
              connect.updateFromPath({path: child.path, params, stringContents: (child.stringContents || '')}, cb2);
            }), cb);
          } else cb();
        }
      ], callback);

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
    (cb)=> {
      connector.readFromPath({
        params, path: [],
        depth: true,
        parseFiles: true
      }, (err, results)=> {
        cb(err, results);
      });
    },
    (tree, cb)=> {
      parseSection({tree, models, parameters}, cb);
    }
  ],
  (err, results)=> {
    callback(err, results);
  });
};

/**
* Serializes the representation of a series of peritext sections to an fsTree representation by "diffing" new fsTree with previous fsTree
* then makes a diff list with deep-diff
* then monitor source tree updating (with C.U.D. operations) accordingly
* @param {Object} params - connection params
* @param {array} document - the peritext document to serialize
* @param {Object} models - peritext models to use
* @param {Object} oldFsTree - the previous fsTree representation to compare with the new
* @param {function(serializingErrors: error, sections:array)} callback - errors and input sections
*/
export const updateToSource = (params, document, models, oldFsTree, callback) => {
  updateConnector(params);
  const newFsTree = serializeDocument({
    document,
    models,
    basePath: params.basePath
  });
  const differences = diff(oldFsTree, newFsTree);
  mapSeries(differences, ensureAsync((difference, cb)=> {
    applyDifference(difference, params, connector, cb);
  }), (errors)=> {
    callback(errors, newFsTree);
  });
};
