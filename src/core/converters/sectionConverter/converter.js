import {waterfall, map as asyncMap} from 'async';

import {concatTree} from './../../resolvers/concatTree';
import {parseTreeResources} from './../../resolvers/parseTreeResources';
import {organizeTree} from './../../resolvers/organizeTree';
import {propagateData} from './../../resolvers/propagateData';
import {validateResources} from './../../validators/sectionValidator';
import {cleanNaiveTree} from './../../resolvers/cleanNaiveTree';
import {resolveSectionAgainstModels} from './../../resolvers/resolveSectionAgainstModels';
import {markdownToContentsList} from './../markdownConverter'
import {resolveContextualizations} from './../../resolvers/resolveContextualizations'
//from documentSectionsList to fsTree
export function serializeSection(section, callback){

}

//from fsTree (returned by any connector) to a documentSectionsList usable in app
export function parseSection({tree, parameters, parent, models}, callback){
  waterfall([
    //concat markdown, resources, styles, templates, components, and resolve includes, producing a clean 'dumb tree'
    function(cb){
      concatTree(tree, parameters, cb);
    },
      //parse bibtext to produce resources and metadata props, producing a 'naive tree' of sections
    function(dumbTree, cb){
      parseTreeResources(dumbTree, cb);
    },
    //validate and resolve metadata against their models for all sections
    function(naiveTree, cb){
      cleanNaiveTree({validTree:naiveTree}, models, cb);
    },
    //format objects, normalize metadata, and resolve organization statements
    function({errors, validTree}, cb){
      organizeTree({errors, validTree}, cb);
    },
    //propagate resources, metadata and customizers vertically (from parents to children sections), metadata lateraly (from metadata models propagation data)
    function({errors, sections}, cb){
      propagateData({errors, sections, models, parent}, cb);
    },
    //validate each resource against their models to produce errors and warnings from parsing
    function({errors, sections}, cb){

      asyncMap(sections, function(section, callback){
        validateResources(section, models, callback);
      }, function(err, results){
        let sections = results.map((result)=>{
          return result.section;
        });
        errors = results.reduce((total, result) =>{
          return errors.concat(result.errors);
        }, errors);
        cb(err, {errors, sections});
      });
    },
    //resolve section resources and metadata against their models
    function({errors, sections}, cb){
      asyncMap(sections, function(section, callback){
        resolveSectionAgainstModels(section, models, callback);
      }, function(err, results){
        let sections = results.map((result)=>{
          return result.section;
        });
        errors = results.reduce((total, result) =>{
          return errors.concat(result.errors);
        }, errors);
        cb(err, {errors, sections});
      });
    },
    //todo : substitute and populate templates
    //parse markdown contents and organize them as blocks lists, and parse+resolve contextualization objects
    function({errors, sections}, cb){
      asyncMap(sections, function(section, callback){
        markdownToContentsList(section, callback);
      }, function(err, results){
        let sections = results.map((result)=>{
          return result.section;
        });
        errors = results.reduce((total, result) =>{
          return errors.concat(result.errors);
        }, errors);
        cb(err, {errors, sections});
      });
    },
    //(todo/ongoing) : validate contextualization objects against section resources availability + contextualizations models
    function({errors, sections}, cb){
      asyncMap(sections, function(section, callback){
        resolveContextualizations({section, models}, callback);
      }, function(err, results){
        let sections = results.map((result)=>{
          return result.section;
        });
        errors = results.reduce((total, result) =>{
          return errors.concat(result.errors);
        }, errors);
        cb(err, {errors, sections});
      });
    }
    //all done - return a documentTree to use as data state in the app
  ], callback);
}
