'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resolveSectionAgainstModels = undefined;

var _modelUtils = require('./../../utils/modelUtils');

var _sectionUtils = require('./../../utils/sectionUtils');

var _htmlMetaTemplateSerializer = require('./../../resolvers/htmlMetaTemplateSerializer');

var resolveSectionAgainstModels = exports.resolveSectionAgainstModels = function resolveSectionAgainstModels(section, models, callback) {
  var errors = [];
  // validate resources
  section.resources = section.resources.map(function (resource) {
    var model = (0, _modelUtils.getResourceModel)(resource.bibType, models.resourceModels);
    if (model) {
      // populate resource model with input resource data
      return model.properties.reduce(function (resolvedResource, propModel) {
        var key = propModel.key;
        if (propModel.required && !resource[key]) {
          errors.push({
            type: 'error',
            preciseType: 'invalidResource',
            sectionCiteKey: (0, _sectionUtils.getMetaValue)(section.metadata, 'general', 'citeKey'),
            message: 'property ' + key + ' is required in resource ' + resource.citeKey + '(bibType: ' + resource.bibType + ') and not present'
          });
        } else if (resource[key]) {
          resolvedResource[key] = (0, _modelUtils.resolvePropAgainstType)(resource[key], propModel.valueType, propModel);
        } else if (propModel.default) {
          resource[key] = propModel.default;
        }
        return resolvedResource;
      }, {});
    }
    errors.push({
      type: 'error',
      preciseType: 'invalidResource',
      sectionCiteKey: (0, _sectionUtils.getMetaValue)(section.metadata, 'general', 'citeKey'),
      message: 'Could not find suitable data model for resource ' + resource.citeKey
    });
    return {};
  });

  // validate metadata
  section.metadata = section.metadata.map(function (metadata) {
    // resolve unicity
    var model = models.metadataModels[metadata.domain][metadata.key];
    if (model) {
      var uniquePb = model.unique && Array.isArray(metadata.value) && metadata.value.length > 1;
      if (uniquePb) {
        errors.push({
          type: 'error',
          preciseType: 'invalidMetadata',
          sectionCiteKey: (0, _sectionUtils.getMetaValue)(section.metadata, 'general', 'citeKey'),
          message: metadata.key + ' value was set more than once for section ' + (0, _sectionUtils.getMetaValue)(section.metadata, 'general', 'title')
        });
        metadata.value = metadata.value[0];
      }

      if (Array.isArray(metadata.value)) {
        metadata.value = metadata.value.map(function (val) {
          if (typeof metadata.value === 'string') {
            return (0, _modelUtils.resolvePropAgainstType)(val, model.valueType, model);
          }
          return val;
        });
      } else if (typeof metadata.value === 'string') {
        metadata.value = (0, _modelUtils.resolvePropAgainstType)(metadata.value, model.valueType, model);
      }

      if (model.headTemplate) {
        metadata.htmlHead = (0, _htmlMetaTemplateSerializer.serializeHtmlMeta)(metadata, model.headTemplate);
      }
    } else {
      errors.push({
        type: 'warning',
        preciseType: 'invalidMetadata',
        sectionCiteKey: (0, _sectionUtils.getMetaValue)(section.metadata, 'general', 'citeKey'),
        message: metadata.domain + ' metadata property ' + metadata.key + ' is invalid in section ' + (0, _sectionUtils.getMetaValue)(section.metadata, 'general', 'title') + ' and therefore was not taken into account'
      });
    }

    return metadata;
  });

  // defaults
  for (var key in models.metadataModels.general) {
    if (models.metadataModels.general[key].default) {
      var present = (0, _sectionUtils.getMetaValue)(section.metadata, 'general', key);
      if (!present) {
        section.metadata.push({
          domain: 'general',
          key: key,
          value: models.metadataModels.general[key].default
        });
      }
    }
  }
  return callback(null, { errors: errors, section: section });
};