/**
 * Resolver dedicated to resolve  contextualization statements
 * @module resolvers/resolveContextualizations
 */

import {getResourceModel, getContextualizerModel, resolvePropAgainstType} from '../utils/modelUtils';
import * as contextualizerLibs from '../../contextualizers';
/**
 * Transforms 1, 2, 3 ordinally used number into a, b, c ordinally used letters
 * @param {number} num - the number to transform
 * @return {string} letter - the output letter
 */
export const numbersToLetters = (num) =>{
  const mod = num % 26;
  let pow = num / 26 | 0;
  const out = mod ? String.fromCharCode(64 + mod) : (--pow, 'Z');
  return pow ? numbersToLetters(pow) + out : out.toLowerCase();
};

/**
 * Resolves a contextualizer object against its model and context, and records errors
 * @param {object} contextualizer - the contextualizer to resolve
 * @param {object} contextualization - the contextualization to use as a clue-giver if the contextualizer is implicit
 * @param {object} section - the section to which the contextualizer belongs
 * @param {object} models - the models to parse the contextualizer against
 * @return {{err: error, contextualizer: Object}} result - parsing errors and final contextualizer
 */
const resolveContextualizer = (contextualizer, contextualization, contextualizers, resources, models) =>{
  const err = [];
  let newContextualizer = Object.assign({}, contextualizer);
  // if overloading, first fetch the existing contextualizer
  if (newContextualizer.overloading) {
    const overload = newContextualizer.overloading.replace(/^@/, '');
    // find original
    const original = contextualizers[overload];
    // resolve original first
    if (original) {
      const originalFormatted = resolveContextualizer(original, contextualization, contextualizers, resources, models).finalContextualizer;
      // overload inherited params with new ones
      newContextualizer = Object.assign(originalFormatted, newContextualizer);
    } else {
      // no original found ==> overloading reference error
      err.push({
        type: 'error',
        preciseType: 'invalidContextualizer',
        message: 'overloading reference error: contextualizer ' + newContextualizer.citeKey + ' should overload ' + overload + ' but the original contextualizer does not exist'
      });
    }
  }
  // guess contextualizer type if needed
  if (!newContextualizer.type) {
    if (contextualization.resources.length > 0) {
      const sourceKey = contextualization.resources[0];
      const source = resources[sourceKey];
      if (source === undefined) {
        err.push({
          type: 'error',
          preciseType: 'invalidContextualizer',
          message: 'contextualizer ' + newContextualizer.citeKey + ' (' + newContextualizer.type + ') does not provide a valid resource'
        });
        return {err, undefined};
      }

      const sourceModel = getResourceModel(source.bibType, models.resourceModels);
      newContextualizer.type = sourceModel.defaultContextualizer;
    }
  }
  // resolve contextualizer object against its model
  const contextualizerModel = getContextualizerModel(newContextualizer.type, models.contextualizerModels);
  const finalContextualizer = contextualizerModel.properties.reduce((obj, thatModel) =>{
    obj[thatModel.key] = resolvePropAgainstType(newContextualizer[thatModel.key], thatModel.valueType, thatModel);
    // record error if required field is undefined
    if (obj[thatModel.key] === undefined && thatModel.required === true) {
      err.push({
        type: 'error',
        preciseType: 'invalidContextualizer',
        message: 'contextualizer ' + newContextualizer.citeKey + ' (' + newContextualizer.type + ') does not provide required type ' + thatModel.key
      });
    }
    return obj;
  }, {});
  return {err, finalContextualizer};
};

/**
 * Resolves contextualizations' contextualizer and resource, verifying that contextualization will be possible
 * @param {object} contextualizer - the contextualizer to resolve
 * @param {object} section - the section to resolve
 * @param {object} models - the models to use to validate data
 * @return {errors: array, newSection: Object} callback - returns updated section and possible errors as an array
 */
export const resolveBindings = ({document, models}) =>{
  let errors = [];
  // find implicit contextualizers types
  for (const citeKey in document.contextualizations) {
    if (document.contextualizations[citeKey]) {
      const contextualization = document.contextualizations[citeKey];
      // resolve contextualizer (in case of overloading)
      const {err, finalContextualizer} = resolveContextualizer(document.contextualizers[contextualization.contextualizer], contextualization, document.contextualizers, document.resources, models);
      if (err.length) {
        errors = errors.concat(err);
      } else {
        contextualization.contextualizer = finalContextualizer.citeKey;
        document.contextualizers[finalContextualizer.citeKey] = finalContextualizer;
      }
      // verify that contextualization has an existing contextualizer
      if (document.contextualizers[contextualization.contextualizer] === undefined) {
        errors.push({
          type: 'error',
          preciseType: 'invalidContextualization',
          message: 'contextualizer was not found for contextualization ' + contextualization.citeKey
        });
        delete document.contextualizations[contextualization.citeKey];
      // verify that contextualization uses valid resources (they exist and their type is compatible with contextualizer)
      } else {
        let toKeep = true;
        const contextualizer = document.contextualizers[contextualization.contextualizer];
        const acceptedResourceTypes = getContextualizerModel(contextualizer.type, models.contextualizerModels).acceptedResourceTypes;
        contextualization.resources.some(resKey =>{
          const res = document.resources[resKey];
          // resource exists, check if it is accepted for the contextualizerType
          if (res !== undefined) {
            let accepted = false;
            acceptedResourceTypes.some(type => {
              if (type === '*' || type === res.bibType) {
                accepted = true;
                return true;
              }
            });
            if (!accepted) {
              toKeep = false;
              errors.push({
                type: 'error',
                preciseType: 'invalidContextualization',
                message: 'resource ' + resKey + ' was asked in a contextualization but is not handled by the contextualizer ' + contextualization.contextualizer
              });
            }
          } else {
            toKeep = false;
            errors.push({
              type: 'error',
              preciseType: 'invalidContextualization',
              message: 'resource ' + resKey + ' was asked in a contextualization but was not found'
            });
          }
        });
        if (toKeep === false) {
          delete document.contextualizations[contextualization.citeKey];
        }
      }
    }
  }
  return {errors, document};
};

/**
 * Resolves relations of recurrence, order, and similarity between contextualizations in a section
 * @param {inputDocument} document - the document to resolve
 * @param {object} settings - the rendering settings to apply
 * @return {Object} newDocument - the udpated document
 */
export const resolveContextualizationsRelations = (inputDocument, settings) =>{
  const document = Object.assign({}, inputDocument);
  let opCitIndex;
  let sameResPrint;
  for (const sectionKey in document.sections) {
    if (document.sections[sectionKey]) {
      const sectio = document.sections[sectionKey];
      sectio.contextualizations.forEach((contKey, contIndex) => {
        sameResPrint = undefined;
        opCitIndex = undefined;
        const contextualization = document.contextualizations[contKey];
        contextualization.resPrint = contextualization.resources.join('-');
        // find if another contextualization has exactly the same resources set and same section as scope
        for (const oContKey in document.contextualizations) {
          // check if this other contextualization
          // uses the same resources and belong to the same section
          // and use the same contextualizer type
          if (oContKey !== contKey
            // same resources set
            && document.contextualizations[oContKey].resPrint === contextualization.resPrint
            // same section
            && document.contextualizations[oContKey].nodePath[0] === contextualization.nodePath[0]
            // same contextualizer type
            && document.contextualizations[oContKey].contextualizerType === contextualization.contextualizerType
            ) {
            // if opcit section
           /* sectio.contextualizations.some((thatKey, thatIndex) => {
              if (thatKey === oContKey && thatIndex > contIndex) {
                opCitIndex = thatIndex;
                return true;
              }
              return false;
            });*/
            document.sections[contextualization.nodePath[0]].contextualizations.find((oKey2, oIndex)=> {
              if (oKey2 === oContKey) {
                opCitIndex = oIndex;
                return oKey2;
              }
            });
            contextualization.precursorCiteKey = document.contextualizations[oContKey].citeKey;
            sameResPrint = true;
          }
        }
        if (sameResPrint !== undefined) {
          contextualization.sectionOpCit = true;
        }
        // todo opcit document

        // ibid section
        if (opCitIndex) {
          // want to check for an ibid (same resource, same contextualizer, subsequent)
          // must check if opCit and current contextualizations are strictly subsequent
          const substrate = sectio.contextualizations.slice(opCitIndex, contIndex).filter(intContKey=> {
            return document.contextualizers[
                      document.contextualizations[intContKey].contextualizer
                    ].type === document.contextualizers[contextualization.contextualizer].type;
          });
          if (substrate.length === 1) {
            contextualization.sectionIbid = true;
          }
        }

        // todo ibid document

        // citation specifics
        if (document.contextualizers[contextualization.contextualizer].type === 'citation') {
          // same authors but different work in year - section scale
          contextualization.authorsPrint = document.resources[contextualization.resources[0]].author.reduce((str, author)=> {
            return str + author.lastName + '-' + author.firstName;
          }, '');
          for (const oContKey2 in document.contextualizations) {
            if (oContKey2 !== contKey
              // same section
              && document.contextualizations[oContKey2].nodePath[0] === contextualization.nodePath[0]
              // different resources set
              && document.contextualizations[oContKey2].resPrint !== contextualization.resPrint
              // same authors set
              && document.contextualizations[oContKey2].authorsPrint === contextualization.authorsPrint
              // same year
              && (document.contextualizations[oContKey2].year === contextualization.year
                  || document.contextualizations[oContKey2].date === contextualization.date)
              ) {
              // if same authors/year
              const cont2 = document.contextualizations[oContKey2];
              cont2.sameAuthorInYear = cont2.sameAuthorInYear !== undefined ? cont2.sameAuthorInYear ++ : 1;
              contextualization.sameAuthorInYear = cont2.sameAuthorInYear + 1;
              contextualization.yearSuffix = numbersToLetters(contextualization.sameAuthorInYear);
              cont2.yearSuffix = numbersToLetters(cont2.sameAuthorInYear);
            }
          }
          // todo same authors in year but different work - at document scale
        }

        opCitIndex = undefined;
      });
    }
  }
  return document;
};

/**
 * Resolves all the contextualizations of a section by updating its contents pseudo-DOM representation
 * @param {object} contextualization - the contextualization to implement
 * @param {object} document - the document to update
 * @param {string} renderingMode - whether rendering is static or dynamic
 * @param {object} settings - the rendering settings to take into account when resolving contextualizations
 * @return {Object} newDocument - the updated document
 */
export const resolveContextualizationImplementation = (contextualization, document, renderingMode, settings) =>{
  let contextualizer;
  // console.log('resolving ', contextualization.citeKey);
  contextualizer = contextualizerLibs[contextualization.contextualizerType];
  if (contextualizer === undefined) {
    console.log('no contextualizer function was found for type ', contextualization.contextualizerType);
    return document;
  }
  switch (renderingMode) {
  case 'static':
    switch (contextualization.type) {
    case 'inline':
      return contextualizer.contextualizeInlineStatic(document, contextualization, settings);
    case 'block':
      return contextualizer.contextualizeBlockStatic(document, contextualization, settings);
    default:
      break;
    }
    break;
  case 'dynamic':
    switch (contextualization.type) {
    case 'inline':
      return contextualizer.contextualizeInlineDynamic(document, contextualization, settings);
    case 'block':
      return contextualizer.contextualizeBlockDynamic(document, contextualization, settings);
    default:
      break;
    }
    break;
  default:
    break;
  }
  // default return unchanged document
  return document;
};
