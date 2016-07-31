/**
 * This module converts an fsTree flatfile abstraction to a documentTree peritext document abstraction
 * @module converters/sectionConverter
 */

import {waterfall, map as asyncMap} from 'async';
import {concatTree} from './concatTree';
import {parseTreeResources} from './parseTreeResources';
import {organizeTree} from './organizeTree';
import {propagateData} from './propagateData';
import {cleanNaiveTree} from './cleanNaiveTree';
import {validateResources} from './../../validators/sectionValidator';
import {getResourceModel, serializePropAgainstType} from './../../utils/modelUtils';
import {getMetaValue} from './../../utils/sectionUtils';
import {resolveSectionAgainstModels} from './../../resolvers/resolveSectionAgainstModels';
import {resolveBindings} from './../../resolvers/resolveContextualizations';
import {markdownToJsAbstraction} from './../markdownConverter';
import {serializeBibTexObject} from './../../converters/bibTexConverter';

const concatSection = ({section, models}, callback) =>{
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
  metadata.bibType = 'peritext' + metadata.bibType;
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
    return contextualizer && !contextualizer.describedInline;
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

  asyncMap(bibResources, serializeBibTexObject, (err, inputBibStr) =>{
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
};

const sectionListToFsTree = (inputSectionList, basePath, callback) =>{
  const sectionList = inputSectionList.map((section)=>{
    const folderTitle = section.citeKey;
    const relPath = (section.root) ? '' : '/' + folderTitle;
    const children = [
      {
        type: 'file',
        extname: '.md',
        name: 'contents.md',
        path: relPath + '/contents.md',
        'stringContents': section.markdownContent
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
      type: 'directory',
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
  root.name = basePath.split('/').pop();
  callback(null, root);
};

// from documentSectionsList to fsTree
/**
 * Converts a sections' list to a fsTree representation of the resulting sourcedata
 * @param {Object} param - serializing params
 * @param {array} param.sectionList - the list of sections to serialize
 * @param {Object} param.models - the models to use for serializing
 * @param {string} param.basePath - the path to use as basis for determining serializing output paths
 * @param {function(error:error, fsTree: Object)} callback - provides the filesystem representation of the data
 */
export const serializeSectionList = ({sectionList, models, basePath}, callback) =>{
  waterfall([
    (cb) =>{
      asyncMap(sectionList, (section, callbck) =>{
        concatSection({section, models}, callbck);
      }, (err, concatSections) =>{
        cb(err, concatSections);
      });
    },
    (sections, cb) =>{
      sectionListToFsTree(sections, basePath, cb);
    }
    // all done - return a fsTree
  ], callback);
};

// from fsTree (returned by any connector) to a documentSectionsList usable in app
/**
 * Parses an fsTree representation and renders a list of sections to be used with peritext exporters or as is
 * @param {Object} params - parsing params
 * @param {Object} params.tree - the input fsTree representation
 * @param {Object} params.parameters - language-related parameters
 * @param {Object} params.parent - a possible existing parent section - to use for inheritance phases - suitable for partial document parsing/re-rendering use cases (like with an editor app)
 * @param {Object} params.models - models to use for parsing the data
 * @param {function(error:error, sections: array)} callback - provides an array containing the resources
 */
export const parseSection = ({tree, parameters, parent, models}, callback)=> {
  waterfall([
    // concat markdown, resources, styles, templates, components, and resolve includes, producing a clean 'dumb tree'
    (cb) =>{
      //  console.log(tree);
      concatTree(tree, parameters, cb);
    },
      // parse bibtext to produce resources and metadata props, producing a 'naive tree' of sections
    (dumbTree, cb) =>{
      parseTreeResources(dumbTree, cb);
    },
    // validate and resolve metadata against their models for all sections
    (naiveTree, cb) =>{
      cleanNaiveTree({validTree: naiveTree}, models, cb);
    },
    // format objects, normalize metadata, and resolve organization statements
    ({errors, validTree}, cb) =>{
      organizeTree({errors, validTree}, cb);
    },
    // propagate resources, metadata and customizers vertically (from parents to children sections), metadata lateraly (from metadata models propagation data)
    ({errors, sections}, cb) =>{
      propagateData({errors, sections, models, parent}, cb);
    },
    // validate each resource against their models to produce errors and warnings from parsing
    ({errors, sections}, cb) =>{

      asyncMap(sections, (section, cback) =>{
        validateResources(section, models, cback);
      }, (err, results) =>{
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
    ({errors, sections}, cb) =>{
      asyncMap(sections, (section, cback) =>{
        resolveSectionAgainstModels(section, models, cback);
      }, (err, results) =>{
        const newSections = results.map((result)=>{
          return result.section;
        });
        const newErrors = results.reduce((total, result) =>{
          return errors.concat(result.errors);
        }, errors);
        cb(err, {errors: newErrors, sections: newSections});
      });
    },
    // parse markdown contents and organize them as blocks lists, and parse+resolve contextualization objects
    ({errors, sections}, cb) =>{
      asyncMap(sections, (section, cback) =>{
        markdownToJsAbstraction(section, parameters, cback);
      }, (err, results) =>{
        const newSections = results.map((result)=>{
          return result.section;
        });
        const newErrors = results.reduce((total, result) =>{
          return errors.concat(result.errors);
        }, errors);
        cb(err, {errors: newErrors, sections: newSections});
      });
    },
    // resolve contextualizers statements with their models
    ({errors, sections}, cb) =>{
      asyncMap(sections, (section, cback) =>{
        resolveBindings({section, models}, cback);
      }, (err, results) =>{
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
};
