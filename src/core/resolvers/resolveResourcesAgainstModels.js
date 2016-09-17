
import {getResourceModel, resolvePropAgainstType} from '../utils/modelUtils';

export const resolveResourcesAgainstModels = (resources, models)=> {
  const newResources = Object.assign({}, resources);
  const newErrors = [];
  for (const resourceKey in newResources) {
    if (newResources[resourceKey]) {
      const resource = newResources[resourceKey];
      const model = getResourceModel(resource.bibType, models.resourceModels);
      if (model) {
        // populate resource model with input resource data
        newResources[resourceKey] = model.properties.reduce((resolvedResource, propModel) => {
          const key = propModel.key;
          if (propModel.required && !resource[key]) {
            newErrors.push({
              type: 'error',
              preciseType: 'invalidResource',
              message: 'property ' + key + ' is required in resource ' + resource.id + '(bibType: ' + resource.bibType + ') and not present'
            });
          } else if (resource[key]) {
            resolvedResource[key] = resolvePropAgainstType(resource[key], propModel.valueType, propModel);
          } else if (propModel.default) {
            resource[key] = propModel.default;
          }
          return resolvedResource;
        }, {});
      } else {
        newErrors.push({
          type: 'error',
          preciseType: 'invalidResource',
          message: 'Could not find suitable data model for resource ' + resource.id
        });
      }
    }
  }
  return {newResources, newErrors};
};
