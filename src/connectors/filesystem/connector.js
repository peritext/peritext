import {readFile, readdir, lstatSync, accessSync, readFileSync} from 'fs';
import {resolve, extname, basename, join as joinPath} from 'path';
import {map as asyncMap} from 'async';

const analyseElement = function(fileName, absPath){
  let path = joinPath(absPath, fileName);
  return {
    name : fileName,
    path,
    type : (lstatSync(path).isDirectory())?'directory':'file',
    extname : extname(path)
  }
}

const analyseContents = function(filesList, absPath){
  if(!filesList) {
    return undefined;
  } else return filesList.map((fileName) => {
      return analyseElement(fileName, absPath)
    });
}


//recursive fs element parser
const parseElement = function({path, element, parseFiles, depth, actualDepth, acceptedExtensions}, callback){
  //file to parse
  if(element.type === 'file' && parseFiles === true && acceptedExtensions.indexOf(element.extname) > -1){
    try{
      readFile(path, 'utf8', function(err, str){
        if(err) {
          return callback(err, undefined);
        } else {
          return callback(null, Object.assign({}, element, {stringContents : str}))
        }
      });
    } catch(e){
      callback(null, element);
    }


  //dir to parse
  } else if(element.type === 'directory' && (actualDepth < depth || depth === true)){
    readdir(element.path + '/', function(err, files){
      let children = analyseContents(files, path)
                      .filter((child)=>{
                        return child.type === 'directory' || acceptedExtensions.indexOf(child.extname) > -1
                      });
      actualDepth ++;
      asyncMap(children, function(element, colback){
        parseElement({element, path : path + '/' + element.name, parseFiles, depth, actualDepth : actualDepth, acceptedExtensions}, colback);
      }, function(err, children){
        return callback(err, Object.assign({}, element, {children}));
      });
    });
  //default return element as it was input
  } else {
      return callback(null, Object.assign({}, element));
  }
}

//cRud
export function readFromPath ({path=[], depth = 1, parseFiles=false, acceptedExtensions=['.md', '.bib', '.css']}, callback){
  const finalPath = resolve((Array.isArray(path))?path.join('/'):path);
  let element,
      name = basename(finalPath);

  try{
    element = {
      name : name,
      path : finalPath,
      type : (lstatSync(finalPath).isDirectory())?'directory':'file',
      extname : extname(name)
    }
  }catch(e){
    return callback(e, undefined);
  }

  if(element.type === 'directory'){
    return parseElement({path:finalPath, element, parseFiles, depth, actualDepth : 0, acceptedExtensions}, callback);
  } else if (acceptedExtensions.indexOf(element.extname) > -1) {
    readFile(finalPath, 'utf8', (err, str) => {
      if(err) {
        return callback(err, undefined);
      } else {
        return callback(null, Object.assign({}, element, {stringContents : str}))
      }
    });
  } else {
    return callback(new Error('the file extension is not accepted'), undefined);
  }
}

//Crud
export function createFromPath({path, type, strContents='', overwrite=true}, callback){

}

//crUd
export function updateFromPath({path, strContents}, callback){

}

//cruD
export function deleteFromPath({path}, callback){

}
