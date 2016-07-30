'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAssetUri = exports.deleteFromPath = exports.updateFromPath = exports.createFromPath = exports.readFromPath = undefined;

var _fs = require('fs');

var _path = require('path');

var _async = require('async');

var _rmdir = require('rmdir');

var _rmdir2 = _interopRequireDefault(_rmdir);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var analyseElement = function analyseElement(fileName, absPath) {
  var path = (0, _path.join)(absPath, fileName);
  return {
    name: fileName,
    path: path,
    type: (0, _fs.lstatSync)(path).isDirectory() ? 'directory' : 'file',
    extname: (0, _path.extname)(path)
  };
};

var analyseContents = function analyseContents(filesList, absPath) {
  if (!filesList) {
    return undefined;
  }
  return filesList.map(function (fileName) {
    return analyseElement(fileName, absPath);
  });
};

// recursive fs element parser
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

// cRud
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

// Crud
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
  var activePath = '/';
  (0, _async.reduce)(pathSteps, activePath, function (inputMemo, pathStep, cback) {
    // case : not end of path, walking through
    if (pathStep !== pathSteps[pathSteps.length - 1]) {
      (function () {
        var memo = inputMemo + pathStep + '/';
        (0, _fs.exists)(memo, function (isThere) {
          if (isThere) {
            cback(null, memo);
          } else {
            (0, _fs.mkdir)(memo, function (err) {
              cback(err, memo);
            });
          }
        });
        // case : end of path
      })();
    } else {
        cback(null, inputMemo + pathStep);
      }
  }, function (err, result) {
    // check if element already exists
    (0, _fs.exists)(finalPath, function (isThere) {
      if (isThere && overwrite === true || !isThere) {
        if (type === 'file') {
          (0, _fs.writeFile)(finalPath, stringContents, 'utf8', function (error) {
            callback(error);
          });
        } else if (type === 'directory') {
          (0, _fs.mkdir)(finalPath, function (error) {
            callback(error);
          });
        } else {
          callback(new Error('No element type matching'));
        }
      } else {
        callback(new Error('File/directory already exists and overwrite option is set to false'));
      }
    });
  });
};

// crUd
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

// cruD
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
        (0, _rmdir2.default)(finalPath, function (err) {
          callback(err);
        });
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

// asset resolver
// pretty useless for fs connector
// but kept for architecture consistency
// because it will be a more complex process for other connectors
// WIP TODO QUESTION : should it check for resource availability ?
var getAssetUri = exports.getAssetUri = function getAssetUri(_ref6, callback) {
  var path = _ref6.path;
  var params = _ref6.params;

  var resolvedPath = Array.isArray(path) ? path.join('/') : path;
  var finalPath = (0, _path.resolve)(params.basePath) + '/' + resolvedPath;
  return callback(null, finalPath);
};