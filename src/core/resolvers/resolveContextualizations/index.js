import {getMetaValue} from './../../utils/sectionUtils';
import {getResourceModel, getContextualizerModel, resolvePropAgainstType} from './../../utils/modelUtils';
import * as contextualizers from './../../../contextualizers/';

 // I transform 1, 2, 3 incrementation into a, b, c
export const numbersToLetters = (num) =>{
  const mod = num % 26;
  let pow = num / 26 | 0;
  const out = mod ? String.fromCharCode(64 + mod) : (--pow, 'Z');
  return pow ? numbersToLetters(pow) + out : out.toLowerCase();
};

// I resolve a contextualizer assertion against its model and context, and record errors
const resolveContextualizer = (contextualizer, contextualization, section, models) =>{
  const err = [];
  let newContextualizer = Object.assign({}, contextualizer);
  // if overloading, first fetch the existing contextualizer
  if (newContextualizer.overloading) {
    const overload = newContextualizer.overloading.replace(/^@/, '');
    // find original
    const original = section.contextualizers.find((cont) =>{
      return cont.citeKey === overload;
    });
    // resolve original first
    if (original) {
      const originalFormatted = resolveContextualizer(original, contextualization, section, models).finalContextualizer;
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
    if (contextualization.resources.length > 0) {
      const source = contextualization.resources[0];
      if (source === undefined) {
        err.push({
          type: 'error',
          preciseType: 'invalidContextualizer',
          sectionCiteKey: getMetaValue(section.metadata, 'general', 'citeKey'),
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
        sectionCiteKey: getMetaValue(section.metadata, 'general', 'citeKey'),
        message: 'contextualizer ' + newContextualizer.citeKey + ' (' + newContextualizer.type + ') does not provide required type ' + thatModel.key
      });
    }
    return obj;
  }, {});
  return {err, finalContextualizer};
};

// I build formatted objects for contextualizers and contextualizations, and record related parsing and model-related errors
export const resolveBindings = ({section, models}, cb) =>{
  let errors = [];
  // find implicit contextualizers types
  section.contextualizations = section.contextualizations.map(contextualization =>{
    // populate contextualizers against their models
    const {err, finalContextualizer} = resolveContextualizer(contextualization.contextualizer, contextualization, section, models);
    if (err.length) {
      errors = errors.concat(err);
    } else {
      contextualization.contextualizer = finalContextualizer;
    }
    return contextualization;
  // verify that all required resources exist
  }).filter((contextualization) =>{
    let ok = true;
    if (contextualization.contextualizer === undefined) {
      errors.push({
        type: 'error',
        preciseType: 'invalidContextualization',
        sectionCiteKey: getMetaValue(section.metadata, 'general', 'citeKey'),
        message: 'contextualizer was not found for contextualization ' + contextualization
      });
      return cb(null, {errors, section});
    }
    const acceptedResourceTypes = getContextualizerModel(contextualization.contextualizer.type, models.contextualizerModels).acceptedResourceTypes;
    // resources compatibility and existence check
    contextualization.resources.some((res) =>{
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
  });
  cb(null, {errors, section});
};

export const resolveContextualizationsRelations = (sections, settings) =>{
  let opCitIndex;
  let sameResPrint;
  return sections.reduce((inputSections, sectio, index)=> {
    sectio.contextualizations = sectio.contextualizations.reduce((conts, contextualization, contIndex) => {
      contextualization.resPrint = contextualization.resources.map(res =>{
        return res.citeKey;
      }).join('-');
      // opcit section
      sameResPrint = conts.find((cont2, cont2Index)=> {
        if (cont2.resPrint === contextualization.resPrint) {
          opCitIndex = cont2Index;
          contextualization.precursorCiteKey = cont2.citeKey;
          return true;
        }
      });

      if (sameResPrint !== undefined) {
        contextualization.sectionOpCit = true;
      }
      // todo opcit document

      // ibid section
      if (opCitIndex) {
        const substrate = conts.slice(opCitIndex, contIndex).filter(oCont=> {
          return oCont.contextualizer.type === contextualization.contextualizer.type;
        });
        if (substrate.length === 2) {
          contextualization.sectionIbid = true;
        }
      }

      // todo ibid document

      if (contextualization.contextualizer.type === 'citation') {
        // same authors but different work in year - section scale
        contextualization.authorsPrint = contextualization.resources[0].author.reduce((str, author)=> {
          return str + author.lastName + '-' + author.firstName;
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
        // todo same authors in year but different work - at document scale
      }

      opCitIndex = undefined;
      return conts.concat(contextualization);
    }, []);

    return inputSections.concat(sectio);
  }, []);
};

// I 'reduce' contextualizations statements to produce a new rendering-specific section representation
export const resolveContextualizationsImplementation = (section, renderingMode, settings) =>{
  let contextualizer;
  const sectio = section.contextualizations.reduce((inputSection, contextualization) => {
    // rebind resources
    contextualization.resources = contextualization.resources.map(res1 =>{
      return inputSection.resources.find(res2 =>{
        return res1.citeKey === res2.citeKey;
      });
    });
    contextualizer = contextualizers[contextualization.contextualizer.type];
    if (contextualizer === undefined) {
      console.log('no contextualizer function was found for type ', contextualization.contextualizer.type);
      return Object.assign({}, inputSection);
    }
    switch (renderingMode) {
    case 'static':
      switch (contextualization.type) {
      case 'inline':
        return contextualizer.contextualizeInlineStatic(inputSection, contextualization, settings);
      case 'block':
        return contextualizer.contextualizeBlockStatic(inputSection, contextualization, settings);
      default:
        break;
      }
      break;
    case 'dynamic':
      switch (contextualization.type) {
      case 'inline':
        return contextualizer.contextualizeInlineDynamic(inputSection, contextualization, settings);
      case 'block':
        return contextualizer.contextualizeBlockDynamic(inputSection, contextualization, settings);
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
};
