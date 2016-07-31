/**
 * Filesystem connector
 * @module connectors/filesystem
 */

import {
  readFile,
  readdir,
  lstatSync,
  mkdir,
  exists,
  writeFile,
  unlink
} from 'fs';
import {
  resolve,
  extname,
  basename,
  join as joinPath
} from 'path';
import {map as asyncMap, reduce as asyncReduce} from 'async';
import removeFolderRecursively from 'rmdir';

// I get meta information about an fs element
const analyseElement = (fileName, absPath) =>{
  const path = joinPath(absPath, fileName);
  return {
    name: fileName,
    path,
    type: (lstatSync(path).isDirectory()) ? 'directory' : 'file',
    extname: extname(path)
  };
};

// I get meta information about several fs elements
const analyseContents = (filesList, absPath) =>{
  if (!filesList) {
    return undefined;
  }
  return filesList.map((fileName) => {
    return analyseElement(fileName, absPath);
  });
};


// I recursively parse an fs element
const parseElement = ({path = '', element, parseFiles, depth, actualDepth, acceptedExtensions}, callback) =>{
  // file to parse
  if (element.type === 'file' && parseFiles === true && acceptedExtensions.indexOf(element.extname) > -1) {
    try {
      readFile(path, 'utf8', function(err, str) {
        if (err) {
          return callback(err, undefined);
        }
        return callback(null, Object.assign({}, element, {stringContents: str}));
      });
    } catch (exception) {
      callback(null, element);
    }
  // dir to parse
  } else if (element.type === 'directory' && (actualDepth < depth || depth === true)) {
    readdir(element.path + '/', function(err, files) {
      const children = analyseContents(files, path)
                      .filter((child)=>{
                        return child.type === 'directory' || acceptedExtensions.indexOf(child.extname) > -1;
                      });
      const newDepth = actualDepth + 1;
      asyncMap(children, function(elem, colback) {
        parseElement({element: elem, path: path + '/' + elem.name, parseFiles, depth, actualDepth: newDepth, acceptedExtensions}, colback);
      }, function(error, otherChildren) {
        return callback(error, Object.assign({}, element, {children: otherChildren}));
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
export const readFromPath = ({
    path = [],
    params,
    depth = 1,
    parseFiles = false,
    acceptedExtensions = ['.md', '.bib', '.css', '.js']
  }, callback) =>{
  const resolvedPath = (Array.isArray(path)) ? path.join('/') : path;
  const finalPath = resolve(params.basePath) + '/' + resolvedPath;
  let element;
  const name = basename(finalPath);

  try {
    element = {
      name: name,
      path: finalPath,
      type: (lstatSync(finalPath).isDirectory()) ? 'directory' : 'file',
      extname: extname(name)
    };
  }catch (err) {
    return callback(err, undefined);
  }

  if (element.type === 'directory') {
    return parseElement({path: finalPath, element, parseFiles, depth, actualDepth: 0, acceptedExtensions}, callback);
  } else if (acceptedExtensions === '*' || acceptedExtensions.indexOf(element.extname) > -1) {
    readFile(finalPath, 'utf8', (err, str) => {
      if (err) {
        return callback(err, undefined);
      }
      return callback(null, Object.assign({}, element, {stringContents: str}));
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
export const createFromPath = ({path = '', params, type = 'file', stringContents = '', overwrite = false}, callback) =>{
  const resolvedPath = (Array.isArray(path)) ? path.join('/') : path;
  const finalPath = resolve(params.basePath) + '/' + resolvedPath;
  const pathSteps = finalPath.split('/').filter((thatPath)=> {return thatPath.length > 0;});
  // first check-or-create path folders
  const activePath = '/';
  asyncReduce(pathSteps, activePath, (inputMemo, pathStep, cback) =>{
    // case : not end of path, walking through
    if (pathStep !== pathSteps[pathSteps.length - 1]) {
      const memo = inputMemo + pathStep + '/';
      exists(memo, function(isThere) {
        if (isThere) {
          cback(null, memo);
        }else {
          mkdir(memo, function(err) {
            cback(err, memo);
          });
        }
      });
    // case : end of path
    } else {
      cback(null, inputMemo + pathStep);
    }

  }, (err, result) =>{
    // check if element already exists
    exists(finalPath, function(isThere) {
      if ((isThere && overwrite === true) || !isThere) {
        if (type === 'file') {
          writeFile(finalPath, stringContents, 'utf8', function(error) {
            callback(error);
          });
        }else if (type === 'directory') {
          mkdir(finalPath, function(error) {
            callback(error);
          });
        }else {
          callback(new Error('No element type matching'));
        }
      }else {
        callback(new Error('File/directory already exists and overwrite option is set to false'));
      }
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
export const updateFromPath = ({path = '', params, stringContents = ''}, callback) => {
  const resolvedPath = (Array.isArray(path)) ? path.join('/') : path;
  const finalPath = resolve(params.basePath + '/' + resolvedPath);
  exists(finalPath, (isThere) =>{
    if (isThere) {
      const pathSteps = finalPath.split('/').filter((thatPath)=> {return thatPath.length > 0;});
      const elementName = pathSteps.pop();
      const element = analyseElement(elementName, '/' + pathSteps.join('/'));
      if (element.type === 'directory') {
        callback(new Error('cannot update directories'));
      } else if (element.type === 'file') {
        writeFile(finalPath, stringContents, (err) =>{
          callback(err);
        });
      }
    }else {
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
export const deleteFromPath = ({path = '', params}, callback) => {
  const resolvedPath = (Array.isArray(path)) ? path.join('/') : path;
  const finalPath = resolve(params.basePath) + '/' + resolvedPath;
  exists(finalPath, function(isThere) {
    if (isThere) {
      const pathSteps = finalPath.split('/').filter((thatPath) => {return thatPath.length > 0;});
      const elementName = pathSteps.pop();
      const element = analyseElement(elementName, '/' + pathSteps.join('/'));
      if (element.type === 'directory') {
        removeFolderRecursively(finalPath, (err) =>{
          callback(err);
        });
      }else if (element.type === 'file') {
        unlink(finalPath, (err) =>{
          callback(err);
        });
      }
    }else {
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
export const getAssetUri = ({path, params}, callback) => {
  const resolvedPath = (Array.isArray(path)) ? path.join('/') : path;
  const finalPath = resolve(params.basePath) + '/' + resolvedPath;
  return callback(null, finalPath);
};
