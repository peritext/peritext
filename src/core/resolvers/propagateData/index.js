import {getMetaValue, setMetaValue, hasMeta, findByMetadata, metaStringToCouple, hasResource} from './../../utils/sectionUtils';


function inheritMetadataFromParent(section, sectionTypeModels, sections, parentMetadata){
  if(parentMetadata === undefined){
    return section;
  }

  //inherit meta props
  let inherited = parentMetadata.filter((pmeta) =>{
    let presentInChild = hasMeta(section.metadata, pmeta);
    if(presentInChild){
      return false;
    }else return true;
  });

  let parentKey = getMetaValue(parentMetadata, 'general', 'citeKey');
  section.metadata = section.metadata.concat(inherited.map((meta) =>{
    return Object.assign(meta, {inheritedVerticallyFrom : parentKey})
  }));

  //set final bibType
  let bibType = getMetaValue(section.metadata, 'general', 'bibType');
  if(bibType === 'section'){
    let parentBibType = getMetaValue(parentMetadata, 'general', 'bibType');
    let parentModel = sectionTypeModels.acceptedTypes[parentBibType];
    if(parentModel){
      setMetaValue(section.metadata, 'general', 'bibType', parentModel.childrenType);
    }
  }

  //hierarchical level addition
  let parentLevel = getMetaValue(parentMetadata, 'general', 'hierarchicalLevel');
  let ownLevel = getMetaValue(section.metadata, 'general', 'hierarchicalLevel');
  if(parentLevel && ownLevel){
    section.metadata = setMetaValue(section.metadata, 'general', 'hierarchicalValue', parentLevel + ownLevel)
  }else if (parentLevel){
    section.metadata.push({
      domain : 'general',
      key : 'hierarchicalLevel',
      value : parentLevel + 1
    });
  }else {
    section.metadata.push({
      domain : 'general',
      key : 'hierarchicalLevel',
      value : 1
    });
  }
  return section;
}


function doInheritMetadataFromParent(section, sectionTypeModels, sections){
  if(section.parent && !section.vInherited){
    section.vInherited = true;

    let parent = findByMetadata(sections, 'general', 'citeKey', section.parent);
    //first, make your parent inherit from its parent
    if(!parent.vInherited){
      parent = doInheritMetadataFromParent(section, sectionTypeModels, sections);
    }
    //then inherit yourself from your parent
    return inheritMetadataFromParent(section, sectionTypeModels, sections, parent.metadata);
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


function inheritCustomizersFromParent(section, sections, parentCustomizers, parentKey){
  if(parentCustomizers === undefined){
    return section;
  }else if(section.customizers === undefined){
    section.customizers = Object.assign({}, parentCustomizers);
  }else {
    for(let i in section.customizers){
      if(parentCustomizers[i] !== undefined){
        //if customizer is a string (e.g. : css data) append child data after parent data
        if(typeof section.customizers[i] === 'string'){
          section.customizers[i] = parentCustomizers[i] + '\n\n\n'+ section.customizers[i];
        }else{
          for(let j in parentCustomizers[i]){
            //add customizer from parent (e.g. : template) if not defined in child
            if(section.customizers[i][j] === undefined){
              section.customizers[i][j] = parentCustomizers[i][j]
            }
          }
        }
      }
    }
  }

  return section;
}


function doInheritCustomizersFromParent(section, sections){
  if(section.parent && !section.cInherited){
    section.cInherited = true;
    let parent = findByMetadata(sections, 'general', 'citeKey', section.parent);
    //first, make your parent inherit from its parent
    if(!parent.cInherited){
      parent = doInheritCustomizersFromParent(section, sections);
    }
    //then inherit yourself from your parent
    return inheritCustomizersFromParent(section, sections, parent.customizers, getMetaValue(parent.metadata, 'general', 'citeKey'));
  }else{
    section.cInherited = true;
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
          toInclude.push(Object.assign({}, sp, {value : meta.value}, {inheritedHorizontallyFrom : meta.domain  +'_' + meta.key}));
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
  if(parent){
    //inherit metadata from args
    let inheritedMetadata = parent.metadata;
    noParents.forEach((section) =>{
      section.vInherited = true;
      section = inheritMetadataFromParent(section, models.sectionTypeModels, sections, inheritedMetadata);
    });
    //inherit resources from arguments
    let inheritedResources = parent.resources;
    let parentKey = getMetaValue(inheritedMetadata, 'general', 'citeKey')
    noParents.forEach((section) =>{
      section.rvInherited = true;
      section = inheritResourcesFromParent(section, sections, inheritedResources, parentKey);
    });
    //inherit customizers from arguments
  } else {
    noParents.forEach((section) =>{
      //hierarchical level bootstrapping
      section.metadata.push({
        domain : 'general',
        key : 'hierarchicalLevel',
        value : 1
      });
      section.rvInherited = true;
      section.vInherited = true;
      section.cInherited = true;
    });
  }
  //clean bibType
  sections = sections.map((section) =>{
    let newBibType = getMetaValue(section.metadata, 'general', 'bibType').split('modulo')[1];
    section.metadata = setMetaValue(section.metadata, 'general', 'bibType', newBibType);
    return section;
  });

  //inherit metadata from parents to children
  sections = sections.map((section) =>{
    return doInheritMetadataFromParent(section, models.sectionTypeModels, sections);
  });

  //inherit resources from parents to children
  sections = sections.map((section) =>{
    return doInheritResourcesFromParent(section, sections);
  });

  //inherit customizers form parents to children
  sections = sections.map((section) =>{
    return doInheritCustomizersFromParent(section, sections);
  });

  //inherit metadata laterally, from one property to another
  sections = sections.map((section) =>{
    return populateLaterally(section, models.metadataModels)
  });
  //cleaning control props
  sections.forEach((section) =>{
    delete section.vInherited;
    delete section.cInherited;
    delete section.rvInherited;
  });


  callback(null, {errors, sections});
}
