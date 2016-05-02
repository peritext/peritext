import {map as asyncMap} from 'async';

import {getMetaValue, filterResources} from './../../utils/sectionUtils';

// I verify if the resources of a section are correct
export function validateResources(section, models, callback){
  const errors = [];

  section.resources.forEach((resource) =>{
    //validate resources unicity
    let other = filterResources(section.resources, 'citeKey', resource.citeKey);
    if(other.length > 1){
      errors.push({
        type : 'error',
        preciseType : 'invalidResource',
        sectionCiteKey : getMetaValue(section.metadata, 'general', 'citeKey'),
        resourceCiteKey : resource.citeKey,
        message : 'Resource ID '+ resource.citeKey+ 'is not unique'
      });
    }
  });
  return callback(null, {errors, section});
}
