import {concatTree} from './concatTree.js';
import {parseTreeResources} from './parseTreeResources.js';
import {organizeTree} from './organizeTree.js';
import {propagateData} from './propagateMetadata.js';
import {validateAndFilterNaiveTree, validateSection} from './../../validators/sectionMetadataValidator';
import {waterfall, map as asyncMap} from 'async';

//from documentSectionsList to fsTree
export function serializeSection(section, callback){

}

//from fsTree (returned by any connector) to a documentSectionsList usable in app
export function parseSection({tree, parameters, parent, models}, callback){
  waterfall([
    //concat markdown, resources, styles, templates, components, and resolve includes, producing a 'dumb tree'
    function(cb){
      concatTree(tree, parameters, cb);
    },
      //parse bibtext, and refactor styles, templates, components, producing a 'naive tree' of sections
    function(dumbTree, cb){
      parseTreeResources(dumbTree, cb);
    },
    //validate metadata for all resources
    function(naiveTree, cb){
      validateAndFilterNaiveTree({validTree:naiveTree}, models, cb);
    },
    //format objects, normalize metadata, and resolve organization statements
    function({errors, validTree}, cb){
      organizeTree({errors, validTree}, cb);
    },
    //propagate metadata propagation lateraly (models) and vertically (hierarchically)
    //propagate resources vertically
    function({errors, sections}, cb){
      propagateData({errors, sections, models, parent}, cb);
    },
    //todo : validate and resolve each resource against their models to produce errors and warnings at parsing
    function({errors, sections}, cb){
      asyncMap(sections, function(section, callback){
        validateSection(section, models, callback);
      }, function(err, results){
        let sections = results.map((result)=>{
          return result.section;
        });
        errors = results.reduce((total, result) =>{
          return errors.concat(result.errors);
        }, errors);
        callback(err, {errors, sections});
      });
    }
    //todo : substitute and populate markdown templates calls against templates resources
    //todo : parse markdown contents, and build contextualization objects
    //produce a documentTree to use as state
  ], callback);
}
