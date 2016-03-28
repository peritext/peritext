import {getMetaValue, setMetaValue, hasMeta, findByMetadata, metaStringToCouple, hasResource} from './../../utils/sectionUtils';


function inheritMetadataFromParent(section, sectionTypeModels, sections, parentMetadata){
  if(parentMetadata === undefined){
    return section;
  }

  //inherit metadata props
  //discriminated inedit propert
  const inherited = parentMetadata.filter((pmeta) =>{
    if(hasMeta(section.metadata, pmeta)){
      return false;
    }else return true;
  });

  const parentKey = getMetaValue(parentMetadata, 'general', 'citeKey');
  section.metadata = section.metadata.concat(inherited.map((meta) =>{
    return Object.assign(meta, {inheritedVerticallyFrom : {domain : 'general', key : 'citeKey', value : parentKey}})
  }));

  //set final bibType
  const bibType = getMetaValue(section.metadata, 'general', 'bibType');
  if(bibType === 'section'){
    const parentBibType = getMetaValue(parentMetadata, 'general', 'bibType');
    const parentModel = sectionTypeModels.acceptedTypes[parentBibType];
    if(parentModel){
      setMetaValue(section.metadata, 'general', 'bibType', parentModel.childrenType);
    }
  }

  //set hierarchical level (parent + 1 or parent + own level)
  const parentLevel = getMetaValue(parentMetadata, 'general', 'hierarchicalLevel');
  const ownLevel = getMetaValue(section.metadata, 'general', 'hierarchicalLevel');
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
  if(section.parent && !section.metadataInherited){
    section.metadataInherited = true;

    let parent = findByMetadata(sections, 'general', 'citeKey', section.parent);
    //first, make your parent inherit from its parent
    if(!parent.metadataInherited){
      parent = doInheritMetadataFromParent(section, sectionTypeModels, sections);
    }
    //then inherit yourself from your parent
    return inheritMetadataFromParent(section, sectionTypeModels, sections, parent.metadata);
  }else{
    section.metadataInherited = true;
    return section;
  }
}


function inheritResourcesFromParent(section, sections, parentResources, parentKey){
  if(parentResources === undefined){
    return section;
  }

  //inherit meta props - take anything that you don't already have
  const inherited = parentResources.filter((presource) =>{
    return !hasResource(section.resources, presource);
  });

  section.resources = section.resources.concat(inherited.map((meta) =>{
    return Object.assign(meta, {inheritedVerticallyFrom : parentKey})
  }));
  return section;
}


function doInheritResourcesFromParent(section, sections){
  if(section.parent && !section.resourcesInherited){
    section.resourcesInherited = true;
    let parent = findByMetadata(sections, 'general', 'citeKey', section.parent);
    //first, make your parent inherit from its parent
    if(!parent.resourcesInherited){
      parent = doInheritResourcesFromParent(section, sections);
    }
    //then inherit yourself from your parent
    return inheritResourcesFromParent(section, sections, parent.resources, getMetaValue(parent.metadata, 'general', 'citeKey'));
  }else{
    section.resourcesInherited = true;
    return section;
  }
}

function inheritContextualizersFromParent(section, sections, parentContextualizers, parentKey){
  if(parentContextualizers === undefined){
    return section;
  }
  //inherit context props - take anything that you don't already have
  const inherited = parentContextualizers.filter((presource) =>{
    return !hasResource(section.contextualizers, presource);
  });

  section.contextualizers = section.contextualizers.concat(inherited.map((meta) =>{
    return Object.assign(meta, {inheritedVerticallyFrom : parentKey})
  }));
  return section;
}


function doInheritContextualizersFromParent(section, sections){
  if(section.parent && !section.contextualizersInherited){
    section.contextualizersInherited = true;
    let parent = findByMetadata(sections, 'general', 'citeKey', section.parent);
    //first, make your parent inherit from its parent
    if(!parent.contextualizersInherited){
      parent = doInheritResourcesFromParent(section, sections);
    }
    //then inherit yourself from your parent
    return inheritContextualizersFromParent(section, sections, parent.contextualizers, getMetaValue(parent.metadata, 'general', 'citeKey'));
  }else{
    section.contextualizersInherited = true;
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
  if(section.parent && !section.customizersInherited){
    section.customizersInherited = true;
    let parent = findByMetadata(sections, 'general', 'citeKey', section.parent);
    //first, make your parent inherit from its parent
    if(!parent.customizersInherited){
      parent = doInheritCustomizersFromParent(section, sections);
    }
    //then inherit yourself from your parent
    return inheritCustomizersFromParent(section, sections, parent.customizers, getMetaValue(parent.metadata, 'general', 'citeKey'));
  }else{
    section.customizersInherited = true;
    return section;
  }
}



function populateLaterally(section, models){
  let toInclude = [],
      model;


  section.metadata.forEach((meta) => {
    model = models[meta.domain][meta.key];
    if(model){
      const spreaded = model.propagatesTo.map(metaStringToCouple);
      spreaded.forEach((sp) =>{
        const existantProp = hasMeta(section.metadata, sp);
        if(!existantProp){
          toInclude.push(Object.assign({}, sp, {value : meta.value}, {inheritedHorizontallyFrom : {domain : meta.domain,   key : meta.key}}));
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
    let inheritedMetadata = parent.metadata,
        inheritedResources = parent.resources,
        inheritedContextualizations = parent.contextualizers,
        parentKey = getMetaValue(inheritedMetadata, 'general', 'citeKey');

    noParents.forEach((section) =>{
      section.metadataInherited = true;
      section.resourcesInherited = true;
      section.contextualizersInherited = true;
      section = inheritResourcesFromParent(section, sections, inheritedResources, parentKey);
      section = inheritContextualizersFromParent(section, sections, inheritedContextualizations, parentKey);
      section = inheritMetadataFromParent(section, models.sectionTypeModels, sections, inheritedMetadata);
    });
    //inherit resources from arguments

  } else {
    noParents.forEach((section) =>{
      //hierarchical level bootstrapping
      section.metadata.push({
        domain : 'general',
        key : 'hierarchicalLevel',
        value : 1
      });
      section.resourcesInherited = true;
      section.metadataInherited = true;
      section.customizersInherited = true;
      section.contextualizersInherited = true;
    });
  }
  //clean bibType
  sections = sections.map((section) =>{
    const newBibType = getMetaValue(section.metadata, 'general', 'bibType').split('modulo')[1];
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

  //inherit contextualizers from parents to children
  sections = sections.map((section) =>{
    return doInheritContextualizersFromParent(section, sections);
  });

  //inherit customizers form parents to children
  sections = sections.map((section) =>{
    return doInheritCustomizersFromParent(section, sections);
  });

  //inherit metadata laterally, from one property to another
  sections = sections.map((section) =>{
    return populateLaterally(section, models.metadataModels)
  });

  //cleaning control properties
  sections.forEach((section) =>{
    delete section.metadataInherited;
    delete section.customizersInherited;
    delete section.resourcesInherited;
    delete section.contextualizersInherited;
  });


  callback(null, {errors, sections});
}