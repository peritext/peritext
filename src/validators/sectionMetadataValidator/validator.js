import {map as asyncMap} from 'async';

import {getMetaValue, filterResources} from './../../utils/sectionUtils';
import {getResourceModel} from './../../utils/modelUtils';

export function validateAndFilterNaiveTree({errors=[], validTree}, models, callback){
  let metadata;
  let naiveTree = Object.assign({}, validTree);

  const hasResources = naiveTree && naiveTree.resources;
  if(hasResources){
    naiveTree.resources = naiveTree.resources.filter(function(res, i){
      //catch metadata
      let validated;
      for(var type in models.sectionTypeModels.acceptedTypes){

        if(res.bibType === 'modulo'+type){
          metadata = res;
          return false;
        }
      }

      if(!validated){
        //verify that the resource type are known
        for(var type in models.resourceModels.individual){
          if(res.bibType === type){
            return true;
          }
        }
      }
      //if not validated, record error and don't take resource
      if(!validated){
        errors.push(new Error('could not find resource type ' + type.bibType + ' in modulo models for folder ' + naiveTree.name));
        return false;
      }else{
        return true;
      }
    });
  }
  if(metadata === undefined && naiveTree.name.charAt(0) !== '_'){
    errors.push(new Error ('no metadata specified for the folder '+ naiveTree.name));
    errors = (errors.length > 0)?errors.reverse():null;
    return callback(null, {errors, validTree :  undefined});
  }else if(naiveTree.children){
    // console.log('naive tree has children ', naiveTree.children.length);
    asyncMap(naiveTree.children, function(child, cb){
      // console.log('child : ' , child);
      validateAndFilterNaiveTree({validTree : child}, models, cb);
    }, function(err, results){

      //filter valid children tree leaves
      let children = results
                      .filter((result)=>{
                        return result.validTree !== undefined;
                      })
                      .map((result) =>{
                        return result.validTree
                      });

      errors = results.reduce((errors, result)=>{
        return errors.concat(result.errors);
      }, errors);
      return callback(null, {errors, validTree : Object.assign({}, naiveTree, {metadata}, {children})});
    });
  }else{
    // console.log('returning default ', naiveTree.name);
    errors = (errors.length > 0)?errors.reverse():null;
    return callback(null, {errors, validTree : Object.assign({}, naiveTree, {metadata})});
  }
}

export function validateSection(section, models, callback){
  const errors = [];
  //validate metadata
  section.resources.forEach((resource) =>{
    //validate resources unicity
    let other = filterResources(section.resources, 'citeKey', resource.citeKey);
    if(other.length > 1){
      errors.push(new Error('Resource ID ', resource.citeKey, 'is not unique for section ', getMetaValue(section.metadata, 'general', 'citeKey')))
    }
    //validate resources models
    let model = getResourceModel(getMetaValue(section.metadata, 'general', 'bibType'), models.resourceModels);
  });




  return callback(null, {errors, section});
}
