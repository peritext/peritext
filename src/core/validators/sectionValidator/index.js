/**
 * Section-related validation functions
 * @todo lighten sectionConverter by putting more utils there
 * @module validators/sectionValidator
 */

import {getMetaValue, filterResources} from './../../utils/sectionUtils';

/**
 * Validates the resources of a section against resources models
 * @param {Object} section - the section to validate
 * @param {Object} models - the models to use for validation
 * @param {function(err: null, output: Object)} callback - callbacks a list of validation errors descriptions, and unmodified sections
 */
export const validateResources = (section, models, callback) =>{
  const errors = [];

  section.resources.forEach((resource) =>{
    // validate resources unicity
    const other = filterResources(section.resources, 'citeKey', resource.citeKey);
    if (other.length > 1) {
      errors.push({
        type: 'error',
        preciseType: 'invalidResource',
        sectionCiteKey: getMetaValue(section.metadata, 'general', 'citeKey'),
        resourceCiteKey: resource.citeKey,
        message: 'Resource ID ' + resource.citeKey + 'is not unique'
      });
    }
  });
  return callback(null, {errors, section});
};
