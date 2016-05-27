/*
 * Dedicated to everything that deals with models (composing, translating values, ...)
 */

import {parseBibAuthors} from './../../converters/bibTexConverter';

// I build a model object from a specific bibType, composing it according to its inheritance dependencies, from more general models to the specific bibType
export function getResourceModel(bibType, resourceModels) {
  const model = resourceModels.individual[bibType];
  if (model) {
    // first set highestly specific props
    let properties = model.properties;
    let defaultContextualizer = model.defaultContextualizer;
    let otherProps;
    let existing;
    // then parse related categories
    model.categories.forEach((category) => {
      otherProps = resourceModels.collective[category]
                    .properties
                    .filter((prop) =>{
                      existing = properties.find((property) =>{
                        return property.key === prop.key;
                      });
                      if (existing) {
                        return false;
                      }
                      return true;
                    });
      properties = properties.concat(otherProps);

      // inherit default contextualizer
      if (resourceModels.collective[category].defaultContextualizer && !defaultContextualizer) {
        defaultContextualizer = resourceModels.collective[category].defaultContextualizer;
      }
    });

    // then finally parse common props
    otherProps = resourceModels.collective.common
                    .properties
                    .filter((prop) =>{
                      existing = properties.find((property) =>{
                        return property.key === prop.key;
                      });
                      if (existing) {
                        return false;
                      }
                      return true;
                    });
    properties = properties.concat(otherProps);

    return Object.assign({}, model, {properties: model.properties.concat(properties)}, {defaultContextualizer});
  }
  return undefined;
}

// I build a model object from a specific bibType, composing it according to its inheritance dependencies, from more general models to the specific bibType
export function getContextualizerModel(bibType, contextualizerModels) {
  const model = contextualizerModels.individual[bibType];
  if (model) {
    // first set highestly specific props
    let properties = model.properties;
    let otherProps;
    let existing;
    // then parse related categories
    model.categories.forEach((category) => {
      otherProps = contextualizerModels.collective[category]
                    .properties
                    .filter((prop) =>{
                      existing = properties.find((property) =>{
                        return property.key === prop.key;
                      });
                      if (existing) {
                        return false;
                      }
                      return true;
                    });
      properties = properties.concat(otherProps);

    });

    // then finally parse common props
    otherProps = contextualizerModels.collective.common
                    .properties
                    .filter((prop) =>{
                      existing = properties.find((property) =>{
                        return property.key === prop.key;
                      });
                      if (existing) {
                        return false;
                      }
                      return true;
                    });
    properties = properties.concat(otherProps);
    return Object.assign({}, model, {properties});
  }
  return undefined;
}

// I turn a (possibly not primitive : array, object, bibAuthor) value to a string-friendly value, thanks to its model's type
export function serializePropAgainstType(prop, valueType, model) {
  if (prop === undefined) {
    return undefined;
  }
  switch (valueType) {
  case 'string':
    return prop;

  case 'stringArray':
    return prop.join(', ');

  case 'bibAuthorsArray':
    return prop.map((author) =>{
      if (author.firstName) {
        return author.firstName + ' {' + author.lastName + '}';
      }
      return author.lastName;
    }).join('; ');

  case 'objectArray' : {
    if (model.children && Array.isArray(prop)) {
      const newProp = prop.map((obj)=>{
        if (typeof obj === 'object') {
          const vals = Object.keys(obj).map((key)=>{
            if (obj[key] !== undefined) {
              return key + '=' + obj[key];
            }
            return '';
          });
          return vals.filter((part)=>{return part.length;}).join(',');
        }
        return undefined;
      });
      return newProp;
    }
    break;
  }

  default:
    return prop;
  }

}

// I turn a string value into another (possibly complex) value, thanks to its model's type
export function resolvePropAgainstType(prop, valueType, model) {
  let val;
  if (prop === undefined) {
    // looking for a default value if no value specified
    if (model.default) {
      return model.default;
    }
    return undefined;
  // looking for restricted values
  } else if (model.values) {
    const validValue = model.values.find((value) => {
      return value === prop;
    });
    // value not allowed
    if (validValue === undefined) {
      // look for default
      if (model.default) {
        return model.default;
      }
      // or return undefined
      return undefined;
    }
  }
  switch (valueType) {
  case 'number':
    return +prop;

  case 'numberArray':
    return prop.split(',').map((number)=> {
      return +number.trim();
    });

  case 'string':
    if (model.values) {
      // nominal set of possible values
      val = model.values.some((mval)=>{
        return mval === prop;
      });
      return val;
    }
    return prop;

  case 'stringArray':
    return prop.split(/,|;/).map((value)=>{return value.trim();});

  case 'bibAuthorsArray':
    return parseBibAuthors(prop);

  case 'objectArray' : {
    if (model.children && Array.isArray(prop)) {
      const newProp = prop.map((obj)=>{
        if (typeof obj === 'object') {
          const newObj = model.children.reduce((thatObj, childModel) =>{
            thatObj[childModel.key] = resolvePropAgainstType(obj[childModel.key], childModel.valueType, childModel);
            return thatObj;
          }, {});
          return newObj;
        }
        return undefined;
      });
      return newProp;
    }
  }

  default:
    return prop;
  }
}
