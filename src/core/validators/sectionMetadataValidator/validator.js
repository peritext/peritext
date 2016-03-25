import {map as asyncMap} from 'async';

import {getMetaValue, filterResources} from './../../utils/sectionUtils';


export function validateResources(section, models, callback){
  const errors = [];

  section.resources.forEach((resource) =>{
    //validate resources unicity
    let other = filterResources(section.resources, 'citeKey', resource.citeKey);
    if(other.length > 1){
      errors.push(new Error('Resource ID ', resource.citeKey, 'is not unique for section ', getMetaValue(section.metadata, 'general', 'citeKey')))
    }
  });

  return callback(null, {errors, section});
}
