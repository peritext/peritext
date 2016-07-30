import {map as asyncMap, mapSeries as asyncMapSeries, waterfall} from 'async';
const CsvConverter = require('csvtojson').Converter;
const csvConverter = new CsvConverter({});

export default function resolveDataDependencies(inputSections, assetsController, assetsParams, resolveData, callback) {
  let res;
  let match;
  const data = {};// this object stores resolved and unresolved promises about resources data
  const resRe = /@res([\d]+)?.(.*)/g;
  const assetsRe = /@assets\/([^']+)/g;
  asyncMap(inputSections, (section, allSectionsCallback)=> {
    waterfall([
      // styles resolution
      (stylesResolutionCallback)=> {
        if (section.customizers && section.customizers.styles) {
          const styles = [];
          for (const prop in section.customizers.styles) {
            if (section.customizers.styles[prop]) {
              styles.push({key: prop, value: section.customizers.styles[prop]});
            }
          }
          // map each style customizer
          asyncMap(styles, (styleCouple, singleStyleCallback)=> {
            let style = styleCouple.value;
            // get all expressions
            const matches = [];
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
              asyncMap(matches, (thisMatch, matchCallback)=> {
                assetsController.getAssetUri(thisMatch[1], assetsParams, (err4, uri)=> {
                  style = style.substr(0, thisMatch.index) + uri + style.substr(thisMatch.index + thisMatch[0].length);
                  matchCallback(err4, thisMatch);
                });
              }, (matchErrors, theseMatches)=> {
                styleCouple.value = style;
                singleStyleCallback(matchErrors, styleCouple);
              });
            // no interpolations to do
            } else {
              styleCouple.value = style;
              singleStyleCallback(null, styleCouple);
            }
          }, (stylesErrors, styleCouples)=> {
            styleCouples.forEach((styleCouple) =>{
              section.customizers.styles[styleCouple.key] = styleCouple.value;
            });
            stylesResolutionCallback(stylesErrors, section);
          });
        } else stylesResolutionCallback(null, section);
      },
      // resolve metadata
      (sectio, metadataCallback)=> {
        asyncMap(sectio.metadata, (metadata, singleMetadataCallback)=> {
          if (typeof metadata.value === 'string' && metadata.value.indexOf('@assets/') === 0) {
            assetsController.getAssetUri(metadata.value.split('@assets/')[1], assetsParams, (err4, uri)=> {
              metadata.value = uri;
              singleMetadataCallback(err4, metadata);
            });
          } else {
            singleMetadataCallback(null, metadata);
          }
        }, (metadataErrors, newMetadata)=>{
          sectio.metadata = newMetadata;
          metadataCallback(metadataErrors, sectio);
        });
      },
      // resolve resources
      (sectio, resourcesCallback)=> {
        asyncMap(sectio.resources, (resource, singleResourceCallback)=> {
          const props = [];
          // format props as array for performing an async map
          for (const prop in resource) {
            if (resource[prop]) {
              props.push({key: prop, value: resource[prop]});
            }
          }
          asyncMap(props, (prop, resourcePropCallback)=> {
            if (typeof prop.value === 'string' && prop.value.indexOf('@assets/') === 0) {
              assetsController.getAssetUri(prop.value.split('@assets/')[1], assetsParams, (err4, uri)=> {
                prop.value = uri;
                resourcePropCallback(err4, prop);
              });
            } else {
              resourcePropCallback(null, prop);
            }
          }, (singleResourceError, newProps)=> {
            const newResource = newProps.reduce((obj, prop) =>{
              obj[prop.key] = prop.value;
              return obj;
            }, {});
            singleResourceCallback(singleResourceError, newResource);
          });
        }, (resourcesErrors, resources)=> {
          sectio.resources = resources;
          resourcesCallback(resourcesErrors, sectio);
        });
      },
      (sectio, contextualizationsCallback)=> {
        asyncMap(sectio.contextualizations, (contextualization, contextualizationCallback)=> {
          res = undefined;
          const props = [];
          // format props as array for performing an async map
          for (const prop in contextualization.contextualizer) {
            if (contextualization.contextualizer[prop]) {
              props.push({key: prop, value: contextualization.contextualizer[prop]});
            }
          }
          /**
           * First level props
           */
          // resolve async. props
          asyncMap(props, (prop, contextualizationPropCallback)=> {
            const val = prop.value;
            // if prop is itself an array, need for another nested async resolution
            if (Array.isArray(val) && prop.key !== 'resources') {
              // loop through propArray members
              asyncMap(val, (prop2, propArrayMembersCallback)=> {
                // prepare for asyncMap for propArray member
                const nestedProps = [];
                for (const nestedProp in prop2) {
                  if (prop2[nestedProp]) {
                    nestedProps.push({key: nestedProp, value: prop2[nestedProp]});
                  }
                }
                // Second level props (contextualization.arrayProp[array member].prop)
                asyncMap(nestedProps, (nestedProp, nestedPropCallback)=> {
                  // resolve nested props here
                  const val3 = nestedProp.value;
                  if (('' + val3).indexOf('@res') === 0) {
                    while ((match = resRe.exec(val3)) !== null) {
                      // Identify which resource is targetted (handling multi-resource contextualizations)
                      const rank = match[1] ? (+match[1] - 1) : 0;
                      // find resource data
                      res = contextualization.resources[rank];
                      if (res === undefined) {
                        console.log('res is undefined, expression: ', val3);
                        return nestedPropCallback(undefined, nestedProp);
                      }
                      // case: metadata call
                      const resProp = match[match.length - 1];
                      if (resProp.indexOf('data') !== 0) {
                        // interpolate w/ resource value thanks to resourceProp path
                        nestedProp.value = res[resProp];
                        // contextualizationPropCallback(null, prop);
                      // case : data call
                      } else {
                        const dataPath = ('' + val3).split('.').filter(path=>{
                          return path.length;
                        });
                        nestedProp.value = {
                          type: 'path',
                          target: 'data',
                          path: dataPath
                        };
                        const defined = data[res.citeKey];
                        if (!defined) {
                          const accessor = res.data || res.url;
                          if (('' + accessor).indexOf('@assets/') === 0) {
                            const toResolve = {};
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
                    assetsController.getAssetUri(val3.split('@assets/')[1], assetsParams, (err4, uri)=> {
                      nestedProp.value = uri;
                      nestedPropCallback(err4, nestedProp);
                    });
                  } else {
                    nestedPropCallback(null, nestedProp);
                  }
                }, (err3, propsOut2)=> {
                  const newProp2 = propsOut2.reduce((newCont, newContProp) =>{
                    newCont[newContProp.key] = newContProp.value;
                    return newCont;
                  }, {});
                  propArrayMembersCallback(err3, newProp2);
                });
              // resolve arrayed prop
              }, (err2, arrayMembers)=> {
                prop.value = arrayMembers;
                contextualizationPropCallback(null, prop);
              });
            } else if (typeof val !== undefined && prop.key !== 'resources') {
              if (('' + val).indexOf('@res') === 0) {
                while ((match = resRe.exec(val)) !== null) {
                  // Identify which resource is targetted (handling multi-resource contextualizations)
                  const rank = match[1] ? (+match[1] - 1) : 0;
                  // find resource data
                  res = contextualization.resources[rank];
                  if (res === undefined) {
                    console.log('res is undefined, expression: ', val);
                    return contextualizationPropCallback(undefined, prop);
                  }
                  const resProp = match[match.length - 1];
                  // case: metadata call
                  if (resProp.indexOf('data') !== 0) {
                    // interpolate w/ resource value thanks to resourceProp path
                    prop.value = res[resProp];
                    // contextualizationPropCallback(null, prop);
                  // case : data call
                  } else {
                    const dataPath = ('' + val).split('.').filter(path=>{
                      return path.length;
                    });
                    prop.value = {
                      type: 'path',
                      target: 'data',
                      path: dataPath
                    };
                    const defined = data[res.citeKey];
                    if (!defined) {
                      const accessor = res.data || res.url;
                      if (('' + accessor).indexOf('@assets/') === 0) {
                        const toResolve = {};
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
                assetsController.getAssetUri(val.split('@assets/')[1], assetsParams, (err3, uri)=> {
                  prop.value = uri;
                  contextualizationPropCallback(err3, prop);
                });
              } else {
                contextualizationPropCallback(null, prop);
              }
            } else {
              contextualizationPropCallback(null, prop);
            }
          }, (err1, propsOut1)=> {
            const newContextualizer = propsOut1.reduce((newCont, propOut) =>{
              newCont[propOut.key] = propOut.value;
              return newCont;
            }, {});

            // console.log('new contextualization', Object.assign(contextualization, newContextualizer));
            // pass contextualizer's resolved values to contextualization object
            newContextualizer.contextualizerType = newContextualizer.type;
            delete newContextualizer.type;// contextualization has a type also
            const newContextualization = Object.assign(contextualization, newContextualizer);
            contextualizationCallback(err1, newContextualization);
          });
        }, (contextualizationsError, contextualizations)=> {
          sectio.contextualizations = contextualizations;
          contextualizationsCallback(contextualizationsError, sectio);
        });
      }
    // waterfall callback for all sections
    ], (errs, sectios)=> {
      allSectionsCallback(errs, sectios);
    });
  // global & final callback
  }, (err, sections)=> {
    if (resolveDataDependencies) {
      asyncMapSeries(Object.keys(data), (key, dataCallback) =>{
        const toResolve = data[key];
        toResolve.read(toResolve.params, (dataErr, dataResult) =>{
          if (dataErr) {
            data[key] = dataErr;
            dataCallback(null, key);
          } else {
            const raw = dataResult && dataResult.stringContents;
            const ext = dataResult.extname;
            // todo : handle other file formats
            if (raw && ext === '.csv') {
              csvConverter.fromString(raw, (parseErr, json)=>{
                data[key] = {
                  format: 'json',
                  data: json
                };
                dataCallback(parseErr, key);
              });
            }else {
              console.log('unhandled file format ', ext);
              dataCallback(null, key);
            }
          }
        });
      }, (finalErr, keys) =>{
        const finalSections = sections.map(sectio =>{
          return Object.assign(sectio, {data: data});
        });
        callback(finalErr, finalSections);
      });
    } else {
      const finalSections = sections.map(sectio =>{
        return Object.assign(sectio, {data});
      });
      callback(err, finalSections);
    }
  });
}
