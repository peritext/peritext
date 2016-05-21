import {map as asyncMap, waterfall} from 'async';

import {getMetaValue, deleteMeta} from './../../utils/sectionUtils';

const formatMetadata = function(metadataObj) {
  let output = [], value, keydetail, domain;
  for (var key in metadataObj) {
    value = metadataObj[key];
    keydetail = key.split('_');
    domain = (keydetail.length > 1) ? keydetail.shift():'general';
    key = keydetail.join('_');
    output.push({
      domain,
      key,
      value
    });
  }
  return output;
};

const flattenSections = function(tree, callback) {

  if (tree.children) {
    asyncMap(tree.children, flattenSections, function(err, children) {
      let newTree = Object.assign({}, tree);
      let newChildren = children.map((child)=>{
        return Object.assign({}, child[0], {parent : tree.metadata.citeKey});
      });

      return callback(null, [newTree, ...newChildren]);
    });
  }else return callback(null, tree);
};


const formatSection = (section) =>{
  let metadata = formatMetadata(section.metadata);
  let keyedCustomizers;
  if (section.customizers) {
    keyedCustomizers = {};
    section.customizers.forEach((customizer) => {
      keyedCustomizers[customizer.type] = customizer.contents;
    });
  }
  return {
    metadata,
    contents : section.contentStr,
    resources : section.resources,
    parent : section.parent,
    customizers : keyedCustomizers,
    contextualizers : section.contextualizers
  };
};

const formatSections = function(sections, callback) {
  let formatted = sections.map(formatSection);
  return callback(null, formatted);
};

const makeRelations = function(sections, callback) {

  //find parents and predecessors
  sections = sections.map((section) =>{
    let parent = getMetaValue(section.metadata, 'general', 'parent'),
      after = getMetaValue(section.metadata, 'general', 'after');
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
  //order sections
  for (let i = sections.length - 1 ; i >= 0 ; i--) {
    let section = sections[i];
    if (section.after) {
      let indexAfter;
      sections.some((sec, id) =>{
        let citeKey = sec.metadata.find((meta)=>{
          return meta.domain === 'general' && meta.key === 'citeKey';
        }).value;

        if (section.after === citeKey) {
          return indexAfter = id;
        }
      });
      sections.splice(indexAfter + 1, 0, section);
      sections.splice(i + 1, 1);
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
