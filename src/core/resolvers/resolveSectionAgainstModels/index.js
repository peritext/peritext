import {getResourceModel} from './../../utils/modelUtils';
import {getMetaValue} from './../../utils/sectionUtils';

/*
function eatNestedStringArray(prop, separator, wrappers){
  let output = [],
      temp = '',
      cursor = 0,
      wrapLevel = 0,
      character;

  while(cursor < prop.length){
    character = prop.charAt(cursor);
    if(character === wrappers[0]){
      wrapLevel++;
    }else if(character === wrappers[0]){
      wrapLevel--;
    }else if(character === separator && wrapLevel === 0){
      output.push(temp);
      temp = '';
    }else{
      temp += character;
    }
    cursor++;
  }
  output.push(temp);
  console.log(output);

  return output.map((val)=>{
    return val.trim();
  })
}*/

function resolvePropAgainstType(prop, valueType){
  switch(valueType){

    case 'stringArray':
      return eatNestedStringArray(prop, ',', ['{', '}']);
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
  //validate metadata
  section.resources = section.resources.map((resource) =>{
    return resource;
    /*let model = getResourceModel(getMetaValue(section.metadata, 'general', 'bibType'), models.resourceModels);
    return Object.keys(model).reduce((resolvedResource, key) => {
      return resolvedResource[key] = resource[key];
    }, {});*/
  });

  // console.log(section.resources.map);


  return callback(null, {errors, section});
}
