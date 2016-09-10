/**
 * This module handles metadata propagation within and between sections
 * @module converter/sectionConverter/propagateData
 */
import {metaStringToCouple} from './../../utils/sectionUtils';

const inheritMetadataFromParent = (section, sectionTypeModels, sections, parentMetadata) => {
  if (parentMetadata === undefined) {
    return section;
  }
  // set final bibType
  if (section.metadata.general.bibType.value === 'section') {
    const parentBibType = parentMetadata.general.bibType.value;
    const parentModel = sectionTypeModels.acceptedTypes[parentBibType];
    if (parentModel) {
      section.metadata.general.bibType = {
        value: parentModel.childrenType,
        inheritedVerticallyFrom: parentMetadata.general.citeKey.value
      };
    }
  }
  // set hierarchical level (parent + 1 or parent + own level)
  const parentLevel = parentMetadata.general.generalityLevel;
  const ownLevel = section.metadata.general.generalityLevel;
  if (parentLevel && ownLevel) {
    section.metadata.general.generalityLevel.value = +parentLevel.value + ownLevel.value;
  } else if (parentLevel) {
    section.metadata.general.generalityLevel = {value: +parentLevel.value + 1};
  } else {
    section.metadata.general.generalityLevel = {value: parentLevel.value};
  }
  // inherit the rest
  for (const domain in parentMetadata) {
    if (parentMetadata[domain]) {
      for (const key in parentMetadata[domain]) {
        if (parentMetadata[domain][key]) {
          // inherit if property does not exist in child
          if (section.metadata[domain] === undefined || section.metadata[domain][key] === undefined) {
            if (section.metadata[domain] === undefined) {
              section.metadata[domain] = {};
            }
            section.metadata[domain][key] = {
              value: parentMetadata[domain][key].value,
              inheritedVerticallyFrom: parentMetadata.general.citeKey.value
            };
          }
        }
      }
    }
  }
  // mark metadata as done
  section.metadataInherited = true;
  return section;
};


const doInheritMetadataFromParent = (inputSection, sectionTypeModels, sections) => {
  let section = Object.assign({}, inputSection);
  let parent = section.metadata.general.parent;
  if (parent && !section.metadataInherited) {
    section.metadataInherited = true;
    parent = sections[parent.value];
    // first, make your parent inherit from its parent
    if (!parent.metadataInherited) {
      parent = doInheritMetadataFromParent(parent, sectionTypeModels, sections);
    }
    // then inherit yourself from your parent
    section = inheritMetadataFromParent(section, sectionTypeModels, sections, parent.metadata);
  }
  section.metadataInherited = true;
  return section;
};


const inheritCustomizersFromParent = (section, sections, parentCustomizers, parentKey) => {
  if (parentCustomizers === undefined) {
    return section;
  }else if (section.customizers === undefined) {
    section.customizers = Object.assign({}, parentCustomizers);
  }else {
    for (const index in section.customizers) {
      if (parentCustomizers[index] !== undefined) {
        // if customizer is a string (e.g. : css data) append child data after parent data
        if (typeof section.customizers[index] === 'string') {
          section.customizers[index] = parentCustomizers[index] + '\n\n\n' + section.customizers[index];
        }else {
          for (const jindex in parentCustomizers[index]) {
            // add customizer from parent (e.g. : template) if not defined in child
            if (section.customizers[index][jindex] === undefined) {
              section.customizers[index][jindex] = parentCustomizers[index][jindex];
            }
          }
        }
      }
    }
  }
  return section;
};

const doInheritCustomizersFromParent = (inputSection, sections) => {
  let section = Object.assign({}, inputSection);
  let parent = section.metadata.general.parent;
  if (parent && !section.customizersInherited) {
    parent = sections[parent.value];
    // first, make your parent inherit from its parent
    if (!parent.customizersInherited) {
      parent = doInheritCustomizersFromParent(parent, sections);
    }
    // then inherit yourself from your parent
    section = inheritCustomizersFromParent(section, sections, parent.customizers, parent.metadata.general.citeKey.value);
  }
  section.customizersInherited = true;
  return section;
};

const populateLaterally = (section, models) => {
  // const toInclude = [];
  for (const domain in section.metadata) {
    if (section.metadata[domain]) {
      for (const key in section.metadata[domain]) {
        if (section.metadata[domain][key]) {
          const model = models[domain][key];
          if (model) {
            const spreaded = model.propagatesTo.map(metaStringToCouple);
            spreaded.forEach(sp => {
              if (section.metadata[sp.domain] === undefined) {
                section.metadata[sp.domain] = {};
              }
              if (section.metadata[sp.domain][sp.key] === undefined) {
                section.metadata[sp.domain][sp.key] = {
                  value: section.metadata[domain][key].value,
                  inheritedHorizontallyFrom: {domain, key}
                };
              }
            });
          }
        }
      }
    }
  }

  return section;
};

/**
 * Populate the metadatas of a list of sections, by applying propagation from parents or inbetween metadata values (e.g. : from twitter domain to open graph domain)
 * @param {Object} params - the params of propagation
 * @param {array} params.errors - the list of errors possibly inherited from previous steps
 * @param {Object} params.document - the document in its current shape (sections litteral object + sumamry)
 * @param {Object} params.models - the models to parse the sections with
 * @param {Object} params.parent - if specified, sections that don't have a parent will all be considered as children of this one (but it won't be parsed itself)
 * @return {errors: array, document: Object} - the new transformation errors and updated document representation
 */
export const propagateData = ({
  errors,
  document: inputDocument,
  models
}) => {

  const document = Object.assign({}, inputDocument);
  document.resources = {};
  document.contextualizers = {};

  for (const key in document.sections) {
    if (document.sections[key]) {
      const section = document.sections[key];
      // catch root and desactivate inheritance for this one
      if (section.metadata.general.parent === undefined) {
        section.metadata.general.generalityLevel = {value: 1};
        section.resourcesInherited = true;
        section.metadataInherited = true;
        section.customizersInherited = true;
        section.contextualizersInherited = true;
      }
      // clean bibType
      let newBibType = section.metadata.general.bibType.value;
      newBibType = newBibType ? newBibType.split('peritext') : [];
      newBibType = newBibType.length > 1 ? newBibType[1] : newBibType[0];
      section.metadata.general.bibType.value = newBibType;
      // add resources to general resources list
      section.resources.forEach(resource => {
        if (document.resources[resource.citeKey]) {
          errors.push({
            type: 'error',
            preciseType: 'redundantResource',
            resourceCiteKey: resource.citeKey,
            message: 'Resource ' + resource.bibType + ' is described more than once'
          });
        }
        document.resources[resource.citeKey] = resource;
      });
      // add contextualizers to general resources list
      section.contextualizers.forEach(contextualizer => {
        if (document.contextualizers[contextualizer.citeKey]) {
          errors.push({
            type: 'error',
            preciseType: 'redundantContextualizer',
            resourceCiteKey: contextualizer.citeKey,
            message: 'Contextualizer ' + contextualizer.bibType + ' is described more than once'
          });
        }
        document.contextualizers[contextualizer.citeKey] = contextualizer;
      });
      delete section.contextualizers;
    }
  }
  // vertical inheritance process
  // -> fill with parent metadata, append parent customizers
  for (const keyVert in document.sections) {
    if (document.sections[keyVert]) {
      document.sections[keyVert] = doInheritMetadataFromParent(document.sections[keyVert], models.sectionTypeModels, document.sections);
      document.sections[keyVert] = doInheritCustomizersFromParent(document.sections[keyVert], document.sections);
    }
  }
  // lateral inheritance process
  // e.g. twitter ==> dublincore
  for (const keyLat in document.sections) {
    if (document.sections[keyLat]) {
      document.sections[keyLat] = populateLaterally(document.sections[keyLat], models.metadataModels);
    }
  }

  // cleaning control properties
  for (const keyClean in document.sections) {
    if (document.sections[keyClean]) {
      const section = document.sections[keyClean];
      delete section.metadataInherited;
      delete section.customizersInherited;
    }
  }
  return {errors, document};
};
