/*
 * Dedicated to everything that deals with models (composing, translating values, ...)
 */

import {parseBibAuthors} from './../../converters/bibTexConverter';

// I build a model object from a specific bibType, composing it according to its inheritance dependencies, from more general models to the specific bibType
export function getResourceModel(bibType, resourceModels){
  let model  = resourceModels.individual[bibType];
  if(model){
    //first set highestly specific props
    let properties = model.properties, otherProps, existing;
    //then parse related categories
    model.categories.forEach((category) => {
      otherProps = resourceModels.collective[category]
                    .properties
                    .filter((prop) =>{
                      existing = properties.find((p) =>{
                        return p.key === prop.key
                      });
                      if(existing){
                        return false;
                      }else return true;
                    });
      properties = properties.concat(otherProps);
    });

    //then finally parse common props
    otherProps = resourceModels.collective.common
                    .properties
                    .filter((prop) =>{
                      existing = properties.find((p) =>{
                        return p.key === prop.key
                      });
                      if(existing){
                        return false;
                      }else return true;
                    });
    properties = properties.concat(otherProps);

    return Object.assign({}, model, {properties});
  }else return undefined;
}

//I turn a (possibly not primitive : array, object, bibAuthor) value to a string-friendly value, thanks to its model's type
export function serializePropAgainstType(prop, valueType, model){
  let val;
  if(prop === undefined){
    return undefined;
  }else switch(valueType){

    case 'string':
      return prop;
    break;

    case 'stringArray':
      return prop.join(', ');
    break;

    case 'bibAuthorsArray':

      return prop.map((author) =>{

        if(author.firstName){
          return author.firstName + ' {'+author.lastName + '}';
        } else return author.lastName;
      }).join('; ');
    break;

    case 'objectArray' : {
      if(model.children && Array.isArray(prop)){
        prop = prop.map((obj)=>{
          if(typeof obj === 'object'){
            let vals = Object.keys(obj).map((key)=>{
              if(obj[key] !== undefined){
                return key + '=' + obj[key];
              }else return '';
            });
            return vals.filter((part)=>{return part.length}).join(',');
          }else return undefined;
        });
        return prop;
      }
    }

    default:
      return prop;
    break;
  }
}

// I turn a string value into another (possibly complex) value, thanks to its model's type
export function resolvePropAgainstType(prop, valueType, model){
  let val;
  if(prop === undefined){
    return undefined;
  }else switch(valueType){

    case 'string':
      if(model.values){
        //nominal set of possible values
        val = model.values.some((mval)=>{
          return mval === prop;
        });
        return val;
      }else return prop;
    break;

    case 'stringArray':
      return prop.split(/,|;/).map((val)=>{return val.trim()});
    break;

    case 'bibAuthorsArray':
      return parseBibAuthors(prop);
    break;

    case 'objectArray' : {
      if(model.children && Array.isArray(prop)){
        prop = prop.map((obj)=>{
          if(typeof obj === 'object'){
            obj = model.children.reduce((o, childModel) =>{
              o[childModel.key] = resolvePropAgainstType(obj[childModel.key], childModel.valueType, childModel);
              return o;
            }, {});
            return obj;
          }else return undefined;
        });
        return prop;
      }
    }

    default:
      return prop;
    break;
  }
}
