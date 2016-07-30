'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cleanNaiveTree = undefined;

var _async = require('async');

var cleanNaiveTree = exports.cleanNaiveTree = function cleanNaiveTree(_ref, models, callback) {
  var _ref$errors = _ref.errors;
  var errors = _ref$errors === undefined ? [] : _ref$errors;
  var validTree = _ref.validTree;

  var contextualizers = [];
  var naiveTree = Object.assign({}, validTree);
  var metadata = void 0;
  var hasResources = naiveTree && naiveTree.resources;
  if (hasResources) {
    naiveTree.resources = naiveTree.resources.filter(function (res) {
      // catch metadata
      var validated = void 0;
      // extract contextualizer descriptions
      if (res.bibType === 'contextualizer') {
        contextualizers.push(res);
        return false;
      }
      for (var type in models.sectionTypeModels.acceptedTypes) {
        if (res.bibType === 'peritext' + type) {
          metadata = res;
          return false;
        }
      }

      if (!validated) {
        // verify that the resource type are known
        for (var otherType in models.resourceModels.individual) {
          if (res.bibType === otherType) {
            return true;
          }
        }
      }
      // if not validated, record error and don't take resource
      if (!validated) {
        errors.push({
          type: 'error',
          preciseType: 'invalidResource',
          resourceCiteKey: res.citeKey,
          message: 'could not find resource type ' + res.bibType + ' for Resource ID ' + res.citeKey
        });
        return false;
      }
      return true;
    });
  }
  if (metadata === undefined && naiveTree.name.charAt(0) !== '_') {
    errors.push({
      type: 'warning',
      preciseType: 'metadataNotFound',
      message: 'no metadata specified for the folder ' + naiveTree.name + ' so it was not taken into account'
    });
    var _newErrors = errors.length > 0 ? errors.reverse() : null;
    return callback(null, { errors: _newErrors, validTree: undefined });
  } else if (naiveTree.children) {
    return (0, _async.map)(naiveTree.children, function (child, cb) {
      cleanNaiveTree({ validTree: child }, models, cb);
    }, function (err, results) {
      // filter valid children tree leaves
      var children = results.filter(function (result) {
        return result.validTree !== undefined;
      }).map(function (result) {
        return result.validTree;
      });

      var newErrors = results.reduce(function (theseErrors, result) {
        return theseErrors.concat(result.errors);
      }, errors);
      return callback(null, { errors: newErrors, validTree: Object.assign({}, naiveTree, { metadata: metadata }, { children: children }, { contextualizers: contextualizers }) });
    });
  }
  var newErrors = errors.length > 0 ? errors.reverse() : null;
  return callback(null, { errors: newErrors, validTree: Object.assign({}, naiveTree, { metadata: metadata }, { contextualizers: contextualizers }) });
}; /**
    * This module cleans resources and metadata from a naive (resource concatenated) tree
    */