'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseTreeResources = undefined;

var _bibTexConverter = require('./../../converters/bibTexConverter/');

var _async = require('async');

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