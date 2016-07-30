'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.organizeTree = undefined;

var _async = require('async');

var _sectionUtils = require('./../../utils/sectionUtils');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var formatMetadata = function formatMetadata(metadataObj) {
  var output = [];
  var value = void 0;
  var keydetail = void 0;
  var domain = void 0;
  for (var key in metadataObj) {
    if (metadataObj[key] !== undefined) {
      value = metadataObj[key];
      keydetail = key.split('_');
      domain = keydetail.length > 1 ? keydetail.shift() : 'general';
      key = keydetail.join('_');
      output.push({
        domain: domain,
        key: key,
        value: value
      });
    }
  }
  return output;
};

var flattenSections = function flattenSections(tree, callback) {

  if (tree.children) {
    (0, _async.map)(tree.children, flattenSections, function (err, children) {
      var newTree = Object.assign({}, tree);
      var newChildren = children.map(function (child) {
        return Object.assign({}, child[0], { parent: tree.metadata.citeKey });
      });

      return callback(null, [newTree].concat(_toConsumableArray(newChildren)));
    });
  } else return callback(null, tree);
};

var formatSection = function formatSection(section) {
  var metadata = formatMetadata(section.metadata);
  var keyedCustomizers = void 0;
  if (section.customizers) {
    keyedCustomizers = {};
    section.customizers.forEach(function (customizer) {
      keyedCustomizers[customizer.type] = customizer.contents;
    });
  }
  return {
    metadata: metadata,
    contents: section.contentStr,
    resources: section.resources,
    parent: section.parent,
    customizers: keyedCustomizers,
    contextualizers: section.contextualizers
  };
};

var formatSections = function formatSections(sections, callback) {
  var formatted = sections.map(formatSection);
  return callback(null, formatted);
};

var makeRelations = function makeRelations(inputSections, callback) {

  // find parents and predecessors
  var sections = inputSections.map(function (inputSection) {
    var section = Object.assign({}, inputSection);
    var parent = (0, _sectionUtils.getMetaValue)(section.metadata, 'general', 'parent');
    var after = (0, _sectionUtils.getMetaValue)(section.metadata, 'general', 'after');
    if (parent) {
      section.parent = parent;
      section.metadata = (0, _sectionUtils.deleteMeta)(section.metadata, 'general', 'parent');
    }
    if (after) {
      section.after = after;
      section.metadata = (0, _sectionUtils.deleteMeta)(section.metadata, 'general', 'after');
    }
    return section;
  });
  // order sections

  var _loop = function _loop(index) {
    var section = sections[index];
    if (section.after) {
      var indexAfter = void 0;
      sections.some(function (sec, id) {
        var citeKey = sec.metadata.find(function (meta) {
          return meta.domain === 'general' && meta.key === 'citeKey';
        }).value;

        if (section.after === citeKey) {
          indexAfter = id;
          return true;
        }
      });
      sections.splice(indexAfter + 1, 0, section);
      sections.splice(index + 1, 1);
    }
  };

  for (var index = sections.length - 1; index >= 0; index--) {
    _loop(index);
  }

  callback(null, sections);
};

var organizeTree = exports.organizeTree = function organizeTree(_ref, callback) {
  var errors = _ref.errors;
  var validTree = _ref.validTree;


  (0, _async.waterfall)([function (cb) {
    flattenSections(validTree, cb);
  }, function (sections, cb) {
    formatSections(sections, cb);
  }, function (sections, cb) {
    makeRelations(sections, cb);
  }], function (err, sections) {
    callback(err, { sections: sections, errors: errors });
  });
};