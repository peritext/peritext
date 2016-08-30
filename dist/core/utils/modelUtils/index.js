'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resolveSettings = exports.resolvePropAgainstType = exports.serializePropAgainstType = exports.getContextualizerModel = exports.getResourceModel = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; }; /**
                                                                                                                                                                                                                                                   * Utils - dedicated to everything that deals with models (composing, translating values, ...)
                                                                                                                                                                                                                                                   * @module utils/modelUtils
                                                                                                                                                                                                                                                   */


var _bibTexConverter = require('./../../converters/bibTexConverter');

/**
 * Builds a model object from a specific bibType, composing it according to its inheritance dependencies, from more general models to the specific bibType
 * @param {string} bibType - the bibType of the resource
 * @param {Object} resourceModels - the models describing resources data
 * @return {Object} model - the model corresponding to the input bibType
 */
var getResourceModel = exports.getResourceModel = function getResourceModel(bibType, resourceModels) {
  var model = resourceModels.individual[bibType];
  if (model) {
    var _ret = function () {
      // first set highestly specific props
      var properties = model.properties;
      var defaultContextualizer = model.defaultContextualizer;
      var otherProps = void 0;
      var existing = void 0;
      // then parse related categories
      model.categories.forEach(function (category) {
        otherProps = resourceModels.collective[category].properties.filter(function (prop) {
          existing = properties.find(function (property) {
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
      otherProps = resourceModels.collective.common.properties.filter(function (prop) {
        existing = properties.find(function (property) {
          return property.key === prop.key;
        });
        if (existing) {
          return false;
        }
        return true;
      });
      properties = properties.concat(otherProps);

      return {
        v: Object.assign({}, model, { properties: model.properties.concat(properties) }, { defaultContextualizer: defaultContextualizer })
      };
    }();

    if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
  }
  return undefined;
};

/**
 * Build a model object from a specific bibType, composing it according to its inheritance dependencies, from more general models to the specific bibType
 * @param {string} bibType - the bibType of the contextualizer
 * @param {Object} contextualizerModels - the models describing contextualizer possible data
 * @return {Object} model - the model corresponding to the input bibType
 */
var getContextualizerModel = exports.getContextualizerModel = function getContextualizerModel(bibType, contextualizerModels) {
  var model = contextualizerModels.individual[bibType];
  if (model) {
    var _ret2 = function () {
      // first set highestly specific props
      var properties = model.properties;
      var otherProps = void 0;
      var existing = void 0;
      // then parse related categories
      model.categories.forEach(function (category) {
        otherProps = contextualizerModels.collective[category].properties.filter(function (prop) {
          existing = properties.find(function (property) {
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
      otherProps = contextualizerModels.collective.common.properties.filter(function (prop) {
        existing = properties.find(function (property) {
          return property.key === prop.key;
        });
        if (existing) {
          return false;
        }
        return true;
      });
      properties = properties.concat(otherProps);
      return {
        v: Object.assign({}, model, { properties: properties })
      };
    }();

    if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
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
var serializePropAgainstType = exports.serializePropAgainstType = function serializePropAgainstType(prop, valueType, model) {
  if (prop === undefined) {
    return undefined;
  }
  switch (valueType) {
    case 'string':
      return prop;

    case 'stringArray':
      return prop.join(', ');

    case 'bibAuthorsArray':
      return prop.map(function (author) {
        if (author.firstName) {
          return author.firstName + ' {' + author.lastName + '}';
        }
        return author.lastName;
      }).join('; ');

    case 'objectArray':
      {
        if (model.children && Array.isArray(prop)) {
          var newProp = prop.map(function (obj) {
            if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object') {
              var vals = Object.keys(obj).map(function (key) {
                if (obj[key] !== undefined) {
                  return key + '=' + obj[key];
                }
                return '';
              });
              return vals.filter(function (part) {
                return part.length;
              }).join(',');
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
var resolvePropAgainstType = exports.resolvePropAgainstType = function resolvePropAgainstType(prop, valueType, model) {
  if (prop === undefined) {
    // looking for a default value if no value specified
    if (model.default) {
      return model.default;
    }
    return undefined;
    // looking for restricted values
  } else if (model.values) {
      var validValue = model.values.find(function (value) {
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
      return prop.split(',').map(function (number) {
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
      return prop.split(/,|;/).map(function (value) {
        return value.trim();
      });

    case 'bibAuthorsArray':
      return (0, _bibTexConverter.parseBibAuthors)(prop);

    case 'objectArray':
      {
        if (model.children && Array.isArray(prop)) {
          var newProp = prop.map(function (obj) {
            if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object') {
              var newObj = model.children.reduce(function (thatObj, childModel) {
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
var resolveSettings = exports.resolveSettings = function resolveSettings() {
  var settings = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  var bibType = arguments[1];
  var settingsModel = arguments[2];

  var typeModel = {};
  for (var param in settingsModel) {
    if (settingsModel[param].default[bibType]) {
      typeModel[param] = settingsModel[param].default[bibType];
    } else {
      typeModel[param] = settingsModel[param].default.default;
    }
  }
  return Object.assign(typeModel, settings);
};