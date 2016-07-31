/**
 * This module handles metadata propagation within and between sections
 * @module converter/sectionConverter/propagateData
 */
import {getMetaValue, setMetaValue, hasMeta, findByMetadata, metaStringToCouple, hasResource} from './../../utils/sectionUtils';

const inheritMetadataFromParent = (section, sectionTypeModels, sections, parentMetadata) => {
  if (parentMetadata === undefined) {
    return section;
  }
  // inherit metadata props
  // discriminated inedit propert
  const inherited = parentMetadata.filter((pmeta) =>{
    if (hasMeta(section.metadata, pmeta)) {
      return false;
    }
    return true;
  });

  const parentKey = getMetaValue(parentMetadata, 'general', 'citeKey');
  section.metadata = section.metadata.concat(inherited.map((meta) =>{
    return Object.assign({}, meta, {inheritedVerticallyFrom: {domain: 'general', key: 'citeKey', value: parentKey}});
  }));

  // set final bibType
  const bibType = getMetaValue(section.metadata, 'general', 'bibType');
  if (bibType === 'section') {
    const parentBibType = getMetaValue(parentMetadata, 'general', 'bibType');
    const parentModel = sectionTypeModels.acceptedTypes[parentBibType];
    if (parentModel) {
      section.metadata = setMetaValue(section.metadata, 'general', 'bibType', parentModel.childrenType);
    }
  }

  // set hierarchical level (parent + 1 or parent + own level)
  const parentLevel = getMetaValue(parentMetadata, 'general', 'generalityLevel');
  const ownLevel = getMetaValue(section.metadata, 'general', 'generalityLevel');
  if (parentLevel && ownLevel) {
    section.metadata = setMetaValue(section.metadata, 'general', 'generalityLevel', parentLevel + ownLevel);
  }else if (parentLevel) {
    section.metadata.push({
      domain: 'general',
      key: 'generalityLevel',
      value: parentLevel + 1
    });
  }else {
    section.metadata.push({
      domain: 'general',
      key: 'generalityLevel',
      value: 1
    });
  }
  return section;
};


const doInheritMetadataFromParent = (section, sectionTypeModels, sections) => {
  if (section.parent && !section.metadataInherited) {

    section.metadataInherited = true;

    let parent = findByMetadata(sections, 'general', 'citeKey', section.parent);
    // first, make your parent inherit from its parent
    if (!parent.metadataInherited) {
      parent = doInheritMetadataFromParent(section, sectionTypeModels, sections);
    }
    // then inherit yourself from your parent
    return inheritMetadataFromParent(section, sectionTypeModels, sections, parent.metadata);
  }
  // if(getMetaValue(section.metadata, 'general', 'citeKey') === 'mybook'){
  //   console.log(section.metadata);
  // }
  section.metadataInherited = true;
  return section;
};


const inheritResourcesFromParent = (section, sections, parentResources, parentKey) => {
  if (parentResources === undefined) {
    return section;
  }

  // inherit meta props - take anything that you don't already have
  const inherited = parentResources.filter((presource) =>{
    return !hasResource(section.resources, presource);
  });
  section.resources = section.resources.concat(inherited.map((meta) =>{
    return Object.assign({}, meta, {inheritedVerticallyFrom: parentKey});
  }));
  return section;
};


const doInheritResourcesFromParent = (section, sections) => {
  if (section.parent && !section.resourcesInherited) {
    section.resourcesInherited = true;
    let parent = findByMetadata(sections, 'general', 'citeKey', section.parent);
    // first, make your parent inherit from its parent
    if (!parent.resourcesInherited) {
      parent = doInheritResourcesFromParent(section, sections);
    }
    // then inherit yourself from your parent
    return inheritResourcesFromParent(section, sections, parent.resources, getMetaValue(parent.metadata, 'general', 'citeKey'));
  }
  section.resourcesInherited = true;
  return section;
};

const inheritContextualizersFromParent = (section, sections, parentContextualizers, parentKey) => {
  if (parentContextualizers === undefined) {
    return section;
  }
  // inherit context props - take anything that you don't already have
  const inherited = parentContextualizers.filter((presource) =>{
    return !hasResource(section.contextualizers, presource);
  });

  section.contextualizers = section.contextualizers.concat(inherited.map((meta) =>{
    return Object.assign({}, meta, {inheritedVerticallyFrom: parentKey});
  }));
  return section;
};


const doInheritContextualizersFromParent = (section, sections) => {
  if (section.parent && !section.contextualizersInherited) {
    section.contextualizersInherited = true;
    let parent = findByMetadata(sections, 'general', 'citeKey', section.parent);
    // first, make your parent inherit from its parent
    if (!parent.contextualizersInherited) {
      parent = doInheritResourcesFromParent(section, sections);
    }
    // then inherit yourself from your parent
    return inheritContextualizersFromParent(section, sections, parent.contextualizers, getMetaValue(parent.metadata, 'general', 'citeKey'));
  }
  section.contextualizersInherited = true;
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

const doInheritCustomizersFromParent = (section, sections) => {
  if (section.parent && !section.customizersInherited) {
    section.customizersInherited = true;
    let parent = findByMetadata(sections, 'general', 'citeKey', section.parent);
    // first, make your parent inherit from its parent
    if (!parent.customizersInherited) {
      parent = doInheritCustomizersFromParent(section, sections);
    }
    // then inherit yourself from your parent
    return inheritCustomizersFromParent(section, sections, parent.customizers, getMetaValue(parent.metadata, 'general', 'citeKey'));
  }
  section.customizersInherited = true;
  return section;
};

const populateLaterally = (section, models) => {
  const toInclude = [];

  section.metadata.forEach((meta) => {
    const model = models[meta.domain][meta.key];
    if (model) {
      const spreaded = model.propagatesTo.map(metaStringToCouple);
      spreaded.forEach((sp) =>{
        const existantProp = hasMeta(section.metadata, sp);
        if (!existantProp) {
          toInclude.push(Object.assign({}, sp, {value: meta.value}, {inheritedHorizontallyFrom: {domain: meta.domain, key: meta.key}}));
        }
      });
    }
  });
  section.metadata = section.metadata.concat(toInclude);
  return section;
};

/**
 * Populate the metadatas of a list of sections, by applying propagation from parents or inbetween metadata values (e.g. : from twitter domain to open graph domain)
 * @param {Object} params - the params of propagation
 * @param {array} params.errors - the list of errors possibly inherited from previous steps
 * @param {array} params.sections - the list of sections to transform
 * @param {Object} params.models - the models to parse the sections with
 * @param {Object} params.parent - if specified, sections that don't have a parent will all be considered as children of this one (but it won't be parsed itself)
 * @param {function(error: error, result: {errors: array, sections: array})} callback - the new transformation errors and updated sections
 */
export const propagateData = ({errors, sections, models, parent}, callback) => {
  let noParents = sections.filter((section) =>{
    return !section.parent;
  });
  if (parent) {
    // inherit metadata from args
    const inheritedMetadata = parent.metadata;
    const inheritedResources = parent.resources;
    const inheritedContextualizations = parent.contextualizers;
    const parentKey = getMetaValue(inheritedMetadata, 'general', 'citeKey');

    noParents = noParents.map((inputSection) =>{
      let section = Object.assign({}, inputSection);
      section.metadataInherited = true;
      section.resourcesInherited = true;
      section.contextualizersInherited = true;
      section = inheritResourcesFromParent(section, sections, inheritedResources, parentKey);
      section = inheritContextualizersFromParent(section, sections, inheritedContextualizations, parentKey);
      section = inheritMetadataFromParent(section, models.sectionTypeModels, sections, inheritedMetadata);
      return section;
    });
    // inherit resources from arguments
  } else {
    noParents.forEach((section) =>{
      // hierarchical level bootstrapping
      section.metadata.push({
        domain: 'general',
        key: 'generalityLevel',
        value: 1
      });
      section.resourcesInherited = true;
      section.metadataInherited = true;
      section.customizersInherited = true;
      section.contextualizersInherited = true;
    });
  }
  let outputSections = [].concat(sections);
  // clean bibType
  outputSections = sections.map((section) =>{
    let newBibType = getMetaValue(section.metadata, 'general', 'bibType');
    newBibType = newBibType ? newBibType.split('peritext') : [];
    newBibType = newBibType.length > 1 ? newBibType[1] : newBibType[0];
    section.metadata = setMetaValue(section.metadata, 'general', 'bibType', newBibType);
    return section;
  });

  // inherit metadata from parents to children
  outputSections = sections.map((section) =>{
    return doInheritMetadataFromParent(section, models.sectionTypeModels, sections);
  });

  // inherit resources from parents to children
  outputSections = sections.map((section) =>{
    return doInheritResourcesFromParent(section, sections);
  });

  // inherit contextualizers from parents to children
  outputSections = sections.map((section) =>{
    return doInheritContextualizersFromParent(section, sections);
  });

  // inherit customizers form parents to children
  outputSections = sections.map((section) =>{
    return doInheritCustomizersFromParent(section, sections);
  });

  // inherit metadata laterally, from one property to another
  outputSections = sections.map((section) =>{
    return populateLaterally(section, models.metadataModels);
  });

  // cleaning control properties
  outputSections.forEach((section) =>{
    delete section.metadataInherited;
    delete section.customizersInherited;
    delete section.resourcesInherited;
    delete section.contextualizersInherited;
  });

  callback(null, {errors, sections: outputSections});
};
