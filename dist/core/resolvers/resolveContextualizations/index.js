'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resolveContextualizationsImplementation = exports.resolveContextualizationsRelations = exports.resolveBindings = exports.numbersToLetters = undefined;

var _sectionUtils = require('./../../utils/sectionUtils');

var _modelUtils = require('./../../utils/modelUtils');

var _contextualizers = require('./../../../contextualizers/');

var contextualizers = _interopRequireWildcard(_contextualizers);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * Transforms 1, 2, 3 ordinally used number into a, b, c ordinally used letters
 * @param {number} num - the number to transform
 * @return {string} letter - the output letter
 */
var numbersToLetters = exports.numbersToLetters = function numbersToLetters(num) {
  var mod = num % 26;
  var pow = num / 26 | 0;
  var out = mod ? String.fromCharCode(64 + mod) : (--pow, 'Z');
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
/**
 * Resolver dedicated to resolve  contextualization statements
 * @module resolvers/resolveContextualizations
 */

var resolveContextualizer = function resolveContextualizer(contextualizer, contextualization, section, models) {
  var err = [];
  var newContextualizer = Object.assign({}, contextualizer);
  // if overloading, first fetch the existing contextualizer
  if (newContextualizer.overloading) {
    (function () {
      var overload = newContextualizer.overloading.replace(/^@/, '');
      // find original
      var original = section.contextualizers.find(function (cont) {
        return cont.citeKey === overload;
      });
      // resolve original first
      if (original) {
        var originalFormatted = resolveContextualizer(original, contextualization, section, models).finalContextualizer;
        newContextualizer = Object.assign(originalFormatted, newContextualizer);
      } else {
        // no original found ==> overloading reference error
        err.push({
          type: 'error',
          preciseType: 'invalidContextualizer',
          sectionCiteKey: (0, _sectionUtils.getMetaValue)(section.metadata, 'general', 'citeKey'),
          message: 'overloading reference error: contextualizer ' + newContextualizer.citeKey + ' should overload ' + overload + ' but the original contextualizer does not exist'
        });
      }
    })();
  }
  // guess contextualizer type if needed
  if (!newContextualizer.type) {
    if (contextualization.resources.length > 0) {
      var source = contextualization.resources[0];
      if (source === undefined) {
        err.push({
          type: 'error',
          preciseType: 'invalidContextualizer',
          sectionCiteKey: (0, _sectionUtils.getMetaValue)(section.metadata, 'general', 'citeKey'),
          message: 'contextualizer ' + newContextualizer.citeKey + ' (' + newContextualizer.type + ') does not provide a valid resource'
        });
        return { err: err, undefined: undefined };
      }
      var sourceModel = (0, _modelUtils.getResourceModel)(source.bibType, models.resourceModels);
      newContextualizer.type = sourceModel.defaultContextualizer;
    }
  }
  // resolve contextualizer object against its model
  var contextualizerModel = (0, _modelUtils.getContextualizerModel)(newContextualizer.type, models.contextualizerModels);
  var finalContextualizer = contextualizerModel.properties.reduce(function (obj, thatModel) {
    obj[thatModel.key] = (0, _modelUtils.resolvePropAgainstType)(newContextualizer[thatModel.key], thatModel.valueType, thatModel);
    // record error if required field is undefined
    if (obj[thatModel.key] === undefined && thatModel.required === true) {
      err.push({
        type: 'error',
        preciseType: 'invalidContextualizer',
        sectionCiteKey: (0, _sectionUtils.getMetaValue)(section.metadata, 'general', 'citeKey'),
        message: 'contextualizer ' + newContextualizer.citeKey + ' (' + newContextualizer.type + ') does not provide required type ' + thatModel.key
      });
    }
    return obj;
  }, {});
  return { err: err, finalContextualizer: finalContextualizer };
};

/**
 * Resolves contextualizations' contextualizer and resource, verifying that contextualization will be possible
 * @param {object} contextualizer - the contextualizer to resolve
 * @param {object} section - the section to resolve
 * @param {object} models - the models to use to validate data
 * @param {function(err: error, results: {errors: array, newSection: Object})} callback - callbacks updated section and possible errors as an array
 */
var resolveBindings = exports.resolveBindings = function resolveBindings(_ref, cb) {
  var section = _ref.section;
  var models = _ref.models;

  var errors = [];
  // find implicit contextualizers types
  section.contextualizations = section.contextualizations.map(function (contextualization) {
    // populate contextualizers against their models

    var _resolveContextualize = resolveContextualizer(contextualization.contextualizer, contextualization, section, models);

    var err = _resolveContextualize.err;
    var finalContextualizer = _resolveContextualize.finalContextualizer;

    if (err.length) {
      errors = errors.concat(err);
    } else {
      contextualization.contextualizer = finalContextualizer;
    }
    return contextualization;
    // verify that all required resources exist
  }).filter(function (contextualization) {
    var ok = true;
    if (contextualization.contextualizer === undefined) {
      errors.push({
        type: 'error',
        preciseType: 'invalidContextualization',
        sectionCiteKey: (0, _sectionUtils.getMetaValue)(section.metadata, 'general', 'citeKey'),
        message: 'contextualizer was not found for contextualization ' + contextualization
      });
      return cb(null, { errors: errors, section: section });
    }
    var acceptedResourceTypes = (0, _modelUtils.getContextualizerModel)(contextualization.contextualizer.type, models.contextualizerModels).acceptedResourceTypes;
    // resources compatibility and existence check
    contextualization.resources.some(function (res) {
      // resource exists, check if it is accepted for the contextualizerType
      if (res !== undefined) {
        var accepted = false;
        acceptedResourceTypes.some(function (type) {
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
            sectionCiteKey: (0, _sectionUtils.getMetaValue)(section.metadata, 'general', 'citeKey'),
            message: 'resource ' + res + ' was asked in a contextualization but is not handled by the contextualizer ' + contextualization.contextualizer
          });
        }
      } else {
        ok = false;
        errors.push({
          type: 'error',
          preciseType: 'invalidContextualization',
          sectionCiteKey: (0, _sectionUtils.getMetaValue)(section.metadata, 'general', 'citeKey'),
          message: 'resource ' + res + ' was asked in a contextualization but was not found'
        });
      }
      return ok;
    });
    return ok;
  });
  cb(null, { errors: errors, section: section });
};

/**
 * Resolves relations of recurrence, order, and similarity between contextualizations in a section
 * @param {array} sections - the sections array to resolve
 * @param {object} settings - the rendering settings to apply
 * @return {array} newSections - the udpated sections
 */
var resolveContextualizationsRelations = exports.resolveContextualizationsRelations = function resolveContextualizationsRelations(sections, settings) {
  var opCitIndex = void 0;
  var sameResPrint = void 0;
  return sections.reduce(function (inputSections, sectio, index) {
    sectio.contextualizations = sectio.contextualizations.reduce(function (conts, contextualization, contIndex) {
      contextualization.resPrint = contextualization.resources.map(function (res) {
        return res.citeKey;
      }).join('-');
      // opcit section
      sameResPrint = conts.find(function (cont2, cont2Index) {
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
        var substrate = conts.slice(opCitIndex, contIndex).filter(function (oCont) {
          return oCont.contextualizer.type === contextualization.contextualizer.type;
        });
        if (substrate.length === 2) {
          contextualization.sectionIbid = true;
        }
      }

      // todo ibid document

      if (contextualization.contextualizer.type === 'citation') {
        // same authors but different work in year - section scale
        contextualization.authorsPrint = contextualization.resources[0].author.reduce(function (str, author) {
          return str + author.lastName + '-' + author.firstName;
        }, '');

        conts.find(function (cont2) {
          if (cont2.authorsPrint === contextualization.authorsPrint && cont2.resPrint !== contextualization.resPrint && (cont2.year === contextualization.year || cont2.date === contextualization.date)) {
            cont2.sameAuthorInYear = cont2.sameAuthorInYear !== undefined ? cont2.sameAuthorInYear++ : 1;
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

/**
 * Resolves all the contextualizations of a section by updating its contents pseudo-DOM representation
 * @param {object} section - the section to resolve
 * @param {string} renderingMode - whether rendering is static or dynamic
 * @param {object} settings - the rendering settings to take into account when resolving contextualizations
 * @return {Object} newSection - the updated section
 */
var resolveContextualizationsImplementation = exports.resolveContextualizationsImplementation = function resolveContextualizationsImplementation(section, renderingMode, settings) {
  var contextualizer = void 0;
  var sectio = section.contextualizations.reduce(function (inputSection, contextualization) {
    // rebind resources
    contextualization.resources = contextualization.resources.map(function (res1) {
      return inputSection.resources.find(function (res2) {
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