import {concatTree} from './concatTree.js';
import {parseTreeResources} from './parseTreeResources.js';
import {organizeTree} from './organizeTree.js';
import {propagateMetadata} from './propagateMetadata.js';
import {validateAndFilterNaiveTree} from './../../validators/sectionMetadataValidator';
import {waterfall} from 'async';

//from documentSectionsList to fsTree
export function serializeSection(section, callback){

}

//from fsTree to documentSectionsList
export function parseSection({tree, parameters, inheritedMetadata, models}, callback){
  waterfall([
      //concat resources and resolve includes, producing a 'dumb tree'
    function(cb){
      concatTree(tree, parameters, cb);
    },
      //parse bibtext producing a 'naive tree'
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
    //apply metadata propagation lateraly (models) and vertically (hierarchically)
    function({errors, sections}, cb){
      propagateMetadata({errors, sections, models, inheritedMetadata}, cb);
    }
    //parse contents, templates, and build contextualization objects
    //produce a documentTree to use as state
  ], callback);
}
