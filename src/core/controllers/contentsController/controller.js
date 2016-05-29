import {waterfall, map as asyncMap} from 'async';
import {parseSection, serializeSectionList} from './../../converters/sectionConverter';
import {diff} from 'deep-diff';

let connector;
let connectorName;
let tempConnectorName;

function updateConnector(params) {
  tempConnectorName = params.connector;
  if (tempConnectorName !== connectorName) {
    connectorName = tempConnectorName;
    connector = require('./../../connectors/' + params.connector);
  }
}

/*
 * I echo an expected/actual fstree difference with Create/Update/Delete operations
 * on the content source through the appropriate connector middleware
 */
function applyDifference(difference, params, connect, callback) {
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
}

/*
 * I parse source through connector and returns a moduloSectionArray javascript representation
 */
export function updateFromSource(params, models, parameters, callback) {
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
}

/*
 * I update a data source from a moduloSectionArray, by "diffing" new fsTree with previous fsTree
 * I compare new moduloSectionArray javascript state to old fsTree tree
 * then make a diff list with deep-diff
 * then monitor source tree updating (with C.U.D. operations) accordingly
 */
export function updateToSource(params, sections, models, oldFsTree, callback) {
  updateConnector(params);
  serializeSectionList({sectionList: sections, models, basePath: params.basePath}, function(err, newFsTree) {
    const differences = diff(oldFsTree, newFsTree);
    asyncMap(differences, function(difference, cb) {
      applyDifference(difference, params, connector, cb);
    }, function(errors, res) {
      callback(errors, sections);
    });
  });
}
