/**
 * This module parses resources expressions in .bib files representations
 * @module converter/sectionConverter/parseTreeResources
 */
import {parseBibTexStr} from '../bibTexConverter';

/**
 * Converts dumbTree resources representations (as string) to js objects - recursively do the same for tree's children
 * @param {Object} dumbTree - a semi-parsed representation inbetween an fsTree and a more structured representation
 * @return {errors: Array, naiveTree: Object}  - the output representation
 */
export const parseTreeResources = (dumbTree) => {
  const naiveTree = Object.assign({}, dumbTree);
  const errors = [];
  if (naiveTree.resourcesStr) {
    parseBibTexStr(naiveTree.resourcesStr, function(err, resources) {
      naiveTree.resources = resources;
    });
  }
  if (naiveTree.children) {
    naiveTree.children = naiveTree.children.map(child => {
      return parseTreeResources(child).naiveTree;
    });
  }
  return {
    naiveTree,
    errors
  };
};
