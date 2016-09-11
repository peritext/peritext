'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resolveResourcesAgainstModels = undefined;

var _modelUtils = require('./../../utils/modelUtils');

var resolveResourcesAgainstModels = exports.resolveResourcesAgainstModels = function resolveResourcesAgainstModels(resources, models) {
  var newResources = Object.assign({}, resources);
  var newErrors = [];
  for (var resourceKey in newResources) {
    if (newResources[resourceKey]) {
      (function () {
        var resource = newResources[resourceKey];
        var model = (0, _modelUtils.getResourceModel)(resource.bibType, models.resourceModels);
        if (model) {
          // populate resource model with input resource data
          newResources[resourceKey] = model.properties.reduce(function (resolvedResource, propModel) {
            var key = propModel.key;
            if (propModel.required && !resource[key]) {
              newErrors.push({
                type: 'error',
                preciseType: 'invalidResource',
                message: 'property ' + key + ' is required in resource ' + resource.citeKey + '(bibType: ' + resource.bibType + ') and not present'
              });
            } else if (resource[key]) {
              resolvedResource[key] = (0, _modelUtils.resolvePropAgainstType)(resource[key], propModel.valueType, propModel);
            } else if (propModel.default) {
              resource[key] = propModel.default;
            }
            return resolvedResource;
          }, {});
        } else {
          newErrors.push({
            type: 'error',
            preciseType: 'invalidResource',
            message: 'Could not find suitable data model for resource ' + resource.citeKey
          });
        }
      })();
    }
  }
  return { newResources: newResources, newErrors: newErrors };
};