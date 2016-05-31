import {map as asyncMap, waterfall} from 'async';

export default function resolveDataDependencies(inputSections, assetsController, assetsParams, callback) {
  let res;
  let match;
  const resRe = /@res([\d]+)?.(.*)/g;
  const assetsRe = /@assets\/([^']+)/g;
  asyncMap(inputSections, function(section, allSectionsCallback) {
    waterfall([
      // styles resolution
      function(stylesResolutionCallback) {
        let match;
        if (section.customizers && section.customizers.styles) {
          const styles = [];
          for (const prop in section.customizers.styles) {
            if (section.customizers.styles[prop]) {
              styles.push({key: prop, value: section.customizers.styles[prop]});
            }
          }
          // map each style customizer
          asyncMap(styles, function(styleCouple, singleStyleCallback) {
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
              asyncMap(matches, function(thisMatch, matchCallback){
                assetsController.getAssetUri(thisMatch[1], assetsParams, function(err4, uri) {
                  style = style.substr(0, thisMatch.index) + uri + style.substr(thisMatch.index + thisMatch[0].length);
                  matchCallback(err4, thisMatch);
                });
              }, function(matchErrors, matches) {
                styleCouple.value = style;
                singleStyleCallback(matchErrors, styleCouple);
              });
            // no interpolations to do
            } else {
              styleCouple.value = style;
              singleStyleCallback(null, styleCouple);
            }
          }, function(stylesErrors, styleCouples) {
            styleCouples.forEach((styleCouple) =>{
              section.customizers.styles[styleCouple.key] = styleCouple.value;
            });
            stylesResolutionCallback(stylesErrors, section);
          });
        } else stylesResolutionCallback(null, section);
      },
      // resolve resources
      function(sectio, resourcesCallback) {
        asyncMap(sectio.resources, function(resource, singleResourceCallback) {
          const props = [];
          // format props as array for performing an async map
          for (const prop in resource) {
            if (resource[prop]) {
              props.push({key: prop, value: resource[prop]});
            }
          }
          asyncMap(props, function(prop, resourcePropCallback) {
            if (typeof prop.value === 'string' && prop.value.indexOf('@assets/') === 0) {
              assetsController.getAssetUri(prop.value.split('@assets/')[1], assetsParams, function(err4, uri) {
                prop.value = uri;
                resourcePropCallback(err4, prop);
              });
            } else {
              resourcePropCallback(null, prop);
            }
          }, function(singleResourceError, newProps) {
            const newResource = newProps.reduce((obj, prop) =>{
              obj[prop.key] = prop.value;
              return obj;
            }, {});
            singleResourceCallback(singleResourceError, newResource);
          });
        }, function(resourcesErrors, resources) {
          sectio.resources = resources;
          resourcesCallback(resourcesErrors, sectio);
        });
      },
      function(sectio, contextualizationsCallback) {
        asyncMap(sectio.contextualizations, function(contextualization, contextualizationCallback) {
          res = undefined;
          const props = [];
          // format props as array for performing an async map
          for (const prop in contextualization) {
            if (contextualization[prop]) {
              props.push({key: prop, value: contextualization[prop]});
            }
          }
          /*
           * First level props
           */
          // resolve async. props
          asyncMap(props, function(prop, contextualizationPropCallback) {
            const val = prop.value;
            // if prop is itself an array, need for another nested async resolution
            if (Array.isArray(val) && prop.key !== 'resources') {
              // loop through propArray members
              asyncMap(val, function(prop2, propArrayMembersCallback) {
                // prepare for asyncMap for propArray member
                const nestedProps = [];
                for (const nestedProp in prop2) {
                  if (prop2[nestedProp]) {
                    nestedProps.push({key: nestedProp, value: prop2[nestedProp]});
                  }
                }
                // Second level props (contextualization.arrayProp[array member].prop)
                asyncMap(nestedProps, function(nestedProp, nestedPropCallback) {
                  // resolve nested props here
                  const val3 = nestedProp.value;
                  if (('' + val3).indexOf('@res') === 0) {
                    while ((match = resRe.exec(val3)) !== null) {
                      // Identify which resource is targetted (handling multi-resource contextualizations)
                      const rank = match[1] ? (+match[1] - 1) : 0;
                      // find resource key
                      res = contextualization.resources[rank];
                      // find resource data
                      res = sectio.resources.find((oRes) =>{
                        return oRes.citeKey === res;
                      });
                      const resProp = match[match.length - 1];
                      if (resProp.indexOf('data') !== 0) {
                        // interpolate w/ resource value thanks to resourceProp path
                        nestedProp.value = res[resProp];
                      } // todo here : ajax data fetching if 'data' prop
                    }
                    nestedPropCallback(null, nestedProp);
                  } else if (('' + val3).indexOf('@assets/') === 0) {
                    assetsController.getAssetUri(val3.split('@assets/')[1], assetsParams, function(err4, uri) {
                      nestedProp.value = uri;
                      nestedPropCallback(err4, nestedProp);
                    });
                  } else {
                    nestedPropCallback(null, nestedProp);
                  }
                }, function(err3, propsOut2) {
                  const newProp2 = propsOut2.reduce((newCont, newContProp) =>{
                    newCont[newContProp.key] = newContProp.value;
                    return newCont;
                  }, {});
                  propArrayMembersCallback(err3, newProp2);
                });
              // resolve arrayed prop
              }, function(err2, arrayMembers) {
                prop.value = arrayMembers;
                contextualizationPropCallback(null, prop);
              });
            } else if (typeof val !== undefined && prop.key !== 'resources') {
              if (('' + val).indexOf('@res') === 0) {
                while ((match = resRe.exec(val)) !== null) {
                  // Identify which resource is targetted (handling multi-resource contextualizations)
                  const rank = match[1] ? (+match[1] - 1) : 0;
                  // find resource key
                  res = contextualization.resources[rank];
                  // find resource data
                  res = sectio.resources.find((oRes) =>{
                    return oRes.citeKey === res;
                  });
                  const resProp = match[match.length - 1];
                  if (resProp.indexOf('data') !== 0) {
                    // interpolate w/ resource value thanks to resourceProp path
                    prop.value = res[resProp];
                  } // todo here : ajax data fetching if 'data' prop
                }
                contextualizationPropCallback(null, prop);
              } else if (('' + val).indexOf('@assets/') === 0) {
                assetsController.getAssetsUri(val.split('@assets/')[1], assetsParams, function(err3, uri) {
                  prop.value = uri;
                  contextualizationPropCallback(err3, prop);
                });
              } else {
                contextualizationPropCallback(null, prop);
              }
            } else {
              contextualizationPropCallback(null, prop);
            }
          }, function(err1, propsOut1) {
            const newContextualization = propsOut1.reduce((newCont, propOut) =>{
              newCont[propOut.key] = propOut.value;
              return newCont;
            }, {});
            contextualizationCallback(err1, newContextualization);
          });
        }, function(contextualizationsError, contextualizations) {
          sectio.contextualizations = contextualizations;
          contextualizationsCallback(contextualizationsError, sectio);
        });
      }
    // waterfall callback - all sections
    ], function(errs, sectios) {
      allSectionsCallback(errs, sectios);
    });
  // step callback
  }, function(err, sections) {
    callback(err, sections);
  });
}
