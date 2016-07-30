'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validateResources = undefined;

var _sectionUtils = require('./../../utils/sectionUtils');

// I verify if the resources of a section are correct
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
};