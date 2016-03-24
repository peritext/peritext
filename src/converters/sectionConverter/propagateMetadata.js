import {getMetaValue, setMetaValue, hasMeta, findByMetadata, metaStringToCouple, hasResource} from './../../utils/sectionUtils';


function inheritFromParent(section, sectionTypeModels, sections, parentMetadata){
  if(parentMetadata === undefined){
    return section;
  }

  //set final bibType
  let bibType = getMetaValue(section.metadata, 'general', 'bibType');
  if(bibType === 'section'){
    let parentBibType = getMetaValue(parentMetadata, 'general', 'bibType');
    let parentModel = sectionTypeModels.acceptedTypes[parentBibType];
    if(parentModel){
      setMetaValue(section.metadata, 'general', 'bibType', parentModel.childrenType);
    }
  }

  //inherit meta props
  let inherited = parentMetadata.filter((pmeta) =>{
    return hasMeta(section.metadata, pmeta);
  });

  let parentKey = getMetaValue(parentMetadata, 'general', 'citeKey');
  section.metadata = section.metadata.concat(inherited.map((meta) =>{
    return Object.assign(meta, {inheritedVerticallyFrom : parentKey})
  }));
  return section;
}


function doInheritFromParent(section, sectionTypeModels, sections){
  if(section.parent && !section.vInherited){
    section.vInherited = true;

    let parent = findByMetadata(sections, 'general', 'citeKey', section.parent);
    //first, make your parent inherit from its parent
    if(!parent.vInherited){
      parent = doInheritFromParent(section, sectionTypeModels, sections);
    }
    //then inherit yourself from your parent
    return inheritFromParent(section, sectionTypeModels, sections, parent.metadata);
  }else{
    section.vInherited = true;
    return section;
  }
}


function inheritResourcesFromParent(section, sections, parentResources, parentKey){
  if(parentResources === undefined){
    return section;
  }

  //inherit meta props - take anything that you don't already have
  let inherited = parentResources.filter((presource) =>{
    return !hasResource(section.resources, presource);
  });

  section.resources = section.resources.concat(inherited.map((meta) =>{
    return Object.assign(meta, {inheritedVerticallyFrom : parentKey})
  }));
  return section;
}


function doInheritResourcesFromParent(section, sections){
  if(section.parent && !section.rvInherited){
    section.rvInherited = true;
    let parent = findByMetadata(sections, 'general', 'citeKey', section.parent);
    //first, make your parent inherit from its parent
    if(!parent.rvInherited){
      parent = doInheritResourcesFromParent(section, sections);
    }
    //then inherit yourself from your parent
    return inheritResourcesFromParent(section, sections, parent.resources, getMetaValue(parent.metadata, 'general', 'citeKey'));
  }else{
    section.rvInherited = true;
    return section;
  }
}


function populateLaterally(section, models){
  let toInclude = [],
      model;


  section.metadata.forEach((meta) => {
    model = models[meta.domain][meta.key];
    if(model){
      let spreaded = model.propagatesTo.map(metaStringToCouple);
      spreaded.forEach((sp) =>{
        let existantProp = hasMeta(section.metadata, sp);
        if(!existantProp){
          toInclude.push(Object.assign({}, sp, {inheritedHorizontallyFrom : meta.domain  +'_' + meta.key}));
        }
      })
    }
  });
  section.metadata = section.metadata.concat(toInclude);
  return section;
}


export function propagateData({errors, sections, models, parent}, callback){
  let noParents = sections.filter((section) =>{
    return !section.parent;
  });
  //inherit metadata from args
  if(parent){
    let inheritedMetadata = parent.metadata;
    noParents.forEach((section) =>{
      section.vInherited = true;
      section = inheritFromParent(section, models.sectionTypeModels, sections, inheritedMetadata);
    });
  } else {
    noParents.forEach((section) =>{
      section.vInherited = true;
    });
  }
  // }
  //clean bibType
  sections = sections.map((section) =>{
    let newBibType = getMetaValue(section.metadata, 'general', 'bibType').split('modulo')[1];
    section.metadata = setMetaValue(section.metadata, 'general', 'bibType', newBibType);
    return section;
  });
  //inherit metadata from parents to children
  sections = sections.map((section) =>{
    return doInheritFromParent(section, models.sectionTypeModels, sections);
  });

  //inherit resources from argument
  if(parent){
    let inheritedResources = parent.resources;
    let parentKey = getMetaValue(inheritedMetadata, 'general', 'citeKey')
    noParents.forEach((section) =>{
      section.rvInherited = true;
      section = inheritResourcesFromParent(section, sections, inheritedResources, parentKey);
    });
  } else {
    noParents.forEach((section) =>{
      section.rvInherited = true;
    });
  }
  //inherit resources from parents to children
  sections = sections.map((section) =>{
    return doInheritResourcesFromParent(section, sections);
  });

  //inherit metadata laterally, from one property to another
  sections = sections.map((section) =>{
    return populateLaterally(section, models.metadataModels)
  });
  //cleaning control props
  sections.forEach((section) =>{
    delete section.vInherited;
    delete section.rvInherited;
  });


  callback(null, {errors, sections});
}
