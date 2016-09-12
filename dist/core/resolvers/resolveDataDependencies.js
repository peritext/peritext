'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; }; /**
                                                                                                                                                                                                                                                   * Resolver dedicated to resolve @assets statements and @res statements
                                                                                                                                                                                                                                                   * @module resolvers/resolveDataDependencies
                                                                                                                                                                                                                                                   */


exports.default = resolveDataDependencies;

var _async = require('async');

var CsvConverter = require('csvtojson').Converter;
var csvConverter = new CsvConverter({});

/**
 * Resolves interpolations in metadata, resources, and contextualizations,
 * and possibly fetches & stores necessary data for rendering
 * @param {Object} document - the document to resolve
 * @param {Object} assetsController - the assets controller module to use to communicate with assets
 * @param {Object} assetsParams - the params to use for accessing the assets
 * @param {boolean} resolveData - whether to fetch and store necessary data right away or to store methods for later lazy-loading
 * @param {function(err: error, finalSections: array)} callback - callbacks a possible errors and the updated list of sections
 */
function resolveDataDependencies(inputDocument, assetsController, assetsParams, resolveData, callback) {

  var document = Object.assign({}, inputDocument);
  var res = void 0;
  var match = void 0;
  var data = {}; // this object stores resolved and unresolved promises about resources data
  var resRe = /@res([\d]+)?.(.*)/g;
  var assetsRe = /@assets\/([^']+)/g;
  var inputSections = Object.keys(document.sections).map(function (key) {
    return document.sections[key];
  });

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
      var domains = Object.keys(section.metadata);
      (0, _async.map)(domains, function (domain, domainCallback) {
        var props = Object.keys(sectio.metadata[domain]);
        (0, _async.map)(props, function (propKey, propCallback) {
          var prop = sectio.metadata[domain][propKey];
          var propObject = {
            key: propKey,
            data: prop
          };
          if (typeof prop.value === 'string' && prop.value.indexOf('@assets/') === 0) {
            assetsController.getAssetUri(prop.value.split('@assets/')[1], assetsParams, function (err4, uri) {
              prop.value = uri;
              propObject.data = prop;
              propCallback(err4, propObject);
            });
          } else {
            propCallback(null, propObject);
          }
        }, function (propsError, propObjects) {
          var domainObject = {
            key: domain,
            data: {}
          };
          propObjects.forEach(function (propObject) {
            domainObject.data[propObject.key] = propObject.data;
          });
          domainCallback(propsError, domainObject);
        });
      }, function (domainErrors, domainObjects) {
        domainObjects.forEach(function (domainObject) {
          sectio.metadata[domainObject.key] = domainObject.data;
        });
        metadataCallback(domainErrors, sectio);
      });
    }
    // waterfall callback for all sections
    ], function (errs, sectio) {
      // fill document section keys with updated sections
      document.sections[sectio.metadata.general.citeKey.value] = sectio;
      allSectionsCallback(errs);
    });
    // sections final callback
  }, function (err) {
    // document wide resolutions
    var resources = Object.keys(document.resources).map(function (key) {
      return document.resources[key];
    });
    var contextualizations = Object.keys(document.contextualizations).map(function (key) {
      return document.contextualizations[key];
    });

    (0, _async.waterfall)([function (contextualizationsCallback) {
      (0, _async.map)(contextualizations, function (contextualization, contextualizationCallback) {
        res = undefined;
        var props = [];
        // format props as array for performing an async map
        var contextualizer = document.contextualizers[contextualization.contextualizer];

        for (var prop in contextualizer) {
          if (contextualizer[prop]) {
            props.push({ key: prop, value: contextualizer[prop] });
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
                    res = document.resources[contextualization.resources[rank]];
                    if (res === undefined) {
                      console.log('res is undefined, expression: ', val3);
                      return nestedPropCallback(undefined, nestedProp);
                    }
                    // case: metadata call
                    var resProp = match[match.length - 1];
                    if (resProp.indexOf('data') !== 0) {
                      // interpolate w/ resource value thanks to resourceProp path
                      nestedProp.value = res[resProp];
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
                            console.log('unhandled data accessor (1) : ', accessor);
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
                res = document.resources[contextualization.resources[rank]];
                if (res === undefined) {
                  console.log('res is undefined, expression: ', val);
                  return contextualizationPropCallback(undefined, prop);
                }
                var resProp = match[match.length - 1];
                // case: metadata call
                if (resProp.indexOf('data') !== 0) {
                  // interpolate w/ resource value thanks to resourceProp path
                  prop.value = res[resProp];
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
                        console.log('unhandled data accessor (2) : ', accessor);
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

          // pass contextualizer's resolved values to contextualization object
          newContextualizer.contextualizerType = newContextualizer.type;
          delete newContextualizer.type; // contextualization has a type also
          delete newContextualizer.citeKey;
          var newContextualization = Object.assign(contextualization, newContextualizer);
          contextualizationCallback(err1, newContextualization);
        });
      }, function (contextualizationsError, finalContextualizations) {
        finalContextualizations.forEach(function (contextualization) {
          document.contextualizations[contextualization.citeKey] = contextualization;
        });
        contextualizationsCallback(contextualizationsError);
      });
    }, function (resourcesResolutionCallback) {
      // resources resolution
      (0, _async.map)(resources, function (resource, resourceCallback) {
        var resolvedResource = {
          key: resource.citeKey,
          data: resource
        };
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
          resolvedResource.data = newResource;
          resourceCallback(singleResourceError, resolvedResource);
        });
      }, function (resourceErrors, resolvedResources) {
        resolvedResources.forEach(function (resolvedResource) {
          document.resources[resolvedResource.key] = resolvedResource.data;
        });
        resourcesResolutionCallback(resourceErrors);
      });
    }], function (documentWideErrors) {
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
          document.data = data;
          callback(finalErr, document);
        });
      } else {
        document.data = data;
        callback(documentWideErrors, document);
      }
    });
  });
}
module.exports = exports['default'];