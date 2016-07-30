'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resolveSettings = exports.resolvePropAgainstType = exports.serializePropAgainstType = exports.getContextualizerModel = exports.getResourceModel = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; }; /**
                                                                                                                                                                                                                                                   * Dedicated to everything that deals with models (composing, translating values, ...)
                                                                                                                                                                                                                                                   */

var _bibTexConverter = require('./../../converters/bibTexConverter');

// I build a model object from a specific bibType, composing it according to its inheritance dependencies, from more general models to the specific bibType
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

// I build a model object from a specific bibType, composing it according to its inheritance dependencies, from more general models to the specific bibType
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

// I turn a (possibly not primitive : array, object, bibAuthor) value to a string-friendly value, thanks to its model's type
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

// I turn a string value into another (possibly complex) value, thanks to its model's type
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

var resolveSettings = exports.resolveSettings = function resolveSettings(settings, bibType, settingsModel) {
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