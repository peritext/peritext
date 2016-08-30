'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseTreeResources = undefined;

var _bibTexConverter = require('./../../converters/bibTexConverter/');

var _async = require('async');

/**
 * Converts dumbTree resources representations (as string) to js objects - recursively do the same for tree's children
 * @param {Object} dumbTree - a semi-parsed representation inbetween an fsTree and a more structured representation
 * @param {function(error: error, dumbTree: Object)} callback - the output representation
 */
/**
 * This module parses resources expressions in .bib files representations
 * @module converter/sectionConverter/parseTreeResources
 */
var parseTreeResources = exports.parseTreeResources = function parseTreeResources(dumbTree, callback) {
  if (dumbTree.resourcesStr) {
    (0, _bibTexConverter.parseBibTexStr)(dumbTree.resourcesStr, function (err, resources) {
      if (dumbTree.children) {
        (0, _async.map)(dumbTree.children, parseTreeResources, function (error, children) {
          callback(error, Object.assign({}, dumbTree, { resources: resources }, { children: children }));
        });
      }
    });
  } else callback(null, Object.assign({}, dumbTree));
};