/*
 * This module converts an fsTree flatfile abstraction to a documentTree modulo document abstraction
 */

import {waterfall, map as asyncMap} from 'async';

import {concatTree} from './../../resolvers/concatTree';
import {parseTreeResources} from './../../resolvers/parseTreeResources';
import {organizeTree} from './../../resolvers/organizeTree';
import {propagateData} from './../../resolvers/propagateData';
import {validateResources} from './../../validators/sectionValidator';
import {getResourceModel, serializePropAgainstType} from './../../utils/modelUtils';
import {getMetaValue} from './../../utils/sectionUtils';
import {cleanNaiveTree} from './../../resolvers/cleanNaiveTree';
import {resolveSectionAgainstModels} from './../../resolvers/resolveSectionAgainstModels';
import {markdownToContentsList} from './../markdownConverter';
import {resolveContextualizations} from './../../resolvers/resolveContextualizations';
import {serializeBibTexObject} from './../../converters/bibTexConverter';


function concatSection({section, models}, callback) {
  const genuineMeta = section.metadata.filter((metadata)=>{
    return !metadata.inheritedVerticallyFrom && !metadata.inheritedHorizontallyFrom;
  });
  const metadata = genuineMeta.reduce((obj, thatMetadata)=>{
    const key = (thatMetadata.domain === 'general') ? thatMetadata.key : thatMetadata.domain + '_' + thatMetadata.key;
    const model = models.metadataModels[thatMetadata.domain][thatMetadata.key];
    if (model) {
      obj[key] = serializePropAgainstType(thatMetadata.value, model.valueType, model);
    } else obj[key] = thatMetadata.value;
    return obj;
  }, {});
  metadata.bibType = 'modulo' + metadata.bibType;
  let root;
  if (section.parent) {
    metadata.parent = section.parent;
  }else {
    root = true;
  }

  if (section.after) {
    metadata.after = section.after;
  }

  const resources = section.resources.filter((resource)=>{
    return !resource.inheritedVerticallyFrom;
  }).map((resource) =>{
    const modelList = getResourceModel(resource.bibType, models.resourceModels);
    if (modelList) {
      let model;
      return Object.keys(resource).reduce((obj, key) =>{
        if (resource[key] !== undefined) {
          model = modelList.properties.find((thatModel)=>{
            return thatModel.key === key;
          });
          if (model) {
            obj[key] = serializePropAgainstType(resource[key], model.valueType, model);
          } else obj[key] = resource[key];
        }

        return obj;
      }, {});
    }
    return resource;
  });

  const contextualizers = section.contextualizers.filter((contextualizer)=>{
    return !contextualizer.describedInline;
  }).map((contextualizer)=>{
    const modelList = getResourceModel(contextualizer.type, models.contextualizerModels);
    if (modelList) {
      let model;
      const cont = Object.keys(contextualizer).reduce((obj, key) =>{
        if (contextualizer[key] !== undefined) {
          model = modelList.properties.find((thatModel)=>{
            return thatModel.key === key;
          });

          if (model) {
            obj[key] = serializePropAgainstType(contextualizer[key], model.valueType, model);
          } else obj[key] = contextualizer[key];
        }
        return obj;
      }, {});
      cont.bibType = 'contextualizer';
      return cont;
    }
    contextualizer.bibType = 'contextualizer';
    return contextualizer;
  });

  const bibResources = [metadata].concat(resources).concat(contextualizers);

  asyncMap(bibResources, serializeBibTexObject, function(err, inputBibStr) {
    let bibStr;
    if (inputBibStr) {
      bibStr = inputBibStr.join('\n\n');
    }
    callback(err, {
      markdownContent: section.markdownContents,
      bibResources: bibStr,
      customizers: section.customizers,
      citeKey: getMetaValue(section.metadata, 'general', 'citeKey'),
      root
    });
  });
}

function sectionListToFsTree(inputSectionList, basePath, callback) {
  const sectionList = inputSectionList.map((section)=>{
    const folderTitle = section.citeKey;
    const relPath = (section.root) ? basePath : basePath + '/' + folderTitle;
    const children = [{
      type: 'file',
      extname: '.md',
      name: 'contents.md',
      path: relPath + '/contents.md',
      'stringContents': section.markdownContents
    },
      {
        type: 'file',
        extname: '.bib',
        name: 'resources.bib',
        path: relPath + '/resources.bib',
        'stringContents': section.bibResources
      }
    // todo: customizers
    ];
    const folder = {
      type: 'folder',
      name: section.citeKey,
      extname: '',
      path: relPath + '/',
      root: section.root,
      children
    };

    return folder;
  });

  const root = sectionList.find((section)=>{
    return section.root;
  });
  const children = sectionList.filter((section)=>{
    return !section.root;
  });
  delete root.root;
  root.children = root.children.concat(children);
  callback(null, root);
}

// from documentSectionsList to fsTree
export function serializeSectionList({sectionList, models, basePath}, callback) {
  waterfall([
    function(cb) {
      asyncMap(sectionList, function(section, callbck) {
        concatSection({section, models}, callbck);
      }, function(err, concatSections) {
        cb(err, concatSections);
      });
    },
    function(sections, cb) {
      sectionListToFsTree(sections, basePath, cb);
    }
    // all done - return a fsTree
  ], callback);
}

// from fsTree (returned by any connector) to a documentSectionsList usable in app
export function parseSection({tree, parameters, parent, models}, callback) {
  waterfall([
    // concat markdown, resources, styles, templates, components, and resolve includes, producing a clean 'dumb tree'
    function(cb) {
      //  console.log(tree);
      concatTree(tree, parameters, cb);
    },
      // parse bibtext to produce resources and metadata props, producing a 'naive tree' of sections
    function(dumbTree, cb) {
      parseTreeResources(dumbTree, cb);
    },
    // validate and resolve metadata against their models for all sections
    function(naiveTree, cb) {
      cleanNaiveTree({validTree: naiveTree}, models, cb);
    },
    // format objects, normalize metadata, and resolve organization statements
    function({errors, validTree}, cb) {
      organizeTree({errors, validTree}, cb);
    },
    // propagate resources, metadata and customizers vertically (from parents to children sections), metadata lateraly (from metadata models propagation data)
    function({errors, sections}, cb) {
      propagateData({errors, sections, models, parent}, cb);
    },
    // validate each resource against their models to produce errors and warnings from parsing
    function({errors, sections}, cb) {

      asyncMap(sections, function(section, cback) {
        validateResources(section, models, cback);
      }, function(err, results) {
        const newSections = results.map((result)=>{
          return result.section;
        });
        const newErrors = results.reduce((total, result) =>{
          return errors.concat(result.errors);
        }, errors);
        cb(err, {errors: newErrors, sections: newSections});
      });
    },
    // resolve section resources and metadata against their models
    function({errors, sections}, cb) {
      asyncMap(sections, function(section, cback) {
        resolveSectionAgainstModels(section, models, cback);
      }, function(err, results) {
        const newSections = results.map((result)=>{
          return result.section;
        });
        const newErrors = results.reduce((total, result) =>{
          return errors.concat(result.errors);
        }, errors);
        cb(err, {errors: newErrors, sections: newSections});
      });
    },
    // todo: substitute and populate templates
    // parse markdown contents and organize them as blocks lists, and parse+resolve contextualization objects
    function({errors, sections}, cb) {
      asyncMap(sections, function(section, cback) {
        markdownToContentsList(section, cback);
      }, function(err, results) {
        const newSections = results.map((result)=>{
          return result.section;
        });
        const newErrors = results.reduce((total, result) =>{
          return errors.concat(result.errors);
        }, errors);
        cb(err, {errors: newErrors, sections: newSections});
      });
    },
    // (todo/ongoing): validate contextualization objects against section resources availability + contextualizations models
    function({errors, sections}, cb) {
      asyncMap(sections, function(section, cback) {
        resolveContextualizations({section, models}, cback);
      }, function(err, results) {
        const newSections = results.map((result)=>{
          return result.section;
        });
        const newErrors = results.reduce((total, result) =>{
          return errors.concat(result.errors);
        }, errors);
        cb(err, {errors: newErrors, sections: newSections});
      });
    }
    // all done - return a documentTree to use as data state in the app
  ], callback);
}
