import {hasResource} from './../../utils/sectionUtils';
import {getResourceModel, resolvePropAgainstType} from './../../utils/modelUtils';

export function resolveContextualizations({section, models}, cb) {
  const errors = [];

  //populate contextualizers against their models
  section.contextualizers = section.contextualizers.map((contextualizer)=>{
    //guess contextualizer type if needed
    // console.log(contextualizer);

    if (!contextualizer.type) {
      //one resource
      if (contextualizer.resources.length === 1) {
        let sourceKey = contextualizer.resources[0];
        let source = section.resources.find((resource)=>{
          return resource.citeKey === sourceKey;
        });
        let type = section.contextualizations.find((contextualization)=>{
          return contextualization.contextualizer === contextualizer.citeKey;
        });

        if (source && type) {
          type = type.type;
          if (type === 'inline') {
            contextualizer.type = models.resourceModels.individual[source.bibType].default_contextualizer_inline;
          } else {
            contextualizer.type = models.resourceModels.individual[source.bibType].default_contextualizer_block;
          }
        }else {
          errors.push({
           type : 'error',
           preciseType : 'invalidContextualizer',
           sectionCiteKey : getMetaValue(section.metadata, 'general', 'citeKey'),
           contextualizerCiteKey : contextualizer.citeKey,
           message : 'could not determine contextualizer type of contextualizer ' + contextualizer.citeKey
         });
          return undefined;
        }
      }//else if (contextualize.resources.length > 1){
      //todo : handle resources combo verification here
      //}
    }

    //resolve contextualizer object against its model
    const model = getResourceModel(contextualizer.type, models.contextualizerModels);

    contextualizer = model.properties.reduce((obj, model) =>{
      obj[model.key] = resolvePropAgainstType(contextualizer[model.key], model.valueType, model);
      return obj;
    }, {});

    return contextualizer;
  });


  //verify that all required resources exist
  section.contextualizations = section.contextualizations.filter((contextualization) =>{
    let ok = true;
    contextualization.resources.some((res) =>{
      if (hasResource(section.resources, {citeKey : res})) {
        return true;
      }else {
        errors.push({
          type : 'error',
          preciseType : 'invalidContextualization',
          sectionCiteKey : getMetaValue(section.metadata, 'general', 'citeKey'),
          message : 'resource ' + res + ' was asked in a contextualization but was not found'
        });
        return ok = false;
      }
    });
    return ok;
  });

  cb(null, {errors, section});
}
