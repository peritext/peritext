import {map as asyncMap, waterfall} from 'async';

const formatMetadata = function(metadataObj){
  let output = [], value, keydetail, domain;
  for(var key in metadataObj){
    value = (!Array.isArray(value))?metadataObj[key].replace(/[\{\}\"\']/g, '')
              :metadataObj[key].map((val) =>{
                return val.replace(/[\{\}\"\']/g, '');
              })
    keydetail = key.split('_');
    domain = (keydetail.length > 1)?keydetail.shift():'general';
    key = keydetail.join('_');
    output.push({
      domain,
      key,
      value
    })
  }
  return output;
}

const flattenSections = function(tree, callback){

  if(tree.children){
    asyncMap(tree.children, flattenSections, function(err, children){

      let newTree = Object.assign({}, tree);
      let newChildren = children.map((child)=>{
        return Object.assign({}, child[0], {parent : tree.metadata.citeKey});
      });

      return callback(null, [newTree, ...newChildren]);
    })
  }else return callback(null, tree);
}


const formatSection = (section) =>{
  let metadata = formatMetadata(section.metadata);
  return {
    metadata,
    contents : section.contentStr,
    resources : section.resources,
    parent : section.parent
  }
};

const formatSections = function(sections, callback){
  let formatted = sections.map(formatSection);
  return callback(null, formatted);
}


const makeOneRelation = function(section, sections, pointedProp, sourcePropKey){
  let pointerIndex;
  let pointer = section.metadata.find((metadata, i) => {
      if(metadata.domain === 'general' && metadata.key === pointedProp){
        pointerIndex = i;
        return true;
      }
  });
  if(pointer){
    let target = sections.find((section)=>{
      return section.metadata.find((meta2) =>{
        return meta2.domain === 'general' && meta2.key === 'citeKey' && meta2.value === pointer.value;
      });
    });
    if(target){
      section[sourcePropKey] = pointer.value;//target.metadata.find((meta)=>{return meta.name ==='citeKey'}).value;
    }
    section.metadata.splice(pointerIndex, 1);
  }
  return section;
}

const makeRelations = function(sections, callback){

  //find parents and predecessors
  sections = sections.map((section) =>{
    makeOneRelation(section, sections, 'parent', 'parent');
    makeOneRelation(section, sections, 'after', 'after');
    return section;
  });
  //order
  for(let i = sections.length - 1 ; i >= 0 ; i--){
    let section = sections[i];
    if(section.after){
      let indexAfter;
      sections.some((sec, id) =>{
        let citeKey = sec.metadata.find((meta)=>{
          return meta.domain === 'general' && meta.key === 'citeKey';
        }).value;

        if(section.after === citeKey){
          return indexAfter = id;
        }
      });
      sections.splice(indexAfter + 1, 0, section);
      sections.splice(i+1, 1);
    }
  }

  callback(null, sections);
}

export function organizeTree({errors, validTree}, callback){

  waterfall([
      function(cb){
        flattenSections(validTree, cb);
      },
      function(sections, cb){
        formatSections(sections, cb);
      },
      function(sections, cb){
        makeRelations(sections, cb);
      }
    ], function(err, sections){
      callback(err, {sections, errors})
    });
}
