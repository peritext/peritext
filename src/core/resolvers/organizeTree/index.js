import {map as asyncMap, waterfall} from 'async';

import {getMetaValue, deleteMeta} from './../../utils/sectionUtils';

const formatMetadata = function(metadataObj) {
  const output = [];
  let value;
  let keydetail;
  let domain;
  for (let key in metadataObj) {
    if (metadataObj[key] !== undefined) {
      value = metadataObj[key];
      keydetail = key.split('_');
      domain = (keydetail.length > 1) ? keydetail.shift() : 'general';
      key = keydetail.join('_');
      output.push({
        domain,
        key,
        value
      });
    }
  }
  return output;
};

const flattenSections = function(tree, callback) {

  if (tree.children) {
    asyncMap(tree.children, flattenSections, function(err, children) {
      const newTree = Object.assign({}, tree);
      const newChildren = children.map((child)=>{
        return Object.assign({}, child[0], {parent: tree.metadata.citeKey});
      });

      return callback(null, [newTree, ...newChildren]);
    });
  }else return callback(null, tree);
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

const formatSections = function(sections, callback) {
  const formatted = sections.map(formatSection);
  return callback(null, formatted);
};

const makeRelations = function(inputSections, callback) {

  // find parents and predecessors
  const sections = inputSections.map((inputSection) =>{
    const section = Object.assign({}, inputSection);
    const parent = getMetaValue(section.metadata, 'general', 'parent');
    const after = getMetaValue(section.metadata, 'general', 'after');
    if (parent) {
      section.parent = parent;
      section.metadata = deleteMeta(section.metadata, 'general', 'parent');
    }
    if (after) {
      section.after = after;
      section.metadata = deleteMeta(section.metadata, 'general', 'after');
    }
    return section;
  });
  // order sections
  for (let index = sections.length - 1; index >= 0; index--) {
    const section = sections[index];
    if (section.after) {
      let indexAfter;
      sections.some((sec, id) =>{
        const citeKey = sec.metadata.find((meta)=>{
          return meta.domain === 'general' && meta.key === 'citeKey';
        }).value;

        if (section.after === citeKey) {
          indexAfter = id;
          return true;
        }
      });
      sections.splice(indexAfter + 1, 0, section);
      sections.splice(index + 1, 1);
    }
  }

  callback(null, sections);
};

export function organizeTree({errors, validTree}, callback) {

  waterfall([
    function(cb) {
      flattenSections(validTree, cb);
    },
    function(sections, cb) {
      formatSections(sections, cb);
    },
    function(sections, cb) {
      makeRelations(sections, cb);
    },
  ], function(err, sections) {
    callback(err, {sections, errors});
  });
}
