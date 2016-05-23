import {waterfall, map as asyncMap} from 'async';
import {parseSection, serializeSectionList} from './../../converters/sectionConverter';
import {diff} from 'deep-diff';
/*
 * I parse source through connector and returns a moduloSectionArray javascript representation
 */
export function updateFromSource(connector, dataPath, models, parameters, callback) {
  waterfall([
    function(cb) {
      connector.readFromPath({path: dataPath, depth: true, parseFiles: true}, function(err, results) {
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

function applyDifference(difference, connector, callback) {
  let item;
  switch (difference.kind) {
  // new element
  case 'N':
    console.log('unhandled new element difference ', difference);
    break;
  // delete element
  case 'D':
    connector.deleteFromPath({path: difference.lhs.path}, callback);
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
          connector.createFromPath({path: item.path, type: item.type, overwrite: true, stringContents: (item.stringContents || '')}, cb);
        },
        // create children
        function(cb) {
          if (item.children) {
            asyncMap(item.children, function(child, cb2) {
              connector.createFromPath({path: child.path, type: child.type, overwrite: true, stringContents: (child.stringContents || '')}, cb2);
            }, cb);
          } else cb();
        }
      ], callback);
      break;

    case 'D':
      item = difference.item.lhs;
      connector.deleteFromPath({path: item.path}, callback);
      break;
    case 'E':
      item = difference.item.rhs;
      waterfall([
        // create root
        function(cb) {
          connector.updateFromPath({path: item.path, stringContents: (item.stringContents || '')}, cb);
        },
        // create children
        function(cb) {
          if (item.children) {
            asyncMap(item.children, function(child, cb2) {
              connector.updateFromPath({path: child.path, stringContents: (child.stringContents || '')}, cb2);
            }, cb);
          } else cb();
        }
      ], callback);
      break;
    default:
      console.log('unhandled difference ', difference);
      // callback();
      break;
    }
    break;
  default:
    console.log('unhandled difference ', difference);
    // callback();
    break;
  }
  callback();
}

/*
 * I update a data source from a moduloSectionArray, by diffing new fsTree with previous fsTree
 * compares new moduloSectionArray javascript state to old fsTree tree
 * then makes a diff list with deep-diff
 * then updates source tree (with C.U.D. operations) accordingly
 */
export function updateToSource(connector, outputPath, sections, models, oldFsTree, callback) {
  serializeSectionList({sectionList: sections, models, basePath: outputPath}, function(err, newFsTree) {
    const differences = diff(oldFsTree, newFsTree);
    asyncMap(differences, function(difference, cb) {
      applyDifference(difference, connector, cb);
    }, function(errors, res) {
      callback(errors, sections);
    });
  });
}
