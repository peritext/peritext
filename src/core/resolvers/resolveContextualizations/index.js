import {getMetaValue} from './../../utils/sectionUtils';
import {getResourceModel, getContextualizerModel, resolvePropAgainstType} from './../../utils/modelUtils';
import * as contextualizers from './../../contextualizers/';

 // I transform 1, 2, 3 incrementation into a, b, c
export function numbersToLetters(num) {
  const mod = num % 26;
  let pow = num / 26 | 0;
  const out = mod ? String.fromCharCode(64 + mod) : (--pow, 'Z');
  return pow ? numberToLetters(pow) + out : out.toLowerCase();
}

// I resolve a contextualizer assertion against its model and context, and record errors
function resolveContextualizer(contextualizer, section, models) {
  const err = [];
  let newContextualizer = Object.assign({}, contextualizer);
  // if overloading, first fetch the existing contextualizer
  if (newContextualizer.overloading) {
    const overload = newContextualizer.overloading.replace(/^@/, '');
    // find original
    const original = section.contextualizers.find((cont) =>{
      return cont.citeKey === overload;
    });
    // resolve original
    if (original) {
      const originalFormatted = resolveContextualizer(original, section, models).finalContextualizer;
      newContextualizer = Object.assign(originalFormatted, newContextualizer);
    } else {
      // no original found ==> overloading reference error
      err.push({
        type: 'error',
        preciseType: 'invalidContextualizer',
        sectionCiteKey: getMetaValue(section.metadata, 'general', 'citeKey'),
        message: 'overloading reference error: contextualizer ' + newContextualizer.citeKey + ' should overload ' + overload + ' but the original contextualizer does not exist'
      });
    }
  }
  // guess contextualizer type if needed
  if (!newContextualizer.type) {
    if (newContextualizer.resources.length > 0) {
      const sourceKey = newContextualizer.resources[0];
      const source = section.resources.find((resource)=>{
        return resource.citeKey === sourceKey;
      });
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
        sectionCiteKey: getMetaValue(section.metadata, 'general', 'citeKey'),
        message: 'contextualizer ' + newContextualizer.citeKey + ' (' + newContextualizer.type + ') does not provide required type ' + thatModel.key
      });
    }
    return obj;
  }, {});
  return {err, finalContextualizer};
}

// I build formatted objects for contextualizers and contextualizations, and record related parsing and model-related errors
export function resolveContextualizersAndContextualizations({section, models}, cb) {
  let errors = [];

  // populate contextualizers against their models
  section.contextualizers = section.contextualizers.map((contextualizer)=>{
    const {err, finalContextualizer} = resolveContextualizer(contextualizer, section, models);
    if (err.length) {
      errors = errors.concat(err);
    }
    return finalContextualizer;
  });


  // verify that all required resources exist
  section.contextualizations = section.contextualizations.filter((contextualization) =>{
    let ok = true;
    // prepare resourceType<->contextualizerType compatibility check
    const contextualizer = section.contextualizers.find((cont) =>{
      return cont.citeKey === contextualization.contextualizer;
    });
    if (!contextualizer) {
      errors.push({
        type: 'error',
        preciseType: 'invalidContextualization',
        sectionCiteKey: getMetaValue(section.metadata, 'general', 'citeKey'),
        message: 'contextualizer ' + contextualization.contextualizer + ' was not found'
      });
    } else {
      contextualization.contextualizerType = contextualizer.type;
    }
    const acceptedResourceTypes = getContextualizerModel(contextualizer.type, models.contextualizerModels).acceptedResourceTypes;
    // resources compatibility and existence check
    contextualization.resources.some((resId) =>{
      // find related resource
      const res = section.resources.find((resource) =>{
        return resource.citeKey === resId;
      });
      // resource exists, check if it is accepted for the contextualizerType
      if (res !== undefined) {
        let accepted = false;
        acceptedResourceTypes.some((type) => {
          if (type === '*' || type === res.bibType) {
            accepted = true;
            return true;
          }
        });
        if (!accepted) {
          ok = false;
          errors.push({
            type: 'error',
            preciseType: 'invalidContextualization',
            sectionCiteKey: getMetaValue(section.metadata, 'general', 'citeKey'),
            message: 'resource ' + res + ' was asked in a contextualization but is not handled by the contextualizer ' + contextualization.contextualizer
          });
        }
      } else {
        ok = false;
        errors.push({
          type: 'error',
          preciseType: 'invalidContextualization',
          sectionCiteKey: getMetaValue(section.metadata, 'general', 'citeKey'),
          message: 'resource ' + res + ' was asked in a contextualization but was not found'
        });
      }
      return ok;
    });
    return ok;
  }).map((cont) =>{
    const contextualizer = section.contextualizers.find((con) =>{
      return con.citeKey === cont.contextualizer;
    });
    return Object.assign({}, cont, contextualizer, {type: cont.type, citeKey: cont.citeKey});
  });
  cb(null, {errors, section});
}

export function resolveContextualizationsRelations(sections, renderingParams) {
  let opCitIndex;
  let sameResPrint;
  return sections.reduce((inputSections, sectio, index)=> {
    sectio.contextualizations = sectio.contextualizations.reduce((conts, contextualization, contIndex) => {
      contextualization.resPrint = contextualization.resources.join('-');
      // opcit section
      sameResPrint = conts.find((cont2, cont2Index)=> {
        if (cont2.resPrint === contextualization.resPrint) {
          opCitIndex = cont2Index;
          return true;
        }
      });

      if (sameResPrint !== undefined) {
        contextualization.sectionOpCit = true;
      }
      // todo opcit document

      // ibid section
      if (opCitIndex && opCitIndex === contIndex - 1) {
        contextualization.sectionIbid = true;
      }
      // todo ibid document

      if (contextualization.contextualizerType === 'citation') {
        // same authors but different work in year - section scale
        contextualization.authorsPrint = contextualization.author.reduce((str, author)=> {
          return str + '-' + author.lastName + '-' + author.firstName;
        }, '');

        conts.find((cont2)=> {
          if (cont2.authorsPrint === contextualization.authorsPrint && cont2.resPrint !== contextualization.resPrint && (cont2.year === contextualization.year || cont2.date === contextualization.date)) {
            cont2.sameAuthorInYear = cont2.sameAuthorInYear !== undefined ? cont2.sameAuthorInYear ++ : 1;
            contextualization.sameAuthorInYear = cont2.sameAuthorInYear + 1;
            contextualization.yearSuffix = numbersToLetters(contextualization.sameAuthorInYear);
            cont2.yearSuffix = numbersToLetters(cont2.sameAuthorInYear);
            return true;
          }
        });

        // todo same authors in year but different work - document scale
      }

      opCitIndex = undefined;
      return conts.concat(contextualization);
    }, []);

    return inputSections.concat(sectio);
  }, []);
}

// I 'reduce' contextualizations statements to produce a new rendering-specific section representation
export function resolveContextualizationsImplementation(section, renderingMode, renderingParams) {
  let contextualizer;
  const sectio = section.contextualizations.reduce((inputSection, contextualization) => {
    contextualizer = contextualizers[contextualization.contextualizerType];
    switch (renderingMode) {
    case 'static':
      switch (contextualization.type) {
      case 'inline':
        return contextualizer.contextualizeInlineStatic(inputSection, contextualization, renderingParams);
      case 'block':
        return contextualizer.contextualizeBlockStatic(inputSection, contextualization, renderingParams);
      default:
        break;
      }
      break;
    case 'dynamic':
      switch (contextualization.type) {
      case 'inline':
        return contextualizer.contextualizeInlineDynamic(inputSection, contextualization, renderingParams);
      case 'block':
        return contextualizer.contextualizeBlockDynamic(inputSection, contextualization, renderingParams);
      default:
        break;
      }
      break;
    default:
      break;
    }
    return Object.assign({}, inputSection);
  }, Object.assign({}, section));

  return sectio;
}
