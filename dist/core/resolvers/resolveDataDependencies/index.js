'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.default = resolveDataDependencies;

var _async = require('async');

var CsvConverter = require('csvtojson').Converter;
var csvConverter = new CsvConverter({});

function resolveDataDependencies(inputSections, assetsController, assetsParams, resolveData, callback) {
  var res = void 0;
  var match = void 0;
  var data = {}; // this object stores resolved and unresolved promises about resources data
  var resRe = /@res([\d]+)?.(.*)/g;
  var assetsRe = /@assets\/([^']+)/g;
  (0, _async.map)(inputSections, function (section, allSectionsCallback) {
    (0, _async.waterfall)([
    // styles resolution
    function (stylesResolutionCallback) {
      if (section.customizers && section.customizers.styles) {
        var styles = [];
        for (var prop in section.customizers.styles) {
          if (section.customizers.styles[prop]) {
            styles.push({ key: prop, value: section.customizers.styles[prop] });
          }
        }
        // map each style customizer
        (0, _async.map)(styles, function (styleCouple, singleStyleCallback) {
          var style = styleCouple.value;
          // get all expressions
          var matches = [];
          do {
            match = assetsRe.exec(style);
            if (match) {
              matches.push(match);
            }
          } while (match);
          // some assets interpolations to do
          if (matches.length) {
            // reverse array to begin with last matches and not mess around with indexes
            matches.reverse();
            (0, _async.map)(matches, function (thisMatch, matchCallback) {
              assetsController.getAssetUri(thisMatch[1], assetsParams, function (err4, uri) {
                style = style.substr(0, thisMatch.index) + uri + style.substr(thisMatch.index + thisMatch[0].length);
                matchCallback(err4, thisMatch);
              });
            }, function (matchErrors, theseMatches) {
              styleCouple.value = style;
              singleStyleCallback(matchErrors, styleCouple);
            });
            // no interpolations to do
          } else {
              styleCouple.value = style;
              singleStyleCallback(null, styleCouple);
            }
        }, function (stylesErrors, styleCouples) {
          styleCouples.forEach(function (styleCouple) {
            section.customizers.styles[styleCouple.key] = styleCouple.value;
          });
          stylesResolutionCallback(stylesErrors, section);
        });
      } else stylesResolutionCallback(null, section);
    },
    // resolve metadata
    function (sectio, metadataCallback) {
      (0, _async.map)(sectio.metadata, function (metadata, singleMetadataCallback) {
        if (typeof metadata.value === 'string' && metadata.value.indexOf('@assets/') === 0) {
          assetsController.getAssetUri(metadata.value.split('@assets/')[1], assetsParams, function (err4, uri) {
            metadata.value = uri;
            singleMetadataCallback(err4, metadata);
          });
        } else {
          singleMetadataCallback(null, metadata);
        }
      }, function (metadataErrors, newMetadata) {
        sectio.metadata = newMetadata;
        metadataCallback(metadataErrors, sectio);
      });
    },
    // resolve resources
    function (sectio, resourcesCallback) {
      (0, _async.map)(sectio.resources, function (resource, singleResourceCallback) {
        var props = [];
        // format props as array for performing an async map
        for (var prop in resource) {
          if (resource[prop]) {
            props.push({ key: prop, value: resource[prop] });
          }
        }
        (0, _async.map)(props, function (prop, resourcePropCallback) {
          if (typeof prop.value === 'string' && prop.value.indexOf('@assets/') === 0) {
            assetsController.getAssetUri(prop.value.split('@assets/')[1], assetsParams, function (err4, uri) {
              prop.value = uri;
              resourcePropCallback(err4, prop);
            });
          } else {
            resourcePropCallback(null, prop);
          }
        }, function (singleResourceError, newProps) {
          var newResource = newProps.reduce(function (obj, prop) {
            obj[prop.key] = prop.value;
            return obj;
          }, {});
          singleResourceCallback(singleResourceError, newResource);
        });
      }, function (resourcesErrors, resources) {
        sectio.resources = resources;
        resourcesCallback(resourcesErrors, sectio);
      });
    }, function (sectio, contextualizationsCallback) {
      (0, _async.map)(sectio.contextualizations, function (contextualization, contextualizationCallback) {
        res = undefined;
        var props = [];
        // format props as array for performing an async map
        for (var prop in contextualization.contextualizer) {
          if (contextualization.contextualizer[prop]) {
            props.push({ key: prop, value: contextualization.contextualizer[prop] });
          }
        }
        /**
         * First level props
         */
        // resolve async. props
        (0, _async.map)(props, function (prop, contextualizationPropCallback) {
          var val = prop.value;
          // if prop is itself an array, need for another nested async resolution
          if (Array.isArray(val) && prop.key !== 'resources') {
            // loop through propArray members
            (0, _async.map)(val, function (prop2, propArrayMembersCallback) {
              // prepare for asyncMap for propArray member
              var nestedProps = [];
              for (var nestedProp in prop2) {
                if (prop2[nestedProp]) {
                  nestedProps.push({ key: nestedProp, value: prop2[nestedProp] });
                }
              }
              // Second level props (contextualization.arrayProp[array member].prop)
              (0, _async.map)(nestedProps, function (nestedProp, nestedPropCallback) {
                // resolve nested props here
                var val3 = nestedProp.value;
                if (('' + val3).indexOf('@res') === 0) {
                  while ((match = resRe.exec(val3)) !== null) {
                    // Identify which resource is targetted (handling multi-resource contextualizations)
                    var rank = match[1] ? +match[1] - 1 : 0;
                    // find resource data
                    res = contextualization.resources[rank];
                    if (res === undefined) {
                      console.log('res is undefined, expression: ', val3);
                      return nestedPropCallback(undefined, nestedProp);
                    }
                    // case: metadata call
                    var resProp = match[match.length - 1];
                    if (resProp.indexOf('data') !== 0) {
                      // interpolate w/ resource value thanks to resourceProp path
                      nestedProp.value = res[resProp];
                      // contextualizationPropCallback(null, prop);
                      // case : data call
                    } else {
                        var dataPath = ('' + val3).split('.').filter(function (path) {
                          return path.length;
                        });
                        nestedProp.value = {
                          type: 'path',
                          target: 'data',
                          path: dataPath
                        };
                        var defined = data[res.citeKey];
                        if (!defined) {
                          var accessor = res.data || res.url;
                          if (('' + accessor).indexOf('@assets/') === 0) {
                            var toResolve = {};
                            toResolve.params = {
                              path: accessor.split('@assets/')[1],
                              params: assetsParams,
                              acceptedExtensions: '*'
                            };
                            toResolve.read = assetsController.getReader(assetsParams);
                            data[res.citeKey] = toResolve;
                          } else {
                            console.log('unhandled data accessor : ', accessor);
                          }
                        }
                      }
                  }
                  nestedPropCallback(null, nestedProp);
                } else if (('' + val3).indexOf('@assets/') === 0) {
                  assetsController.getAssetUri(val3.split('@assets/')[1], assetsParams, function (err4, uri) {
                    nestedProp.value = uri;
                    nestedPropCallback(err4, nestedProp);
                  });
                } else {
                  nestedPropCallback(null, nestedProp);
                }
              }, function (err3, propsOut2) {
                var newProp2 = propsOut2.reduce(function (newCont, newContProp) {
                  newCont[newContProp.key] = newContProp.value;
                  return newCont;
                }, {});
                propArrayMembersCallback(err3, newProp2);
              });
              // resolve arrayed prop
            }, function (err2, arrayMembers) {
              prop.value = arrayMembers;
              contextualizationPropCallback(null, prop);
            });
          } else if ((typeof val === 'undefined' ? 'undefined' : _typeof(val)) !== undefined && prop.key !== 'resources') {
            if (('' + val).indexOf('@res') === 0) {
              while ((match = resRe.exec(val)) !== null) {
                // Identify which resource is targetted (handling multi-resource contextualizations)
                var rank = match[1] ? +match[1] - 1 : 0;
                // find resource data
                res = contextualization.resources[rank];
                if (res === undefined) {
                  console.log('res is undefined, expression: ', val);
                  return contextualizationPropCallback(undefined, prop);
                }
                var resProp = match[match.length - 1];
                // case: metadata call
                if (resProp.indexOf('data') !== 0) {
                  // interpolate w/ resource value thanks to resourceProp path
                  prop.value = res[resProp];
                  // contextualizationPropCallback(null, prop);
                  // case : data call
                } else {
                    var dataPath = ('' + val).split('.').filter(function (path) {
                      return path.length;
                    });
                    prop.value = {
                      type: 'path',
                      target: 'data',
                      path: dataPath
                    };
                    var defined = data[res.citeKey];
                    if (!defined) {
                      var accessor = res.data || res.url;
                      if (('' + accessor).indexOf('@assets/') === 0) {
                        var toResolve = {};
                        toResolve.params = {
                          path: accessor.split('@assets/')[1],
                          params: assetsParams,
                          acceptedExtensions: '*'
                        };
                        toResolve.read = assetsController.getReader(assetsParams);
                        data[res.citeKey] = toResolve;
                      } else {
                        console.log('unhandled data accessor : ', accessor);
                      }
                    }
                  }
              }
              contextualizationPropCallback(null, prop);
            } else if (('' + val).indexOf('@assets/') === 0) {
              assetsController.getAssetUri(val.split('@assets/')[1], assetsParams, function (err3, uri) {
                prop.value = uri;
                contextualizationPropCallback(err3, prop);
              });
            } else {
              contextualizationPropCallback(null, prop);
            }
          } else {
            contextualizationPropCallback(null, prop);
          }
        }, function (err1, propsOut1) {
          var newContextualizer = propsOut1.reduce(function (newCont, propOut) {
            newCont[propOut.key] = propOut.value;
            return newCont;
          }, {});

          // console.log('new contextualization', Object.assign(contextualization, newContextualizer));
          // pass contextualizer's resolved values to contextualization object
          newContextualizer.contextualizerType = newContextualizer.type;
          delete newContextualizer.type; // contextualization has a type also
          var newContextualization = Object.assign(contextualization, newContextualizer);
          contextualizationCallback(err1, newContextualization);
        });
      }, function (contextualizationsError, contextualizations) {
        sectio.contextualizations = contextualizations;
        contextualizationsCallback(contextualizationsError, sectio);
      });
    }
    // waterfall callback for all sections
    ], function (errs, sectios) {
      allSectionsCallback(errs, sectios);
    });
    // global & final callback
  }, function (err, sections) {
    if (resolveDataDependencies) {
      (0, _async.mapSeries)(Object.keys(data), function (key, dataCallback) {
        var toResolve = data[key];
        toResolve.read(toResolve.params, function (dataErr, dataResult) {
          if (dataErr) {
            data[key] = dataErr;
            dataCallback(null, key);
          } else {
            var raw = dataResult && dataResult.stringContents;
            var ext = dataResult.extname;
            // todo : handle other file formats
            if (raw && ext === '.csv') {
              csvConverter.fromString(raw, function (parseErr, json) {
                data[key] = {
                  format: 'json',
                  data: json
                };
                dataCallback(parseErr, key);
              });
            } else {
              console.log('unhandled file format ', ext);
              dataCallback(null, key);
            }
          }
        });
      }, function (finalErr, keys) {
        var finalSections = sections.map(function (sectio) {
          return Object.assign(sectio, { data: data });
        });
        callback(finalErr, finalSections);
      });
    } else {
      var finalSections = sections.map(function (sectio) {
        return Object.assign(sectio, { data: data });
      });
      callback(err, finalSections);
    }
  });
}
module.exports = exports['default'];