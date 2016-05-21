import {parseBibTexStr} from './../../converters/bibTexConverter/';
import {map as asyncMap} from 'async';

export function parseTreeResources(dumbTree, callback) {
  if (dumbTree.resourcesStr) {
    parseBibTexStr(dumbTree.resourcesStr, function(err, resources) {
      if (dumbTree.children) {
        asyncMap(dumbTree.children, parseTreeResources, function(error, children) {
          callback(error, Object.assign({}, dumbTree, {resources}, {children}));
        });
      }
    });
  }else callback(null, Object.assign({}, dumbTree));
}
