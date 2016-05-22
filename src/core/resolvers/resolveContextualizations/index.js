import {hasResource, getMetaValue} from './../../utils/sectionUtils';
import {getResourceModel, getContextualizerModel, resolvePropAgainstType} from './../../utils/modelUtils';

export function resolveContextualizations({section, models}, cb) {
  const errors = [];

  // populate contextualizers against their models
  section.contextualizers = section.contextualizers.map((contextualizer)=>{
    const newContextualizer = Object.assign({}, contextualizer);
    // guess contextualizer type if needed
    if (!newContextualizer.type) {
      // one resource
      if (contextualizer.resources.length === 1) {
        const sourceKey = contextualizer.resources[0];
        const source = section.resources.find((resource)=>{
          return resource.citeKey === sourceKey;
        });
        const sourceModel = getResourceModel(source.bibType, models.resourceModels);
        newContextualizer.type = sourceModel.defaultContextualizer;
      }
    }
    // resolve contextualizer object against its model
    const contextualizerModel = getContextualizerModel(newContextualizer.type, models.contextualizerModels);
    const finalContextualizer = contextualizerModel.properties.reduce((obj, thatModel) =>{
      obj[thatModel.key] = resolvePropAgainstType(contextualizer[thatModel.key], thatModel.valueType, thatModel);
      // record error if required field is undefined
      if (obj[thatModel.key] === undefined && thatModel.required === true) {
        errors.push({
          type: 'error',
          preciseType: 'invalidContextualizer',
          sectionCiteKey: getMetaValue(section.metadata, 'general', 'citeKey'),
          message: 'contextualizer ' + newContextualizer.citeKey + ' does not provide required type ' + thatModel.key
        });
      }
      return obj;
    }, {});

    return finalContextualizer;
  });


  // verify that all required resources exist
  section.contextualizations = section.contextualizations.filter((contextualization) =>{
    let ok = true;
    contextualization.resources.some((res) =>{
      if (hasResource(section.resources, {citeKey: res})) {
        return true;
      }
      errors.push({
        type: 'error',
        preciseType: 'invalidContextualization',
        sectionCiteKey: getMetaValue(section.metadata, 'general', 'citeKey'),
        message: 'resource ' + res + ' was asked in a contextualization but was not found'
      });
      ok = false;
      return ok;
    });
    return ok;
  });

  cb(null, {errors, section});
}
