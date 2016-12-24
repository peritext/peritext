/**
 * Resolver dedicated to resolve @assets statements and @res statements
 * @module resolvers/resolveDataDependencies
 */
import {map as asyncMap, mapSeries as asyncMapSeries, waterfall} from 'async';
import {csvParse} from 'd3-dsv';

/**
 * Resolves interpolations in metadata, resources, and contextualizations,
 * and possibly fetches & stores necessary data for rendering
 * @param {Object} document - the document to resolve
 * @param {Object} assetsController - the assets controller module to use to communicate with assets
 * @param {Object} assetsParams - the params to use for accessing the assets
 * @param {boolean} resolveData - whether to fetch and store necessary data right away or to store methods for later lazy-loading
 * @param {function(err: error, finalSections: array)} callback - callbacks a possible errors and the updated list of sections
 */
export default function resolveDataDependencies(
  inputDocument,
  assetsController,
  assetsParams,
  resolveData,
  callback) {

  const document = Object.assign({}, inputDocument);
  let res;
  let match;
  const data = {};// this object stores resolved and unresolved promises about resources data
  const resRe = /@res([\d]+)?.(.*)/g;
  const assetsRe = /@assets\/([^']+)/g;
  const inputSections = Object.keys(document.sections).map(key => document.sections[key]);

  asyncMap(inputSections, (section, allSectionsCallback)=> {
    waterfall([
      // styles resolution
      (stylesResolutionCallback)=> {
        console.log('resolving', section.metadata.general.title.value);
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
        const domains = Object.keys(section.metadata);
        asyncMap(domains, (domain, domainCallback)=> {
          const props = Object.keys(sectio.metadata[domain]);
          asyncMap(props, (propKey, propCallback)=> {
            const prop = sectio.metadata[domain][propKey];
            const propObject = {
              key: propKey,
              data: prop
            };
            // interpolate @assets statements with their value
            if (typeof prop.value === 'string' && prop.value.indexOf('@assets/') === 0) {
              assetsController.getAssetUri(prop.value.split('@assets/')[1], assetsParams, (err4, uri)=> {
                prop.value = uri;
                propObject.data = prop;
                propCallback(err4, propObject);
              });
            } else {
              propCallback(null, propObject);
            }
          }, (propsError, propObjects) => {
            const domainObject = {
              key: domain,
              data: {}
            };
            // update domainObject with updated objects
            propObjects.forEach(propObject => {
              domainObject.data[propObject.key] = propObject.data;
            });
            domainCallback(propsError, domainObject);
          });
        }, (domainErrors, domainObjects) => {
          domainObjects.forEach((domainObject) => {
            sectio.metadata[domainObject.key] = domainObject.data;
          });
          metadataCallback(domainErrors, sectio);
        });
      }
    // waterfall callback for each section
    ], (errs, sectio)=> {
      // fill document section keys with updated sections
      document.sections[sectio.metadata.general.id.value] = Object.assign({}, sectio);
      allSectionsCallback(errs);
    });
  // sections final callback
  }, (err)=> {
    // document wide resolutions
    const resources = Object.keys(document.resources).map(key => document.resources[key]);
    const contextualizations = Object.keys(document.contextualizations).map(key => document.contextualizations[key]);

    waterfall([
      (contextualizationsCallback) => {
        asyncMap(contextualizations, (contextualization, contextualizationCallback)=> {
          res = undefined;
          const props = [];
          // format props as array for performing an async map
          const contextualizer = document.contextualizers[contextualization.contextualizer];

          for (const prop in contextualizer) {
            if (contextualizer[prop]) {
              props.push({key: prop, value: contextualizer[prop]});
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
                      res = document.resources[contextualization.resources[rank]];
                      if (res === undefined) {
                        console.log('res is undefined, expression: ', val3);
                        return nestedPropCallback(undefined, nestedProp);
                      }
                      // case: metadata call
                      const resProp = match[match.length - 1];
                      if (resProp.indexOf('data') !== 0) {
                        // interpolate w/ resource value thanks to resourceProp path
                        nestedProp.value = res[resProp];
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
                        const defined = data[res.id];
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
                            data[res.id] = toResolve;
                          } else {
                            console.log('unhandled data accessor (1) : ', accessor);
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
                  res = document.resources[contextualization.resources[rank]];
                  if (res === undefined) {
                    console.log('res is undefined, expression: ', val);
                    return contextualizationPropCallback(undefined, prop);
                  }
                  const resProp = match[match.length - 1];
                  // case: metadata call
                  if (resProp.indexOf('data') !== 0) {
                    // interpolate w/ resource value thanks to resourceProp path
                    prop.value = res[resProp];
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
                    const defined = data[res.id];
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
                        data[res.id] = toResolve;
                      } else {
                        console.log('unhandled data accessor (2) : ', accessor);
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

            // pass contextualizer's resolved values to contextualization object
            newContextualizer.contextualizerType = newContextualizer.type;
            delete newContextualizer.type;// contextualization has a type also
            delete newContextualizer.id;
            const newContextualization = Object.assign(contextualization, newContextualizer);
            contextualizationCallback(err1, newContextualization);
          });
        }, (contextualizationsError, finalContextualizations)=> {
          finalContextualizations.forEach(contextualization => {
            document.contextualizations[contextualization.id] = contextualization;
          });
          contextualizationsCallback(contextualizationsError);
        });
      },
      (resourcesResolutionCallback)=>{
        // resources resolution
        asyncMap(resources, (resource, resourceCallback)=>{
          const resolvedResource = {
            key: resource.id,
            data: resource
          };
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
            resolvedResource.data = newResource;
            resourceCallback(singleResourceError, resolvedResource);
          });
        }, (resourceErrors, resolvedResources)=>{
          resolvedResources.forEach(resolvedResource => {
            document.resources[resolvedResource.key] = resolvedResource.data;
          });
          resourcesResolutionCallback(resourceErrors);
        });
      }
    // end of waterfall for document-wide resolutions
    ], (documentWideErrors)=>{
      if (resolveData) {
        asyncMapSeries(Object.keys(data), (key, dataCallback) =>{
          const toResolve = data[key];
          toResolve.read(toResolve.params, (dataErr, dataResult) =>{
            if (dataErr) {
              data[key] = dataErr;
              return dataCallback(null, key);
            }
            const raw = dataResult && dataResult.stringContents;
            const ext = dataResult.extname;
            // todo : handle other file formats
            if (raw && ext === '.csv') {
              const json = csvParse(raw);
              data[key] = {
                format: 'json',
                data: json
              };
              return dataCallback(null, key);
            }
            console.log('unhandled file format ', ext);
            return dataCallback(null, key);
          });
        }, (finalErr, keys) =>{
          document.data = data;
          return callback(finalErr, document);
        });
      } else {
        document.data = data;
        return callback(documentWideErrors, document);
      }
    });
  });
}
