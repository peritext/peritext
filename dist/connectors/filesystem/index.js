'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAssetUri = exports.deleteFromPath = exports.updateFromPath = exports.createFromPath = exports.readFromPath = undefined;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _async = require('async');

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import removeFolderRecursively from 'rmdir';

/**
 * Filesystem connector
 * @module connectors/filesystem
 */

var removeFolderRecursively = function removeFolderRecursively(path) {
  if (_fs2.default.existsSync(path)) {
    _fs2.default.readdirSync(path).forEach(function (file, index) {
      var curPath = path + '/' + file;
      if (_fs2.default.lstatSync(curPath).isDirectory()) {
        // recurse
        removeFolderRecursively(curPath);
      } else {
        // delete file
        _fs2.default.unlinkSync(curPath);
      }
    });
    _fs2.default.rmdirSync(path);
  }
};

// I get meta information about an fs element
var analyseElement = function analyseElement(fileName, absPath) {
  var path = (0, _path.join)(absPath, fileName);
  return {
    name: fileName,
    path: path,
    type: (0, _fs.lstatSync)(path).isDirectory() ? 'directory' : 'file',
    extname: (0, _path.extname)(path)
  };
};

// I get meta information about several fs elements
var analyseContents = function analyseContents(filesList, absPath) {
  if (!filesList) {
    return undefined;
  }
  return filesList.map(function (fileName) {
    return analyseElement(fileName, absPath);
  });
};

// I recursively parse an fs element
var parseElement = function parseElement(_ref, callback) {
  var _ref$path = _ref.path;
  var path = _ref$path === undefined ? '' : _ref$path;
  var element = _ref.element;
  var parseFiles = _ref.parseFiles;
  var depth = _ref.depth;
  var actualDepth = _ref.actualDepth;
  var acceptedExtensions = _ref.acceptedExtensions;

  // file to parse
  if (element.type === 'file' && parseFiles === true && acceptedExtensions.indexOf(element.extname) > -1) {
    try {
      (0, _fs.readFile)(path, 'utf8', function (err, str) {
        if (err) {
          return callback(err, undefined);
        }
        return callback(null, Object.assign({}, element, { stringContents: str }));
      });
    } catch (exception) {
      callback(null, element);
    }
    // dir to parse
  } else if (element.type === 'directory' && (actualDepth < depth || depth === true)) {
      (0, _fs.readdir)(element.path + '/', function (err, files) {
        var children = analyseContents(files, path).filter(function (child) {
          return child.type === 'directory' || acceptedExtensions.indexOf(child.extname) > -1;
        });
        var newDepth = actualDepth + 1;
        (0, _async.map)(children, function (elem, colback) {
          parseElement({ element: elem, path: path + '/' + elem.name, parseFiles: parseFiles, depth: depth, actualDepth: newDepth, acceptedExtensions: acceptedExtensions }, colback);
        }, function (error, otherChildren) {
          return callback(error, Object.assign({}, element, { children: otherChildren }));
        });
      });
      // default return element as it was input
    } else {
        return callback(null, Object.assign({}, element));
      }
};

/**
 * Reads a file from a certain path (cRud)
 * @param {Object} requestParams - The object containing request parameters
 * @param {array|string} requestParams.path - The detailed path (as a succession of "folders" or as a plain string) to attain the file
 * @param {Object} requestParams.params - The connection parameters
 * @param {string} requestParams.params.basePath - The path base to use in order to fetch files
 * @param {number} requestParams.depth - if the target is a "folder" that contains other "subfolders", specifies the parsing level
 * @param {boolean} requestParams.parseFiles - Whether to parse files if the target is a "folder"
 * @param {Array|string} obj.acceptedExtensions - The list of accepted files extensions (or "*") if all must be accepted
 * @param {function(error: error)} callback - returns error and a filesystem representation of the file metadata and contents
 */
var readFromPath = exports.readFromPath = function readFromPath(_ref2, callback) {
  var _ref2$path = _ref2.path;
  var path = _ref2$path === undefined ? [] : _ref2$path;
  var params = _ref2.params;
  var _ref2$depth = _ref2.depth;
  var depth = _ref2$depth === undefined ? 1 : _ref2$depth;
  var _ref2$parseFiles = _ref2.parseFiles;
  var parseFiles = _ref2$parseFiles === undefined ? false : _ref2$parseFiles;
  var _ref2$acceptedExtensi = _ref2.acceptedExtensions;
  var acceptedExtensions = _ref2$acceptedExtensi === undefined ? ['.md', '.bib', '.css', '.js'] : _ref2$acceptedExtensi;

  var resolvedPath = Array.isArray(path) ? path.join('/') : path;
  var finalPath = (0, _path.resolve)(params.basePath) + '/' + resolvedPath;
  var element = void 0;
  var name = (0, _path.basename)(finalPath);

  try {
    element = {
      name: name,
      path: finalPath,
      type: (0, _fs.lstatSync)(finalPath).isDirectory() ? 'directory' : 'file',
      extname: (0, _path.extname)(name)
    };
  } catch (err) {
    return callback(err, undefined);
  }

  if (element.type === 'directory') {
    return parseElement({ path: finalPath, element: element, parseFiles: parseFiles, depth: depth, actualDepth: 0, acceptedExtensions: acceptedExtensions }, callback);
  } else if (acceptedExtensions === '*' || acceptedExtensions.indexOf(element.extname) > -1) {
    (0, _fs.readFile)(finalPath, 'utf8', function (err, str) {
      if (err) {
        return callback(err, undefined);
      }
      return callback(null, Object.assign({}, element, { stringContents: str }));
    });
  } else {
    return callback(new Error('the file extension is not accepted'), undefined);
  }
};

/**
 * Creates a file from a certain path and possibly some contents (Crud)
 * @param {Object} requestParams - The object containing request parameters
 * @param {array|string} requestParams.path - The detailed path (as a succession of "folders" or as a plain string) to attain the file
 * @param {Object} requestParams.params - The connection parameters
 * @param {string} requestParams.params.basePath - The path base to use in order to fetch files
 * @param {string} requestParams.stringContents - the contents to be created
 * @param {boolean} requestParams.overwrite - Whether to overwrite existing entity already present at path
 * @param {function(error: error, returnedPath: string)} callback - returns error and the path of created entity
 */
var createFromPath = exports.createFromPath = function createFromPath(_ref3, callback) {
  var _ref3$path = _ref3.path;
  var path = _ref3$path === undefined ? '' : _ref3$path;
  var params = _ref3.params;
  var _ref3$type = _ref3.type;
  var type = _ref3$type === undefined ? 'file' : _ref3$type;
  var _ref3$stringContents = _ref3.stringContents;
  var stringContents = _ref3$stringContents === undefined ? '' : _ref3$stringContents;
  var _ref3$overwrite = _ref3.overwrite;
  var overwrite = _ref3$overwrite === undefined ? false : _ref3$overwrite;

  var resolvedPath = Array.isArray(path) ? path.join('/') : path;
  var finalPath = (0, _path.resolve)(params.basePath) + '/' + resolvedPath;
  var pathSteps = finalPath.split('/').filter(function (thatPath) {
    return thatPath.length > 0;
  });
  // first check-or-create path folders
  var folderPath = type === 'file' ? pathSteps.slice(0, pathSteps.length - 1) : pathSteps.slice();
  folderPath = '/' + folderPath.join('/');
  if (type === 'file') {
    return (0, _fs.exists)(finalPath, function (isThere) {
      // either file is not there or we don't care overwriting
      if (overwrite || !isThere) {
        (0, _fs.writeFile)(finalPath, stringContents, 'utf8');
        return callback(null);
        // file is there and overwrite set to false
      }
      return callback(new Error('File/directory already exists and overwrite option is set to false'));
    });
  }
  return (0, _fs.exists)(folderPath, function (isThere) {
    if (isThere) {
      return callback(null);
    }
    return (0, _mkdirp2.default)(folderPath, function (err) {
      return callback(err);
    });
  });
};

/**
 * Updates a file from a certain path and possibly some contents (crUd)
 * @param {Object} requestParams - The object containing request parameters
 * @param {array|string} requestParams.path - The detailed path (as a succession of "folders" or as a plain string) to attain the file
 * @param {Object} requestParams.params - The connection parameters
 * @param {string} requestParams.params.basePath - The path base to use in order to fetch files
 * @param {string} requestParams.stringContents - the contents to be created
 * @param {function(error: error)} callback - returns possible error
 */
var updateFromPath = exports.updateFromPath = function updateFromPath(_ref4, callback) {
  var _ref4$path = _ref4.path;
  var path = _ref4$path === undefined ? '' : _ref4$path;
  var params = _ref4.params;
  var _ref4$stringContents = _ref4.stringContents;
  var stringContents = _ref4$stringContents === undefined ? '' : _ref4$stringContents;

  var resolvedPath = Array.isArray(path) ? path.join('/') : path;
  var finalPath = (0, _path.resolve)(params.basePath + '/' + resolvedPath);
  (0, _fs.exists)(finalPath, function (isThere) {
    if (isThere) {
      var pathSteps = finalPath.split('/').filter(function (thatPath) {
        return thatPath.length > 0;
      });
      var elementName = pathSteps.pop();
      var element = analyseElement(elementName, '/' + pathSteps.join('/'));
      if (element.type === 'directory') {
        callback(new Error('cannot update directories'));
      } else if (element.type === 'file') {
        (0, _fs.writeFile)(finalPath, stringContents, function (err) {
          callback(err);
        });
      }
    } else {
      callback(new Error('Path does not exists'));
    }
  });
};

/**
 * Deletes a file from a certain path and possibly some contents (cruD)
 * @param {Object} requestParams - The object containing request parameters
 * @param {array|string} requestParams.path - The detailed path (as a succession of "folders" or as a plain string) to attain the file
 * @param {Object} requestParams.params - The connection parameters
 * @param {string} requestParams.params.basePath - The path base to use in order to fetch files
 * @param {function(error: error)} callback - returns potential errors
 */
var deleteFromPath = exports.deleteFromPath = function deleteFromPath(_ref5, callback) {
  var _ref5$path = _ref5.path;
  var path = _ref5$path === undefined ? '' : _ref5$path;
  var params = _ref5.params;

  var resolvedPath = Array.isArray(path) ? path.join('/') : path;
  var finalPath = (0, _path.resolve)(params.basePath) + '/' + resolvedPath;
  (0, _fs.exists)(finalPath, function (isThere) {
    if (isThere) {
      var pathSteps = finalPath.split('/').filter(function (thatPath) {
        return thatPath.length > 0;
      });
      var elementName = pathSteps.pop();
      var element = analyseElement(elementName, '/' + pathSteps.join('/'));
      if (element.type === 'directory') {
        removeFolderRecursively(finalPath /*
                                          , (err) =>{
                                          callback(err);
                                          }
                                          */);
        callback(null);
      } else if (element.type === 'file') {
        (0, _fs.unlink)(finalPath, function (err) {
          callback(err);
        });
      }
    } else {
      callback(new Error('Path does not exists'));
    }
  });
};

/**
 * Gets the absolute uri of an asset
 * @param {Object} requestParams - The object containing request parameters
 * @param {array|string} requestParams.path - The detailed path (as a succession of "folders" or as a plain string) to attain the file
 * @param {Object} requestParams.params - The connection parameters
 * @param {string} requestParams.params.basePath - The path base to use in order to fetch files
 * @param {function(error: error, finalPath: string)} callback - returns error and the asset's uri
 * @todo question : should it check for resource availability ?
 */
var getAssetUri = exports.getAssetUri = function getAssetUri(_ref6, callback) {
  var path = _ref6.path;
  var params = _ref6.params;

  var resolvedPath = Array.isArray(path) ? path.join('/') : path;
  var finalPath = (0, _path.resolve)(params.basePath) + '/' + resolvedPath;
  return callback(null, finalPath);
};