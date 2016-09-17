'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/**
 * This module organizes relations between sections (order, inheritance, generality level)
 * @module converter/documentConverter/organizeTree
 */

var formatMetadata = function formatMetadata(metadataObj) {
  var output = {};
  var value = void 0;
  var keydetail = void 0;
  var domain = void 0;
  for (var key in metadataObj) {
    if (metadataObj[key] !== undefined) {
      value = metadataObj[key];
      keydetail = key.split('_');
      domain = keydetail.length > 1 ? keydetail.shift() : 'general';
      key = keydetail.join('_');
      if (output[domain] === undefined) {
        output[domain] = {};
      }
      output[domain][key] = {
        value: value
      };
    }
  }
  return output;
};

var flattenSections = function flattenSections(tree) {
  if (tree.children) {
    var newChildren = tree.children.map(function (child) {
      return Object.assign({}, child, { parent: tree.metadata.id });
    });
    var newTree = Object.assign({}, tree);
    return [newTree].concat(_toConsumableArray(newChildren));
  }
  return tree;
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

var formatSections = function formatSections(sections) {
  var formattedSections = sections.map(function (section) {
    return formatSection(section);
  });
  return formattedSections;
};

var moveInArray = function moveInArray(inputArray, oldIndex, newIndex) {
  var array = [].concat(_toConsumableArray(inputArray));
  if (newIndex >= array.length) {
    var toFill = newIndex - array.length;
    while (toFill-- + 1) {
      array.push(undefined);
    }
  }
  array.splice(newIndex, 0, array.splice(oldIndex, 1)[0]);
  return array;
};

var makeRelations = function makeRelations(inputSections) {
  // find parents and predecessors
  var sections = inputSections.map(function (inputSection) {
    var section = Object.assign({}, inputSection);
    // todo : clean the two ways of defining parents (at object root or in metadata)
    if (section.parent && section.metadata.general.parent === undefined) {
      section.metadata.general.parent = { value: section.parent };
    }
    delete section.parent;
    if (section.after && section.metadata.general.after === undefined) {
      section.metadata.general.after = { value: section.after };
    }
    delete section.after;
    return section;
  });
  // order sections
  // move the "no-after" sections to the begining of array
  var hasAfter = sections.filter(function (section) {
    return section.metadata.general.after;
  });
  var hasNoAfter = sections.filter(function (section) {
    return section.metadata.general.after === undefined;
  });
  sections = [].concat(_toConsumableArray(hasNoAfter), _toConsumableArray(hasAfter));
  // resolve after statements

  var _loop = function _loop(index) {
    var section = sections[index];
    // console.log('parsing ', section.metadata.general.id.value, index);
    if (section.metadata.general.after && section.metadata.general.parent) {
      var indexAfter = void 0;
      sections.some(function (section2, thatIndex) {
        var id = section2.metadata.general.id.value;
        if (section.metadata.general.after.value === id) {
          indexAfter = thatIndex;
          return true;
        }
      });
      if (indexAfter !== undefined && index !== indexAfter + 1) {
        // console.log('put ', section.metadata.general.id.value, index, ' after ', section.metadata.general.after.value, indexAfter);
        sections = moveInArray(sections, index, indexAfter + 1);
      } else if (indexAfter === undefined) {
        console.error(section.metadata.general.id.value, ' is supposed to be after ', section.metadata.general.after.value, ' but this section does not exist');
      }
    }
  };

  for (var index = sections.length - 1; index >= 0; index--) {
    _loop(index);
  }
  var summary = sections.map(function (section) {
    return section.metadata.general.id.value;
  });
  var orderedSections = sections.map(function (section, index) {
    if (index > 0) {
      section.metadata.general.after = {
        value: sections[index - 1].metadata.general.id.value
      };
    } else {
      delete section.metadata.general.after;
    }
    return section;
  });
  var outputSections = orderedSections.reduce(function (output, section) {
    return Object.assign(output, _defineProperty({}, section.metadata.general.id.value, section));
  }, {});
  return { outputSections: outputSections, summary: summary };
};

/**
 * Organizes relations between sections
 * @param {Object} params - the organization params
 * @param {array} params.errors - the inherited parsing errors to pass along to next step
 * @param {Object} params.validTree - the tree to process
 * @return {error: error, results: {errors: array, sections: array} - an updated list of parsing errors and updated sections
 */
var organizeTree = exports.organizeTree = function organizeTree(_ref) {
  var _ref$errors = _ref.errors;
  var errors = _ref$errors === undefined ? [] : _ref$errors;
  var validTree = _ref.validTree;

  var flatSections = flattenSections(validTree);
  var formattedSections = formatSections(flatSections);

  var _makeRelations = makeRelations(formattedSections);

  var sections = _makeRelations.outputSections;
  var summary = _makeRelations.summary;

  return {
    document: {
      sections: sections,
      summary: summary
    },
    errors: errors
  };
};