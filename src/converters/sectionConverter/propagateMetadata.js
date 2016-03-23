

function inheritFromParent(section, sections, parentMetadata){
  if(section.parent && !parentMetadata){
    let parent = sections.find((sec)=>{
      return sec.metadata.find((meta)=>{
        return meta.key === 'citeKey' && meta.domain === 'general' && meta.value === section.parent;
      })
    });
    if(parent){
      parent = inheritFromParent(parent, sections, parentMetadata);
      parentMetadata = parent.metadata.slice();
    }else return section;

  }
  if(!parentMetadata){
    return section;
  }
  let inherited = parentMetadata.filter((pmeta) =>{
    let hasIt;
    section.metadata.some((cmeta) =>{
      if(pmeta.domain === cmeta.domain && pmeta.key === cmeta.key){
        return hasIt = true;
      }
    });
    //if it hasn't it, propagate to it
    if(!hasIt){
      return true;
    }else return false;
  });

  let parentKey = parentMetadata.find((meta) => {
    return meta.domain === 'general' && meta.key === 'citeKey';
  }).value;

  inherited = inherited.map((meta) =>{
    return Object.assign(meta, {inheritedVerticallyFrom : parentKey})
  })
  section.metadata = section.metadata.concat(inherited);
  return section;
}

function populateLaterally(section, models){
  let toInclude = [],
      model;


  section.metadata.forEach((meta) => {
    model = models[meta.domain][meta.key];
    if(model){
      let spreaded = model.propagatesTo.map((sp) =>{
        let parts = sp.split('_'),
            domain = (parts.length > 1) ? parts.shift() : 'general',
            value = parts.join('_');
        return {domain, value}
      });
      spreaded.forEach((sp) =>{
        let hasIt;
        section.metadata.some((m) =>{
          if(m.domain === sp.domain && m.key === sp.key){
            return hasIt = true;
          }
        });
        if(!hasIt){
          toInclude.push(sp);
        }
      })
    }
  });
  section.metadata = section.metadata.concat(toInclude);
  return section;
}


export function propagateMetadata({errors, sections, models, inheritedMetadata}, callback){
  if(inheritedMetadata){
    let noParents = sections.filter((section) =>{
      return !section.parent
    });
    noParents.forEach((section) =>{
      section = inheriteFromParent(section, sections, inheritedMetadata);
    })
  }
  sections = sections.map((section) =>{
    if(section.parent){
      return inheritFromParent(section, sections);
    }else return section;
  });
  sections = sections.map((section) =>{
    return populateLaterally(section, models.metadataModels)
  });
  callback(null, {errors, sections});
}
