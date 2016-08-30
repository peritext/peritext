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

var _concatTree = require('./concatTree');

var _parseTreeResources = require('./parseTreeResources');

var _organizeTree = require('./organizeTree');

var _propagateData = require('./propagateData');

var _cleanNaiveTree = require('./cleanNaiveTree');

var _sectionValidator = require('./../../validators/sectionValidator');

var _modelUtils = require('./../../utils/modelUtils');

var _sectionUtils = require('./../../utils/sectionUtils');

var _resolveSectionAgainstModels = require('./../../resolvers/resolveSectionAgainstModels');

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
      citeKey: (0, _sectionUtils.getMetaValue)(section.metadata, 'general', 'citeKey'),
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
 * @param {function(error:error, sections: array)} callback - provides an array containing the resources
 */
var parseSection = exports.parseSection = function parseSection(_ref3, callback) {
  var tree = _ref3.tree;
  var parameters = _ref3.parameters;
  var parent = _ref3.parent;
  var models = _ref3.models;

  (0, _async.waterfall)([
  // concat markdown, resources, styles, templates, components, and resolve includes, producing a clean 'dumb tree'
  function (cb) {
    //  console.log(tree);
    (0, _concatTree.concatTree)(tree, parameters, cb);
  },
  // parse bibtext to produce resources and metadata props, producing a 'naive tree' of sections
  function (dumbTree, cb) {
    (0, _parseTreeResources.parseTreeResources)(dumbTree, cb);
  },
  // validate and resolve metadata against their models for all sections
  function (naiveTree, cb) {
    (0, _cleanNaiveTree.cleanNaiveTree)({ validTree: naiveTree }, models, cb);
  },
  // format objects, normalize metadata, and resolve organization statements
  function (_ref4, cb) {
    var errors = _ref4.errors;
    var validTree = _ref4.validTree;

    (0, _organizeTree.organizeTree)({ errors: errors, validTree: validTree }, cb);
  },
  // propagate resources, metadata and customizers vertically (from parents to children sections), metadata lateraly (from metadata models propagation data)
  function (_ref5, cb) {
    var errors = _ref5.errors;
    var sections = _ref5.sections;

    (0, _propagateData.propagateData)({ errors: errors, sections: sections, models: models, parent: parent }, cb);
  },
  // validate each resource against their models to produce errors and warnings from parsing
  function (_ref6, cb) {
    var errors = _ref6.errors;
    var sections = _ref6.sections;


    (0, _async.map)(sections, function (section, cback) {
      (0, _sectionValidator.validateResources)(section, models, cback);
    }, function (err, results) {
      var newSections = results.map(function (result) {
        return result.section;
      });
      var newErrors = results.reduce(function (total, result) {
        return errors.concat(result.errors);
      }, errors);
      cb(err, { errors: newErrors, sections: newSections });
    });
  },
  // resolve section resources and metadata against their models
  function (_ref7, cb) {
    var errors = _ref7.errors;
    var sections = _ref7.sections;

    (0, _async.map)(sections, function (section, cback) {
      (0, _resolveSectionAgainstModels.resolveSectionAgainstModels)(section, models, cback);
    }, function (err, results) {
      var newSections = results.map(function (result) {
        return result.section;
      });
      var newErrors = results.reduce(function (total, result) {
        return errors.concat(result.errors);
      }, errors);
      cb(err, { errors: newErrors, sections: newSections });
    });
  },
  // parse markdown contents and organize them as blocks lists, and parse+resolve contextualization objects
  function (_ref8, cb) {
    var errors = _ref8.errors;
    var sections = _ref8.sections;

    (0, _async.map)(sections, function (section, cback) {
      (0, _markdownConverter.markdownToJsAbstraction)(section, parameters, cback);
    }, function (err, results) {
      var newSections = results.map(function (result) {
        return result.section;
      });
      var newErrors = results.reduce(function (total, result) {
        return errors.concat(result.errors);
      }, errors);
      cb(err, { errors: newErrors, sections: newSections });
    });
  },
  // resolve contextualizers statements with their models
  function (_ref9, cb) {
    var errors = _ref9.errors;
    var sections = _ref9.sections;

    (0, _async.map)(sections, function (section, cback) {
      (0, _resolveContextualizations.resolveBindings)({ section: section, models: models }, cback);
    }, function (err, results) {
      var newSections = results.map(function (result) {
        return result.section;
      });
      var newErrors = results.reduce(function (total, result) {
        return errors.concat(result.errors);
      }, errors);
      cb(err, { errors: newErrors, sections: newSections });
    });
  }
  // all done - return a documentTree to use as data state in the app
  ], callback);
};