'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseTreeResources = undefined;

var _bibTexConverter = require('../bibTexConverter');

/**
 * Converts dumbTree resources representations (as string) to js objects - recursively do the same for tree's children
 * @param {Object} dumbTree - a semi-parsed representation inbetween an fsTree and a more structured representation
 * @return {errors: Array, naiveTree: Object}  - the output representation
 */
var parseTreeResources = exports.parseTreeResources = function parseTreeResources(dumbTree) {
  var naiveTree = Object.assign({}, dumbTree);
  var errors = [];
  if (naiveTree.resourcesStr) {
    (0, _bibTexConverter.parseBibTexStr)(naiveTree.resourcesStr, function (err, resources) {
      naiveTree.resources = resources;
    });
  }
  if (naiveTree.children) {
    naiveTree.children = naiveTree.children.map(function (child) {
      return parseTreeResources(child).naiveTree;
    });
  }
  return {
    naiveTree: naiveTree,
    errors: errors
  };
}; /**
    * This module parses resources expressions in .bib files representations
    * @module converter/sectionConverter/parseTreeResources
    */