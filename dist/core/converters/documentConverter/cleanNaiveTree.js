'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cleanNaiveTree = undefined;

var _slug = require('slug');

var _slug2 = _interopRequireDefault(_slug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Resolves resource and metadata statements from a naive representation of a section
 * @param {Object} params - the cleaning params
 * @param {array} params.errors - the inherited parsing errors to pass along to the next step
 * @param {Object} params.validTree - the tree to clean
 * @param {Object} models - the models to parse the resources with
 * @return {errors: array, validTree: Object} - the possible error, a list of parsing minor errors, and the resulting tree
 */
var cleanNaiveTree = exports.cleanNaiveTree = function cleanNaiveTree(_ref, models) {
  var _ref$errors = _ref.errors;
  var errors = _ref$errors === undefined ? [] : _ref$errors;
  var validTree = _ref.validTree;

  var contextualizers = [];
  var naiveTree = Object.assign({}, validTree);
  var metadata = void 0;
  var hasResources = naiveTree && naiveTree.resources;
  // has it a resource file
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
          resourceId: res.id,
          message: 'could not find resource type ' + res.bibType + ' for Resource ID ' + res.id
        });
        return false;
      }
      return true;
    });
  } else naiveTree.resources = [];
  // populate automatic metadata
  if (metadata === undefined && naiveTree.name.charAt(0) !== '_') {
    errors.push({
      type: 'warning',
      preciseType: 'metadataNotFound',
      message: 'no metadata specified for the folder ' + naiveTree.name + ' so it was not taken into account'
    });
    // bootstrap a minimal metadata
    metadata = {
      bibType: 'peritextinherits',
      id: (0, _slug2.default)(naiveTree.name.toLowerCase()),
      title: naiveTree.name
    };
  }
  // parse children if present
  if (naiveTree.children && naiveTree.name.charAt(0) !== '_') {
    naiveTree.children = naiveTree.children.map(function (child) {
      return cleanNaiveTree({ validTree: child }, models);
    }).filter(function (result) {
      return result.validTree !== undefined;
    }).map(function (result) {
      return result.validTree;
    });
  }
  var newErrors = errors.length > 0 ? errors.reverse() : null;
  return {
    errors: newErrors,
    validTree: Object.assign({}, naiveTree, { metadata: metadata }, { contextualizers: contextualizers })
  };
}; /**
    * This module cleans resources and metadata from a naive (resource concatenated) tree
    * @module converter/documentConverter/cleanNaiveTree
    */