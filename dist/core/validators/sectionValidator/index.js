'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validateResources = undefined;

var _sectionUtils = require('./../../utils/sectionUtils');

/**
 * Validates the resources of a section against resources models
 * @param {Object} section - the section to validate
 * @param {Object} models - the models to use for validation
 * @param {function(err: null, output: Object)} callback - callbacks a list of validation errors descriptions, and unmodified sections
 */
var validateResources = exports.validateResources = function validateResources(section, models, callback) {
  var errors = [];

  section.resources.forEach(function (resource) {
    // validate resources unicity
    var other = (0, _sectionUtils.filterResources)(section.resources, 'citeKey', resource.citeKey);
    if (other.length > 1) {
      errors.push({
        type: 'error',
        preciseType: 'invalidResource',
        sectionCiteKey: (0, _sectionUtils.getMetaValue)(section.metadata, 'general', 'citeKey'),
        resourceCiteKey: resource.citeKey,
        message: 'Resource ID ' + resource.citeKey + 'is not unique'
      });
    }
  });
  return callback(null, { errors: errors, section: section });
}; /**
    * Section-related validation functions
    * @todo lighten sectionConverter by putting more utils there
    * @module validators/sectionValidator
    */