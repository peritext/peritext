/**
 * Resolver dedicated to resolve sections against metadata models
 * @module resolvers/resolveSectionAgainstModels
 */
import {getResourceModel, resolvePropAgainstType} from './../../utils/modelUtils';
import {getMetaValue} from './../../utils/sectionUtils';
import {serializeHtmlMeta} from './../../resolvers/htmlMetaTemplateSerializer';

/**
 * Consumes and normalize the metadata of a section
 * @param {Object} section - the section to resolve
 * @param {Object} models - the models to use for resolution
 * @param {function(err:error, result: {errors: array, section: Object})} callback - the resulting resolution errors and updated section
 */
export const resolveSectionAgainstModels = (section, models, callback) => {
  const errors = [];
  // validate resources
  section.resources = section.resources.map((resource) =>{
    const model = getResourceModel(resource.bibType, models.resourceModels);
    if (model) {
      // populate resource model with input resource data
      return model.properties.reduce((resolvedResource, propModel) => {
        const key = propModel.key;
        if (propModel.required && !resource[key]) {
          errors.push({
            type: 'error',
            preciseType: 'invalidResource',
            sectionCiteKey: getMetaValue(section.metadata, 'general', 'citeKey'),
            message: 'property ' + key + ' is required in resource ' + resource.citeKey + '(bibType: ' + resource.bibType + ') and not present'
          });
        }else if (resource[key]) {
          resolvedResource[key] = resolvePropAgainstType(resource[key], propModel.valueType, propModel);
        } else if (propModel.default) {
          resource[key] = propModel.default;
        }
        return resolvedResource;
      }, {});
    }
    errors.push({
      type: 'error',
      preciseType: 'invalidResource',
      sectionCiteKey: getMetaValue(section.metadata, 'general', 'citeKey'),
      message: 'Could not find suitable data model for resource ' + resource.citeKey
    });
    return {};
  });

  // validate metadata
  section.metadata = section.metadata.map((metadata) => {
    // resolve unicity
    const model = models.metadataModels[metadata.domain][metadata.key];
    if (model) {
      const uniquePb = model.unique && Array.isArray(metadata.value) && metadata.value.length > 1;
      if (uniquePb) {
        errors.push({
          type: 'error',
          preciseType: 'invalidMetadata',
          sectionCiteKey: getMetaValue(section.metadata, 'general', 'citeKey'),
          message: metadata.key + ' value was set more than once for section ' + getMetaValue(section.metadata, 'general', 'title')
        });
        metadata.value = metadata.value[0];
      }

      if (Array.isArray(metadata.value)) {
        metadata.value = metadata.value.map((val)=> {
          if (typeof metadata.value === 'string') {
            return resolvePropAgainstType(val, model.valueType, model);
          }
          return val;
        });

      }else if (typeof metadata.value === 'string') {
        metadata.value = resolvePropAgainstType(metadata.value, model.valueType, model);
      }

      if (model.headTemplate) {
        metadata.htmlHead = serializeHtmlMeta(metadata, model.headTemplate);
      }

    }else {
      errors.push({
        type: 'warning',
        preciseType: 'invalidMetadata',
        sectionCiteKey: getMetaValue(section.metadata, 'general', 'citeKey'),
        message: metadata.domain + ' metadata property ' + metadata.key + ' is invalid in section ' + getMetaValue(section.metadata, 'general', 'title') + ' and therefore was not taken into account'
      });
    }

    return metadata;
  });

  // defaults
  for (const key in models.metadataModels.general) {
    if (models.metadataModels.general[key].default) {
      const present = getMetaValue(section.metadata, 'general', key);
      if (!present) {
        section.metadata.push({
          domain: 'general',
          key,
          value: models.metadataModels.general[key].default
        });
      }
    }
  }
  return callback(null, {errors, section});
};
