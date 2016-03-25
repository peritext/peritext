import {parseMarkdown as extractIncludes} from './../../converters/markdownIncludesParser';
import {map as asyncMap, waterfall} from 'async';

/*
 * I extract md includes and inline resources descriptions from a file object
 * @child : a fsElement ({type, name, path, extname})
 * @params : local parsing params - for instance templates and includes syntax
 */
const populateElementWithIncludes = function(child, params, callback){
  extractIncludes(child.stringContents,
    {
      includeWrappingChars : params.templateWrappingCharacters,
      resWrappingChars : params.inlineResourceDescriptionWrappingCharacters
    }, function(err, {extracted, cleanStr}){
      if(!err){
        child.extracted = extracted;
        child.stringContents = cleanStr;
      }
      callback(err, child);
  });
}

/*
 * I produce a nested structure of the included files in a given file
 * @ex : the include expression object
 * @file : the file to populate
 */
const include = (ex, file, mdFilesWithIncludes)=>{
    let fileIndex;
    let fileToInclude = mdFilesWithIncludes
      .find((file, index)=>{
        if(file.name === ex.statement){
          fileIndex = index;
          return true;
        }
      });
    if(fileToInclude !== undefined){
      var fileHasIncludes = fileToInclude
                              .extracted
                                .filter((ex)=>{
                                  return ex.type === 'includeStatement';
                                }).length > 0;
      if(fileHasIncludes){
        resolveFileIncludes(fileToInclude, mdFilesWithIncludes);
      }
      file.includes.push(fileToInclude);
      mdFilesWithIncludes.splice(fileIndex, 1);
    }
}

/*
 * I monitor the nested including structure population process of a file
 */
const resolveFileIncludes = function(file, mdFilesWithIncludes){
  file.includes = [];
  file.includeStatements = [];
  for(let i = file.extracted.length - 1 ; i >= 0 ; i--){
    let ex = file.extracted[i];
    if(ex.type === 'includeStatement'){
      include(ex, file, mdFilesWithIncludes);
      file.extracted.splice(i, 1);
      file.includeStatements.push(ex);
    }
  }
}

/*
 * I turn non nested file object into include-based nested file objects
 * @mdFilesWithIncludes : non nested file objects
 */
const nestIncludes = function({resourcesStr, mdFilesWithIncludes, params}, cb){

  mdFilesWithIncludes.forEach(function(mdfile){
    resolveFileIncludes(mdfile, mdFilesWithIncludes);
  });
  cb(null, {resourcesStr, mdFilesWithIncludes});
}

/*
 * I consume the nested property 'include' by populating its string contents with includes contents,
 * resolved recursively
 * @file : the file
 */
const buildFinalMdContent = function(file){
  let content = file.stringContents;
  const hasIncludes = file.includes && file.includes.length && file.includes.length > 0;
  if(hasIncludes){
    file.includeStatements
      .filter((ex)=>{
        return ex.type === 'includeStatement';
      })
      .forEach((ex)=>{
        let targetIncluded = file.includes.find((file2)=>{
          return file2.name === ex.statement;
        });
        let contentToInclude = buildFinalMdContent(targetIncluded);
        content = [content.substr(0, ex.index), contentToInclude, content.substr(ex.index)].join('');
      });
  }

  return content;
}

/*
 * I turn an array of nested file objects into one single string
 * @mdFilesWithIncludes : non nested file objects
 */
const resolveNestedIncludes = function({resourcesStr, mdFilesWithIncludes, params}, cb){
  let contentStr = mdFilesWithIncludes
                      .reduce((str, file) => {
                        return str + buildFinalMdContent(file);
                      }, '');
  cb(null, {contentStr, resourcesStr, params});
}

const concatCustomizers = function(newTree){
  return newTree.children
      .filter((child) => {
        return child.type === 'directory' && child.name.charAt(0) === '_';
      })
      .map((child) => {
        let contents = {};
        child.children.forEach((c) =>{
          contents[c.name] = c.stringContents;
        })
        return {
          type : child.name.substr(1),
          contents
        }
      });
}

/*
 * MAIN
 * I turn a fsTree into a dumTree, that is a tree which presents
 * .bib resources and .md files contents concatenated by folder (according to inner 'include' statements and then automatically)
 */
export function concatTree(tree, params, callback){
  let newTree = Object.assign({}, tree);
  //concat .bib res files
  let resources = newTree.children
                    .filter((child) => {
                      return child.type === 'file' && child.extname === '.bib';
                    })
                    .reduce((str, child) => {
                      if(child.stringContents !== undefined){
                        return str + '\n' + child.stringContents;
                      } else return str;
                    }, '');

  let mdContents = newTree.children
                    .filter((child) => {
                      return child.type === 'file' && child.extname === '.md';
                    });
  let childrenDirs = newTree.children
                    .filter((child) => {
                      return child.type === 'directory' && child.name.charAt(0) !== '_';
                    });
  let childrenCustomizers = concatCustomizers(newTree);
  waterfall([
      //extract md files elements includes statements
      function(cb){
        asyncMap(mdContents, function(child, callback){
          populateElementWithIncludes(child, params, callback);
        }, function(err, mdFilesWithIncludes){
          //concat extracted bibtex resources
          let resourcesStr = mdFilesWithIncludes
                        .reduce((str, mdFile) => {
                          mdFile.extracted
                            .filter((ex)=>{
                              return ex.type === 'resourceStatement';
                            }).forEach((ex)=>{
                              str += ex.statement
                            })
                          return str;
                        }, resources);
          cb(null, {resourcesStr, mdFilesWithIncludes, params});
        });
      },
      nestIncludes,
      resolveNestedIncludes
    ], function(err, {resourcesStr, contentStr}){
        newTree.resourcesStr = resourcesStr;
        newTree.contentStr = contentStr;
        if(childrenCustomizers.length > 0){
          newTree.customizers = childrenCustomizers;
        }
        //recursively repeat dat stuf with children dirs
        asyncMap(childrenDirs, function(dir, callback){
          concatTree(dir, params, callback);
        }, function(err, populatedDirs){
          newTree.children = populatedDirs;
          callback(err, newTree);
        });
  });
}
