import {readFile, readdir, lstatSync, mkdir, exists, writeFile, unlink} from 'fs';
import {resolve, extname, basename, join as joinPath} from 'path';
import {map as asyncMap, reduce as asyncReduce} from 'async';
import removeFolderRecursively from 'rmdir';

const analyseElement = function(fileName, absPath) {
  const path = joinPath(absPath, fileName);
  return {
    name: fileName,
    path,
    type: (lstatSync(path).isDirectory()) ? 'directory' : 'file',
    extname: extname(path)
  };
};

const analyseContents = function(filesList, absPath) {
  if (!filesList) {
    return undefined;
  }
  return filesList.map((fileName) => {
    return analyseElement(fileName, absPath);
  });
};


// recursive fs element parser
const parseElement = function({path, element, parseFiles, depth, actualDepth, acceptedExtensions}, callback) {
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

// cRud
export function readFromPath({path = [], depth = 1, parseFiles = false, acceptedExtensions = ['.md', '.bib', '.css', '.jsx']}, callback) {
  const finalPath = resolve((Array.isArray(path)) ? path.join('/') : path);
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
  } else if (acceptedExtensions.indexOf(element.extname) > -1) {
    readFile(finalPath, 'utf8', (err, str) => {
      if (err) {
        return callback(err, undefined);
      }
      return callback(null, Object.assign({}, element, {stringContents: str}));
    });
  } else {
    return callback(new Error('the file extension is not accepted'), undefined);
  }
}

// Crud
export function createFromPath({path, type = 'file', stringContents = '', overwrite = false}, callback) {
  const finalPath = resolve((Array.isArray(path)) ? path.join('/') : path);
  const pathSteps = finalPath.split('/').filter((thatPath)=> {return thatPath.length > 0;});
  // first check-or-create path folders
  const activePath = '/';
  asyncReduce(pathSteps, activePath, function(inputMemo, pathStep, cback) {
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

  }, function(err, result) {
    // check if element already exists
    exists(finalPath, function(isThere) {
      if ((isThere && overwrite === true) || !isThere) {
        if (type === 'file') {
          console.log('final path : ', finalPath);
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
}

// crUd
export function updateFromPath({path, stringContents = ''}, callback) {
  const finalPath = resolve((Array.isArray(path)) ? path.join('/') : path);
  exists(finalPath, function(isThere) {
    if (isThere) {
      const pathSteps = finalPath.split('/').filter((thatPath)=> {return thatPath.length > 0;});
      const elementName = pathSteps.pop();
      const element = analyseElement(elementName, '/' + pathSteps.join('/'));
      if (element.type === 'directory') {
        callback(new Error('cannot update directories'));
      }else if (element.type === 'file') {
        writeFile(finalPath, stringContents, function(err) {
          callback(err);
        });
      }
    }else {
      callback(new Error('Path does not exists'));
    }
  });
}

// cruD
export function deleteFromPath({path}, callback) {
  const finalPath = resolve((Array.isArray(path)) ? path.join('/') : path);
  exists(finalPath, function(isThere) {
    if (isThere) {
      const pathSteps = finalPath.split('/').filter((thatPath) => {return thatPath.length > 0;});
      const elementName = pathSteps.pop();
      const element = analyseElement(elementName, '/' + pathSteps.join('/'));
      if (element.type === 'directory') {
        removeFolderRecursively(finalPath, function(err) {
          callback(err);
        });
      }else if (element.type === 'file') {
        unlink(finalPath, function(err) {
          callback(err);
        });
      }
    }else {
      callback(new Error('Path does not exists'));
    }
  });
}
