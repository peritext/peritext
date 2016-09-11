'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseSection = exports.serializeSectionList = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; }; /**
                                                                                                                                                                                                                                                   * This module converts an fsTree flatfile abstraction to a documentTree peritext document abstraction
                                                                                                                                                                                                                                                   * @module converters/sectionConverter
                                                                                                                                                                                                                                                   */

var _async = require('async');

var _concatTree2 = require('./concatTree');

var _parseTreeResources2 = require('./parseTreeResources');

var _organizeTree2 = require('./organizeTree');

var _propagateData2 = require('./propagateData');

var _cleanNaiveTree2 = require('./cleanNaiveTree');

var _modelUtils = require('./../../utils/modelUtils');

var _resolveSectionAgainstModels = require('./../../resolvers/resolveSectionAgainstModels');

var _resolveResourcesAgainstModels = require('./../../resolvers/resolveResourcesAgainstModels');

var _resolveContextualizations = require('./../../resolvers/resolveContextualizations');

var _markdownConverter = require('./../markdownConverter');

var _bibTexConverter = require('./../../converters/bibTexConverter');

var concatSection = function concatSection(_ref, callback) {
  var section = _ref.section;
  var models = _ref.models;

  var genuineMeta = section.metadata.filter(function (metadata) {
    return !metadata.inheritedVerticallyFrom && !metadata.inheritedHorizontallyFrom;
  });
  var metadata = genuineMeta.reduce(function (obj, thatMetadata) {
    var key = thatMetadata.domain === 'general' ? thatMetadata.key : thatMetadata.domain + '_' + thatMetadata.key;
    var model = models.metadataModels[thatMetadata.domain][thatMetadata.key];
    if (model) {
      obj[key] = (0, _modelUtils.serializePropAgainstType)(thatMetadata.value, model.valueType, model);
    } else obj[key] = thatMetadata.value;
    return obj;
  }, {});
  metadata.bibType = 'peritext' + metadata.bibType;
  var root = void 0;
  if (section.parent) {
    metadata.parent = section.parent;
  } else {
    root = true;
  }

  if (section.after) {
    metadata.after = section.after;
  }

  var resources = section.resources.filter(function (resource) {
    return !resource.inheritedVerticallyFrom;
  }).map(function (resource) {
    var modelList = (0, _modelUtils.getResourceModel)(resource.bibType, models.resourceModels);
    if (modelList) {
      var _ret = function () {
        var model = void 0;
        return {
          v: Object.keys(resource).reduce(function (obj, key) {
            if (resource[key] !== undefined) {
              model = modelList.properties.find(function (thatModel) {
                return thatModel.key === key;
              });
              if (model) {
                obj[key] = (0, _modelUtils.serializePropAgainstType)(resource[key], model.valueType, model);
              } else obj[key] = resource[key];
            }

            return obj;
          }, {})
        };
      }();

      if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
    }
    return resource;
  });

  var contextualizers = section.contextualizers.filter(function (contextualizer) {
    return contextualizer && !contextualizer.describedInline;
  }).map(function (contextualizer) {
    var modelList = (0, _modelUtils.getResourceModel)(contextualizer.type, models.contextualizerModels);
    if (modelList) {
      var _ret2 = function () {
        var model = void 0;
        var cont = Object.keys(contextualizer).reduce(function (obj, key) {
          if (contextualizer[key] !== undefined) {
            model = modelList.properties.find(function (thatModel) {
              return thatModel.key === key;
            });

            if (model) {
              obj[key] = (0, _modelUtils.serializePropAgainstType)(contextualizer[key], model.valueType, model);
            } else obj[key] = contextualizer[key];
          }
          return obj;
        }, {});
        cont.bibType = 'contextualizer';
        return {
          v: cont
        };
      }();

      if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
    }
    contextualizer.bibType = 'contextualizer';
    return contextualizer;
  });

  var bibResources = [metadata].concat(resources).concat(contextualizers);

  (0, _async.map)(bibResources, _bibTexConverter.serializeBibTexObject, function (err, inputBibStr) {
    var bibStr = void 0;
    if (inputBibStr) {
      bibStr = inputBibStr.join('\n\n');
    }
    callback(err, {
      markdownContent: section.markdownContents,
      bibResources: bibStr,
      customizers: section.customizers,
      citeKey: section.metadata.general.citeKey.value,
      root: root
    });
  });
};

var sectionListToFsTree = function sectionListToFsTree(inputSectionList, basePath, callback) {
  var sectionList = inputSectionList.map(function (section) {
    var folderTitle = section.citeKey;
    var relPath = section.root ? '' : '/' + folderTitle;
    var children = [{
      type: 'file',
      extname: '.md',
      name: 'contents.md',
      path: relPath + '/contents.md',
      'stringContents': section.markdownContent
    }, {
      type: 'file',
      extname: '.bib',
      name: 'resources.bib',
      path: relPath + '/resources.bib',
      'stringContents': section.bibResources
    }
    // todo: customizers
    ];
    var folder = {
      type: 'directory',
      name: section.citeKey,
      extname: '',
      path: relPath + '/',
      root: section.root,
      children: children
    };
    return folder;
  });

  var root = sectionList.find(function (section) {
    return section.root;
  });
  var children = sectionList.filter(function (section) {
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
var serializeSectionList = exports.serializeSectionList = function serializeSectionList(_ref2, callback) {
  var sectionList = _ref2.sectionList;
  var models = _ref2.models;
  var basePath = _ref2.basePath;

  (0, _async.waterfall)([function (cb) {
    (0, _async.map)(sectionList, function (section, callbck) {
      concatSection({ section: section, models: models }, callbck);
    }, function (err, concatSections) {
      cb(err, concatSections);
    });
  }, function (sections, cb) {
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
 * @param {function(error:error, results: Object)} callback - RCC representation of the contents and parsing errors list for UI
 */
var parseSection = exports.parseSection = function parseSection(_ref3, callback) {
  var tree = _ref3.tree;
  var parameters = _ref3.parameters;
  var parent = _ref3.parent;
  var models = _ref3.models;

  // concat markdown, resources, styles, templates, components, and resolve includes, producing a clean 'dumb tree'

  var _concatTree = (0, _concatTree2.concatTree)(tree, parameters);

  var dumbTree = _concatTree.dumbTree;
  var dumbTreeErrors = _concatTree.errors;
  // parse bibtext to produce resources and metadata props, producing a 'naive tree' of sections

  var _parseTreeResources = (0, _parseTreeResources2.parseTreeResources)(dumbTree);

  var naiveTree = _parseTreeResources.naiveTree;
  var naiveTreeErrors = _parseTreeResources.errors;
  // validate and resolve metadata against their models for all sections

  var _cleanNaiveTree = (0, _cleanNaiveTree2.cleanNaiveTree)({ validTree: naiveTree }, models);

  var validTree = _cleanNaiveTree.validTree;
  var validTreeErrors = _cleanNaiveTree.errors;
  // bootstrap errors list

  var errors = dumbTreeErrors.concat(naiveTreeErrors).concat(validTreeErrors);
  // format objects, normalize metadata, and resolve organization statements

  var _organizeTree = (0, _organizeTree2.organizeTree)({ errors: errors, validTree: validTree });

  var organizedDocument = _organizeTree.document;
  var documentErrors = _organizeTree.errors;
  // propagate resources, metadata and customizers vertically (from parents to children sections), metadata lateraly (from metadata models propagation data)

  var _propagateData = (0, _propagateData2.propagateData)({ errors: documentErrors, document: organizedDocument, models: models, parent: parent });

  var richDocument = _propagateData.document;
  var richErrors = _propagateData.errors;
  // resolve data against their models

  var _resolveResourcesAgai = (0, _resolveResourcesAgainstModels.resolveResourcesAgainstModels)(richDocument.resources, models);

  var newResources = _resolveResourcesAgai.newResources;
  var resErrors = _resolveResourcesAgai.newErrors;

  richDocument.resources = newResources;
  errors = errors.concat(richErrors).concat(resErrors);
  // resolve sections against models
  for (var citeKey in richDocument.sections) {
    if (richDocument.sections[citeKey]) {
      var section = richDocument.sections[citeKey];

      var _resolveSectionAgains = (0, _resolveSectionAgainstModels.resolveSectionAgainstModels)(section, models);

      var sectionErrors = _resolveSectionAgains.newErrors;
      var newSection = _resolveSectionAgains.newSection;

      errors = errors.concat(sectionErrors);
      delete newSection.resources;
      richDocument.sections[citeKey] = newSection;
    }
  }
  // resolve contextualizers nested values
  for (var _citeKey in richDocument.contextualizers) {
    if (richDocument.contextualizers[_citeKey]) {
      richDocument.contextualizers[_citeKey] = (0, _bibTexConverter.parseBibNestedValues)(richDocument.contextualizers[_citeKey]);
    }
  }
  // parse markdown contents and organize them as blocks lists, and parse+resolve contextualization objects
  richDocument.contextualizations = {};
  for (var _citeKey2 in richDocument.sections) {
    if (richDocument.sections[_citeKey2]) {
      var _markdownToJsAbstract = (0, _markdownConverter.markdownToJsAbstraction)(richDocument.sections[_citeKey2], parameters);

      var _sectionErrors = _markdownToJsAbstract.errors;
      var _section = _markdownToJsAbstract.section;
      var contextualizations = _markdownToJsAbstract.contextualizations;
      var contextualizers = _markdownToJsAbstract.contextualizers;

      errors = errors.concat(_sectionErrors);
      richDocument.sections[_citeKey2] = _section;
      richDocument.contextualizers = Object.assign(richDocument.contextualizers, contextualizers);
      richDocument.contextualizations = Object.assign(richDocument.contextualizations, contextualizations);
    }
  }
  // resolve contextualizers statements against their models

  var _resolveBindings = (0, _resolveContextualizations.resolveBindings)({ document: richDocument, models: models });

  var globalErrors = _resolveBindings.errors;
  var newDocument = _resolveBindings.document;

  var document = newDocument;
  errors = errors.concat(globalErrors).filter(function (error) {
    return error !== null;
  });
  // update summary and document metadata with root
  document.metadata = Object.assign({}, document.sections[document.summary[0]].metadata);
  document.customizers = document.sections[document.summary[0]].customizers;
  document.forewords = document.sections[document.summary[0]];
  document.summary = document.summary.slice(1);
  callback(null, {
    errors: errors,
    document: document
  });
};