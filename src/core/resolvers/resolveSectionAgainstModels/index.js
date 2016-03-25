import {getResourceModel} from './../../utils/modelUtils';
import {getMetaValue, sameMetaScope} from './../../utils/sectionUtils';
import {parseBibAuthors} from './../../converters/bibTexConverter';
import {serializeHtmlMeta} from './../../resolvers/htmlMetaTemplateSerializer';



function resolvePropAgainstType(prop, valueType){
  switch(valueType){

    case 'stringArray':
      return prop.split(/,|;/).map((val)=>{return val.trim()});
    break;

    case 'bibAuthorsArray':
      return parseBibAuthors(prop);
    break;

    default:
      return prop;
    break;
  }
}

function processPropValue(prop, propertyModel){
  let cleanVal = prop.match(/^\{(.*)\}$|^\"(.*)\"$/);
  prop = (cleanVal)?cleanVal[1]:prop;
  prop = resolvePropAgainstType(prop, propertyModel.valueType);
  return prop;
}

export function resolveSectionAgainstModels(section, models, callback){
  const errors = [];
  //validate resources
  section.resources = section.resources.map((resource) =>{
    let model = getResourceModel(getMetaValue(section.metadata, 'general', 'bibType'), models.resourceModels);
    if(model){
      //populate resource model with input resource data
      return model.properties.reduce((resolvedResource, propModel) => {
        let key = propModel.key;
        if(propModel.required && !resource[key]){
          errors.push(new Error('property ' + key+ ' is required in resource '+resource.citeKey+' and not present'));
        }else if(resource[key]){
          resolvedResource[key] = resolvePropAgainstType(resource[key], propModel.valueType);
        }
        return resolvedResource;
      }, {});
    }else{
      errors.push(new Error('Could not find suitable data model for resource '+ resource.citeKey));
      return {};
    }
  });

  //validate metadata
  section.metadata = section.metadata.map((metadata, i) =>{
    //resolve unicity
    let model = models.metadataModels[metadata.domain][metadata.key];
    if(model){

      let uniquePb = model.unique && Array.isArray(metadata.value) && metadata.value.length > 1;
      if(uniquePb){
        errors.push(new Error(metadata.key +' value was set more than once for section '+ getMetaValue(section.metadata, 'general', 'title')));
        metadata.value = metadata.value[0];
      }

      if(Array.isArray(metadata.value)){
        metadata.value = metadata.value.map((val, j)=>{
          if(typeof metadata.value === 'string')
           return resolvePropAgainstType(val, model.valueType);
          else return val;
        });

      }else if(typeof metadata.value === 'string'){
        metadata.value = resolvePropAgainstType(metadata.value, model.valueType);
      }

      if(model.headTemplate){
        metadata.htmlHead = serializeHtmlMeta(metadata, model.headTemplate);
      }

    }else{
      errors.push(new Error(metadata.domain + ' metadata property '+metadata.key + ' is invalid in section '+ getMetaValue(section.metadata, 'general', 'title')))
    }

    return metadata;
  });

  return callback(null, {errors, section});
}
