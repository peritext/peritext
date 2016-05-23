import {waterfall} from 'async';
import {parseSection} from './../../converters/sectionConverter';

/*
 * parses source through connector and returns a moduloSectionArray javascript representation
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
    console.log(results);
    callback(err, results);
  });
}

/*
 * compares new moduloSectionArray javascript state to old fsTree tree
 * then makes a diff list
 * then updates source tree (with C.U.D. operations) accordingly
 */
export function updateToSource(connector, dataPath, moduloSectionArray, previousFsTree, callback) {

}
