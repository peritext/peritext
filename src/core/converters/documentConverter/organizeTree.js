/**
 * This module organizes relations between sections (order, inheritance, generality level)
 * @module converter/documentConverter/organizeTree
 */

const formatMetadata = (metadataObj) =>{
  const output = {};
  let value;
  let keydetail;
  let domain;
  for (let key in metadataObj) {
    if (metadataObj[key] !== undefined) {
      value = metadataObj[key];
      keydetail = key.split('_');
      domain = (keydetail.length > 1) ? keydetail.shift() : 'general';
      key = keydetail.join('_');
      if (output[domain] === undefined) {
        output[domain] = {};
      }
      output[domain][key] = {
        value
      };
    }
  }
  return output;
};

const flattenSections = (tree) =>{
  if (tree.children) {
    const newChildren = tree.children.map(child=>{
      return Object.assign({}, child, {parent: tree.metadata.id});
    });
    const newTree = Object.assign({}, tree);
    return [
      newTree,
      ...newChildren
    ];
  }
  return tree;
};


const formatSection = (section) =>{
  const metadata = formatMetadata(section.metadata);
  let keyedCustomizers;
  if (section.customizers) {
    keyedCustomizers = {};
    section.customizers.forEach((customizer) => {
      keyedCustomizers[customizer.type] = customizer.contents;
    });
  }
  return {
    metadata,
    contents: section.contentStr,
    resources: section.resources,
    parent: section.parent,
    customizers: keyedCustomizers,
    contextualizers: section.contextualizers
  };
};

const formatSections = (sections) =>{
  const formattedSections = sections.map(section => {
    return formatSection(section);
  });
  return formattedSections;
};

const moveInArray = (inputArray, oldIndex, newIndex)=> {
  const array = [...inputArray];
  if (newIndex >= array.length) {
    let toFill = newIndex - array.length;
    while ((toFill--) + 1) {
      array.push(undefined);
    }
  }
  array.splice(newIndex, 0, array.splice(oldIndex, 1)[0]);
  return array;
};

const makeRelations = (inputSections) =>{
  // find parents and predecessors
  let sections = inputSections.map((inputSection) =>{
    const section = Object.assign({}, inputSection);
    // todo : clean the two ways of defining parents (at object root or in metadata)
    if (section.parent && section.metadata.general.parent === undefined) {
      section.metadata.general.parent = {value: section.parent};
    }
    delete section.parent;
    if (section.after && section.metadata.general.after === undefined) {
      section.metadata.general.after = {value: section.after};
    }
    delete section.after;
    return section;
  });
  // order sections
  // move the "no-after" sections to the begining of array
  const hasAfter = sections.filter(section => section.metadata.general.after);
  const hasNoAfter = sections.filter(section => section.metadata.general.after === undefined);
  sections = [...hasNoAfter, ...hasAfter];
  // resolve after statements
  for (let index = sections.length - 1; index >= 0; index--) {
    const section = sections[index];
    // console.log('parsing ', section.metadata.general.id.value, index);
    if (section.metadata.general.after && section.metadata.general.parent) {
      let indexAfter;
      sections.some((section2, thatIndex) =>{
        const id = section2.metadata.general.id.value;
        if (section.metadata.general.after.value === id) {
          indexAfter = thatIndex;
          return true;
        }
      });
      if (indexAfter !== undefined && index !== indexAfter + 1) {
        // console.log('put ', section.metadata.general.id.value, index, ' after ', section.metadata.general.after.value, indexAfter);
        sections = moveInArray(sections, index, indexAfter + 1);
      } else if (indexAfter === undefined) {
        console.error(section.metadata.general.id.value,
          ' is supposed to be after ',
          section.metadata.general.after.value,
          ' but this section does not exist');
      }
    }
  }
  const summary = sections.map(section => section.metadata.general.id.value);
  const orderedSections = sections.map((section, index) => {
    if (index > 0 ) {
      section.metadata.general.after = {
        value: sections[index - 1].metadata.general.id.value
      };
    } else {
      delete section.metadata.general.after;
    }
    return section;
  });
  const outputSections = orderedSections.reduce((output, section) => {
    return Object.assign(output, {[section.metadata.general.id.value]: section});
  }, {});
  return {outputSections, summary};
};

/**
 * Organizes relations between sections
 * @param {Object} params - the organization params
 * @param {array} params.errors - the inherited parsing errors to pass along to next step
 * @param {Object} params.validTree - the tree to process
 * @return {error: error, results: {errors: array, sections: array} - an updated list of parsing errors and updated sections
 */
export const organizeTree = ({errors = [], validTree}) => {
  const flatSections = flattenSections(validTree);
  const formattedSections = formatSections(flatSections);
  const {outputSections: sections, summary} = makeRelations(formattedSections);
  return {
    document: {
      sections,
      summary
    },
    errors
  };
};
