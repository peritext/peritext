/**
 * This module parses resources expressions in .bib files representations
 * @module converter/sectionConverter/parseTreeResources
 */
import {parseBibTexStr} from './../../converters/bibTexConverter/';
import {map as asyncMap} from 'async';

/**
 * Converts dumbTree resources representations (as string) to js objects - recursively do the same for tree's children
 * @param {Object} dumbTree - a semi-parsed representation inbetween an fsTree and a more structured representation
 * @param {function(error: error, dumbTree: Object)} callback - the output representation
 */
export const parseTreeResources = (dumbTree, callback) => {
  if (dumbTree.resourcesStr) {
    parseBibTexStr(dumbTree.resourcesStr, function(err, resources) {
      if (dumbTree.children) {
        asyncMap(dumbTree.children, parseTreeResources, function(error, children) {
          callback(error, Object.assign({}, dumbTree, {resources}, {children}));
        });
      }
    });
  }else callback(null, Object.assign({}, dumbTree));
};
