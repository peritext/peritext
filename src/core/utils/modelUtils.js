/**
 * Utils - dedicated to everything that deals with models (composing, translating values, ...)
 * @module utils/modelUtils
 */
import {parseBibAuthors} from '../converters/bibTexConverter';

/**
 * Builds a model object from a specific bibType, composing it according to its inheritance dependencies, from more general models to the specific bibType
 * @param {string} bibType - the bibType of the resource
 * @param {Object} resourceModels - the models describing resources data
 * @return {Object} model - the model corresponding to the input bibType
 */
export const getResourceModel = (bibType, resourceModels) =>{
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
};

/**
 * Build a model object from a specific bibType, composing it according to its inheritance dependencies, from more general models to the specific bibType
 * @param {string} bibType - the bibType of the contextualizer
 * @param {Object} contextualizerModels - the models describing contextualizer possible data
 * @return {Object} model - the model corresponding to the input bibType
 */
export const getContextualizerModel = (bibType, contextualizerModels) =>{
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
};

/**
 * Transforms a (possibly not primitive : array, object, bibAuthor) value to a string-friendly value, thanks to its model's type
 * @param {Object} prop - the prop to serialize
 * @param {string} valueType - the type of the value ('string', 'stringArray', 'bibAuthor', ...)
 * @param {Object} model - the model to parse the prop against
 * @return {string} newValue - the serialized value
 */
export const serializePropAgainstType = (prop, valueType, model) => {
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

};

/**
 * Transforms a string value to a complex and type-compliant value, thanks to its model's type
 * @param {Object} prop - the prop to resolve
 * @param {string} valueType - the type of the value ('string', 'stringArray', 'bibAuthor', ...)
 * @param {Object} model - the model to parse the prop against
 * @return {string|array|number|Object} newValue - the resolved value
 */
export const resolvePropAgainstType = (prop, valueType, model) => {
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
    /*
    if (model.values) {
      // nominal set of possible values
      val = model.values.some((mval)=>{
        return mval === prop;
      });
      console.log('val : ', val);
      return val;
    }
    */
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
};

/**
 * Populate rendering settings according to default bibtype-related settings
 * @param {Object} settings - the settings provided as input
 * @param {string} bibType - the bibType of the root section to render
 * @param {Object} settingsModel - the model to use for populating the settings
 * @return {Object} newSettings - the populated settings
 */
export const resolveSettings = (settings = {}, bibType, settingsModel) =>{
  const typeModel = {};
  for (const param in settingsModel) {
    if (settingsModel[param].default[bibType]) {
      typeModel[param] = settingsModel[param].default[bibType];
    } else {
      typeModel[param] = settingsModel[param].default.default;
    }
  }
  return Object.assign(typeModel, settings);
};
