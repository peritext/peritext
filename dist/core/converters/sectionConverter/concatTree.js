'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.concatTree = undefined;

var _markdownIncludesParser = require('./../../converters/markdownIncludesParser');

var _async = require('async');

var resolveFileIncludes = void 0;

/**
 * I extract md includes and inline resources descriptions from a file object
 * @child : a fsElement ({type, name, path, extname})
 * @params : local parsing params - for instance templates and includes syntax
 */
var populateElementWithIncludes = function populateElementWithIncludes(child, params, callback) {
  (0, _markdownIncludesParser.parseMarkdown)(child.stringContents, {
    includeWrappingChars: params.templateWrappingCharacters,
    resWrappingChars: params.inlineResourceDescriptionWrappingCharacters
  }, function (err, _ref) {
    var extracted = _ref.extracted;
    var cleanStr = _ref.cleanStr;

    if (!err) {
      child.extracted = extracted;
      child.stringContents = cleanStr;
    }
    callback(err, child);
  });
};

/**
 * I produce a nested structure of the included files in a given file
 * @ex : the include expression object
 * @file : the file to populate
 */
var include = function include(ex, file, mdFilesWithIncludes) {
  var fileIndex = void 0;
  var fileToInclude = mdFilesWithIncludes.find(function (otherFile, index) {
    if (otherFile.name === ex.statement) {
      fileIndex = index;
      return true;
    }
  });
  if (fileToInclude !== undefined) {
    var fileHasIncludes = fileToInclude.extracted.filter(function (rawExtracted) {
      return rawExtracted.type === 'includeStatement';
    }).length > 0;
    if (fileHasIncludes) {
      resolveFileIncludes(fileToInclude, mdFilesWithIncludes);
    }
    file.includes.push(fileToInclude);
    mdFilesWithIncludes.splice(fileIndex, 1);
  }
};

/**
 * I monitor the nested including structure population process of a file
 */
resolveFileIncludes = function resolveFileIncludes(file, mdFilesWithIncludes) {
  file.includes = [];
  file.includeStatements = [];
  for (var index = file.extracted.length - 1; index >= 0; index--) {
    var ex = file.extracted[index];
    if (ex.type === 'includeStatement') {
      include(ex, file, mdFilesWithIncludes);
      file.extracted.splice(index, 1);
      file.includeStatements.push(ex);
    }
  }
};

/**
 * I turn non nested file object into include-based nested file objects
 * @mdFilesWithIncludes : non nested file objects
 */
var nestIncludes = function nestIncludes(_ref2, cb) {
  var resourcesStr = _ref2.resourcesStr;
  var mdFilesWithIncludes = _ref2.mdFilesWithIncludes;
  var params = _ref2.params;


  mdFilesWithIncludes.forEach(function (mdfile) {
    resolveFileIncludes(mdfile, mdFilesWithIncludes);
  });
  cb(null, { resourcesStr: resourcesStr, mdFilesWithIncludes: mdFilesWithIncludes });
};

/**
 * I consume the nested property 'include' by populating its string contents with includes contents,
 * resolved recursively
 * @file : the file
 */
var buildFinalMdContent = function buildFinalMdContent(file) {
  var content = file.stringContents;
  var hasIncludes = file.includes && file.includes.length && file.includes.length > 0;
  if (hasIncludes) {
    file.includeStatements.filter(function (ex) {
      return ex.type === 'includeStatement';
    }).forEach(function (ex) {
      var targetIncluded = file.includes.find(function (file2) {
        return file2.name === ex.statement;
      });
      var contentToInclude = buildFinalMdContent(targetIncluded);
      content = [content.substr(0, ex.index), contentToInclude, content.substr(ex.index)].join('');
    });
  }

  return content;
};

/**
 * I turn an array of nested file objects into one single string
 * @mdFilesWithIncludes : non nested file objects
 */
var resolveNestedIncludes = function resolveNestedIncludes(_ref3, cb) {
  var resourcesStr = _ref3.resourcesStr;
  var mdFilesWithIncludes = _ref3.mdFilesWithIncludes;
  var params = _ref3.params;

  var contentStr = mdFilesWithIncludes.reduce(function (str, file) {
    return str + buildFinalMdContent(file);
  }, '');
  cb(null, { contentStr: contentStr, resourcesStr: resourcesStr, params: params });
};

var concatCustomizers = function concatCustomizers(newTree) {
  return newTree.children.filter(function (child) {
    return child.type === 'directory' && child.name.charAt(0) === '_';
  }).map(function (child) {
    var contents = {};
    child.children.forEach(function (subChild) {
      contents[subChild.name] = subChild.stringContents;
    });
    return {
      type: child.name.substr(1),
      contents: contents
    };
  });
};

/**
 * MAIN
 * I turn a fsTree into a dumTree, that is a tree which presents
 * .bib resources and .md files contents concatenated by folder (according to inner 'include' statements and then automatically)
 */
var concatTree = exports.concatTree = function concatTree(tree, params, callback) {
  var newTree = Object.assign({}, tree);
  // concat .bib res files
  var resources = newTree.children.filter(function (child) {
    return child.type === 'file' && child.extname === '.bib';
  }).reduce(function (str, child) {
    if (child.stringContents !== undefined) {
      return str + '\n' + child.stringContents;
    }
    return str;
  }, '');

  var mdContents = newTree.children.filter(function (child) {
    return child.type === 'file' && child.extname === '.md';
  });
  var childrenDirs = newTree.children.filter(function (child) {
    return child.type === 'directory' && child.name.charAt(0) !== '_';
  });
  var childrenCustomizers = concatCustomizers(newTree);
  (0, _async.waterfall)([
  // extract md files elements includes statements
  function (cb) {
    (0, _async.map)(mdContents, function (child, cback) {
      populateElementWithIncludes(child, params, cback);
    }, function (err, mdFilesWithIncludes) {
      // concat extracted bibtex resources
      var resourcesStr = mdFilesWithIncludes.reduce(function (str, mdFile) {
        var newStr = str;
        mdFile.extracted.filter(function (ex) {
          return ex.type === 'resourceStatement';
        }).forEach(function (ex) {
          newStr += ex.statement;
        });
        return newStr;
      }, resources);
      cb(null, { resourcesStr: resourcesStr, mdFilesWithIncludes: mdFilesWithIncludes, params: params });
    });
  }, nestIncludes, resolveNestedIncludes], function (err, _ref4) {
    var resourcesStr = _ref4.resourcesStr;
    var contentStr = _ref4.contentStr;

    newTree.resourcesStr = resourcesStr;
    newTree.contentStr = contentStr;
    if (childrenCustomizers.length > 0) {
      newTree.customizers = childrenCustomizers;
    }
    // recursively repeat dat stuff with children dirs
    (0, _async.map)(childrenDirs, function (dir, cback) {
      concatTree(dir, params, cback);
    }, function (error, populatedDirs) {
      newTree.children = populatedDirs;
      callback(error, newTree);
    });
  });
};