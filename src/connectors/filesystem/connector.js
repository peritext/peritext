import {readFile, readdir, lstatSync} from 'fs';
import {resolve, extname, basename, join as joinPath} from 'path';
import {map as asyncMap} from 'async';


const analyseContents = function(files, absPath){
  let path;
  if(!files){
    return undefined;
  } else return files.map((file) => {
      path = joinPath(absPath, file);
      return {
        name : file,
        path,
        extname : extname(path),
        type : (lstatSync(path).isDirectory())?'directory':'file'
      }
    })
}

//recursive fs element parser
const parseElement = function({path, element, parseFiles, depth, actualDepth}, callback){
  //file to parse
  // console.log('parsing ', element.path)
  if(element.type === 'file' && parseFiles === true){
    getStringFromPath(path, function(err, str){
      if(err){
        return callback(err, element);
      }else{
        return callback(err, Object.assign(element, {stringContents : str}));
      }
    });
  //dir to parse
  } else if(element.type === 'directory' && (actualDepth < depth || depth === true)){
    // console.log('parsing folder ', element.name, ', actual depth is ', actualDepth)
    readdir(element.path + '/', function(err, files){
      console.log('parsed folder contents of ', element.name, ', length is ', files.length)
      let children = analyseContents(files, path);
      actualDepth ++;
      asyncMap(children, function(element, colback){
        // console.log('level', actualDepth, 'will parse ', element.path)
        return parseElement({element, path, parseFiles, depth, actualDepth : actualDepth}, colback)
      }, function(err, children){
        // console.log('successfully parsed folder ', element.name);
        return callback(err, Object.assign({}, element, {children}));
      });
    });
  //default return element as it was input
  } else {
      return callback(undefined, Object.assign({}, element));
  }
}

// why is path in an object ?
// --> because authentication data would be specified
// in that same object for other connectors
export function getStringFromPath ({path=[]}, callback){
  const finalPath = resolve((Array.isArray(path))?path.join('/'):path);

  readFile(finalPath, 'utf8', (err, data) => {
    callback(err, data);
  });
}

export function getTreeFromPath ({path=[], depth = 1, parseFiles=false}, callback){
  const finalPath = resolve((Array.isArray(path))?path.join('/'):path);
  let dirName = basename(finalPath);
  let element = {
    name : dirName,
    path : path,
    type : (lstatSync(finalPath).isDirectory())?'directory':'file',
    extname : ''
  }
  if(element.type === 'directory'){
    parseElement({finalPath, element, parseFiles, depth, actualDepth : 0}, callback);
  } else {
    callback(new ReferenceError(), undefined);
  }
}
