/**
 * This module converts an fsTree flatfile abstraction to a peritext document representation
 * And it converts aperitext document representation to an fsTree flatfile abstraction
 * @module converters/sectionConverter
 */

import {concatTree} from './concatTree';
import {parseTreeResources} from './parseTreeResources';
import {organizeTree} from './organizeTree';
import {propagateData} from './propagateData';
import {cleanNaiveTree} from './cleanNaiveTree';
import {getResourceModel, serializePropAgainstType} from './../../utils/modelUtils';
import {resolveSectionAgainstModels} from './../../resolvers/resolveSectionAgainstModels';
import {resolveResourcesAgainstModels} from './../../resolvers/resolveResourcesAgainstModels';
import {resolveBindings} from './../../resolvers/resolveContextualizations';
import {markdownToJsAbstraction} from './../markdownConverter';
import {serializeBibTexObject, parseBibNestedValues} from './../../converters/bibTexConverter';

const sectionListToFsTree = (inputSectionList, basePath) =>{
  const sectionList = inputSectionList.map((section)=>{
    const folderTitle = section.citeKey;
    const relPath = (section.root) ? '' : folderTitle;
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
  return root;
};

const serializeMetadata = (metadata, models) => {
  const obj = {};
  Object.keys(metadata).forEach(domain => {
    Object.keys(metadata[domain]).forEach(gKey => {
      const prop = metadata[domain][gKey];
      if (gKey === 'bibType' || !prop.inheritedVerticallyFrom && !prop.inheritedHorizontallyFrom) {
        // format prop name like twitter_title
        const key = domain === 'general' ? gKey : domain + '_' + gKey;
        const model = models.metadataModels[domain][gKey];
        if (model) {
          obj[key] = serializePropAgainstType(prop.value, model.valueType, model);
        } else obj[key] = prop.value;
      }
    });
  });
  obj.bibType = 'peritext' + obj.bibType;
  return serializeBibTexObject(obj);
};

const concatSection = (section, models) =>{
  const metadataStr = serializeMetadata(section.metadata, models);
  return {
    markdownContent: section.markdownContents,
    bibResources: metadataStr,
    customizers: section.customizers,
    citeKey: section.metadata.general.citeKey.value
  };
};

// from documentSectionsList to fsTree
/**
 * Converts a sections' list to a fsTree representation of the resulting sourcedata
 * @param {Object} param - serializing params
 * @param {array} param.sectionList - the list of sections to serialize
 * @param {Object} param.models - the models to use for serializing
 * @param {string} param.basePath - the path to use as basis for determining serializing output paths
 * @return {Object} - returns the filesystem representation of the data
 */
export const serializeDocument = ({document, models, basePath}, callback) =>{
  const sections = Object.keys(document.sections).map(key => document.sections[key]);
  // collect resources and prepare for serialization
  const resources = Object.keys(document.resources)
    .map(key => document.resources[key])
    .filter((resource)=>{
      return !resource.inheritedVerticallyFrom;
    })
    .map((resource) =>{
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
  // collect contextualizers and prepare for serialization
  const contextualizers = Object.keys(document.contextualizers)
    .map(key => document.contextualizers[key])
    .filter((contextualizer)=>{
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
  // merge resources and contextualizers in a collection of entities to be rendered as bibTeX
  const bibResources = resources.concat(contextualizers).map(serializeBibTexObject);
  // const globalMetadata = serializeMetadata(document.metadata, models);
  const fsSections = sections.map(section => {
    return concatSection(section, models);
  });
  // adding resources and contextualizers to first section / root
  fsSections[0].bibResources += bibResources.join('\n\n');
  fsSections[0].root = true;
  return sectionListToFsTree(fsSections, basePath);
};

// from fsTree (returned by any connector) to a documentSectionsList usable in app
/**
 * Parses an fsTree representation and renders a list of sections to be used with peritext exporters or as is
 * @param {Object} params - parsing params
 * @param {Object} params.tree - the input fsTree representation
 * @param {Object} params.parameters - language-related parameters
 * @param {Object} params.parent - a possible existing parent section - to use for inheritance phases - suitable for partial document parsing/re-rendering use cases (like with an editor app)
 * @param {Object} params.models - models to use for parsing the data
 * @param {function(error:error, results: Object)} callback - RCC representation of the contents and parsing errors list for UI
 */
export const parseSection = ({tree, parameters, parent, models}, callback)=> {
  // concat markdown, resources, styles, templates, components, and resolve includes, producing a clean 'dumb tree'
  const {dumbTree, errors: dumbTreeErrors} = concatTree(tree, parameters);
  // parse bibtext to produce resources and metadata props, producing a 'naive tree' of sections
  const {naiveTree, errors: naiveTreeErrors} = parseTreeResources(dumbTree);
  // validate and resolve metadata against their models for all sections
  const {validTree, errors: validTreeErrors} = cleanNaiveTree({validTree: naiveTree}, models);
  // bootstrap errors list
  let errors = dumbTreeErrors.concat(naiveTreeErrors).concat(validTreeErrors);
  // format objects, normalize metadata, and resolve organization statements
  const {document: organizedDocument, errors: documentErrors} = organizeTree({errors, validTree});
  // propagate resources, metadata and customizers vertically (from parents to children sections), metadata lateraly (from metadata models propagation data)
  const {document: richDocument, errors: richErrors} = propagateData({errors: documentErrors, document: organizedDocument, models, parent});
  // resolve data against their models
  const {newResources, newErrors: resErrors} = resolveResourcesAgainstModels(richDocument.resources, models);
  richDocument.resources = newResources;
  errors = errors.concat(richErrors).concat(resErrors);
  // resolve sections against models
  for (const citeKey in richDocument.sections) {
    if (richDocument.sections[citeKey]) {
      const section = richDocument.sections[citeKey];
      const { newErrors: sectionErrors, newSection } = resolveSectionAgainstModels(section, models);
      errors = errors.concat(sectionErrors);
      delete newSection.resources;
      richDocument.sections[citeKey] = newSection;
    }
  }
  // resolve contextualizers nested values
  for (const citeKey in richDocument.contextualizers) {
    if (richDocument.contextualizers[citeKey]) {
      richDocument.contextualizers[citeKey] = parseBibNestedValues(richDocument.contextualizers[citeKey]);
    }
  }
  // parse markdown contents and organize them as blocks lists, and parse+resolve contextualization objects
  richDocument.contextualizations = {};
  for (const citeKey in richDocument.sections) {
    if (richDocument.sections[citeKey]) {
      const {
        errors: sectionErrors,
        section,
        contextualizations,
        contextualizers
      } = markdownToJsAbstraction(richDocument.sections[citeKey], parameters);
      errors = errors.concat(sectionErrors);
      richDocument.sections[citeKey] = section;
      richDocument.contextualizers = Object.assign(richDocument.contextualizers, contextualizers);
      richDocument.contextualizations = Object.assign(richDocument.contextualizations, contextualizations);
    }
  }
  // resolve contextualizers statements against their models
  const {
    errors: globalErrors,
    document: newDocument
  } = resolveBindings({document: richDocument, models});
  const document = newDocument;
  errors = errors.concat(globalErrors).filter(error => error !== null);
  // update summary and document metadata with root
  document.metadata = Object.assign({}, document.sections[document.summary[0]].metadata);
  document.customizers = document.sections[document.summary[0]].customizers;
  document.forewords = document.sections[document.summary[0]];
  document.summary = document.summary.slice(1);
  callback(null, {
    errors,
    document
  });
};
