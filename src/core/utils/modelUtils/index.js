import {parseBibAuthors} from './../../converters/bibTexConverter';


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

    //then finally parsed common props
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
