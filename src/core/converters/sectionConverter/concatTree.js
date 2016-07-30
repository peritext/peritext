import {parseMarkdown as extractIncludes} from './../../converters/markdownIncludesParser';
import {map as asyncMap, waterfall} from 'async';

let resolveFileIncludes;


/**
 * I extract md includes and inline resources descriptions from a file object
 * @child : a fsElement ({type, name, path, extname})
 * @params : local parsing params - for instance templates and includes syntax
 */
const populateElementWithIncludes = function(child, params, callback) {
  extractIncludes(child.stringContents,
    {
      includeWrappingChars: params.templateWrappingCharacters,
      resWrappingChars: params.inlineResourceDescriptionWrappingCharacters
    }, function(err, {extracted, cleanStr}) {
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
const include = (ex, file, mdFilesWithIncludes)=>{
  let fileIndex;
  const fileToInclude = mdFilesWithIncludes
      .find((otherFile, index)=>{
        if (otherFile.name === ex.statement) {
          fileIndex = index;
          return true;
        }
      });
  if (fileToInclude !== undefined) {
    const fileHasIncludes = fileToInclude
                              .extracted
                                .filter((rawExtracted)=>{
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
resolveFileIncludes = function(file, mdFilesWithIncludes) {
  file.includes = [];
  file.includeStatements = [];
  for (let index = file.extracted.length - 1; index >= 0; index--) {
    const ex = file.extracted[index];
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
const nestIncludes = ({resourcesStr, mdFilesWithIncludes, params}, cb) =>{

  mdFilesWithIncludes.forEach((mdfile) =>{
    resolveFileIncludes(mdfile, mdFilesWithIncludes);
  });
  cb(null, {resourcesStr, mdFilesWithIncludes});
};

/**
 * I consume the nested property 'include' by populating its string contents with includes contents,
 * resolved recursively
 * @file : the file
 */
const buildFinalMdContent = (file) =>{
  let content = file.stringContents;
  const hasIncludes = file.includes && file.includes.length && file.includes.length > 0;
  if (hasIncludes) {
    file.includeStatements
      .filter((ex)=>{
        return ex.type === 'includeStatement';
      })
      .forEach((ex)=>{
        const targetIncluded = file.includes.find((file2)=>{
          return file2.name === ex.statement;
        });
        const contentToInclude = buildFinalMdContent(targetIncluded);
        content = [content.substr(0, ex.index), contentToInclude, content.substr(ex.index)].join('');
      });
  }

  return content;
};

/**
 * I turn an array of nested file objects into one single string
 * @mdFilesWithIncludes : non nested file objects
 */
const resolveNestedIncludes = ({resourcesStr, mdFilesWithIncludes, params}, cb) =>{
  const contentStr = mdFilesWithIncludes
                      .reduce((str, file) => {
                        return str + buildFinalMdContent(file);
                      }, '');
  cb(null, {contentStr, resourcesStr, params});
};

const concatCustomizers = (newTree) =>{
  return newTree.children
      .filter((child) => {
        return child.type === 'directory' && child.name.charAt(0) === '_';
      })
      .map((child) => {
        const contents = {};
        child.children.forEach((subChild) =>{
          contents[subChild.name] = subChild.stringContents;
        });
        return {
          type: child.name.substr(1),
          contents
        };
      });
};

/**
 * MAIN
 * I turn a fsTree into a dumTree, that is a tree which presents
 * .bib resources and .md files contents concatenated by folder (according to inner 'include' statements and then automatically)
 */
export const concatTree = (tree, params, callback) => {
  const newTree = Object.assign({}, tree);
  // concat .bib res files
  const resources = newTree.children
                    .filter((child) => {
                      return child.type === 'file' && child.extname === '.bib';
                    })
                    .reduce((str, child) => {
                      if (child.stringContents !== undefined) {
                        return str + '\n' + child.stringContents;
                      }
                      return str;
                    }, '');

  const mdContents = newTree.children
                    .filter((child) => {
                      return child.type === 'file' && child.extname === '.md';
                    });
  const childrenDirs = newTree.children
                    .filter((child) => {
                      return child.type === 'directory' && child.name.charAt(0) !== '_';
                    });
  const childrenCustomizers = concatCustomizers(newTree);
  waterfall([
    // extract md files elements includes statements
    (cb) =>{
      asyncMap(mdContents, (child, cback) =>{
        populateElementWithIncludes(child, params, cback);
      }, (err, mdFilesWithIncludes) =>{
        // concat extracted bibtex resources
        const resourcesStr = mdFilesWithIncludes
                      .reduce((str, mdFile) => {
                        let newStr = str;
                        mdFile.extracted
                          .filter((ex)=>{
                            return ex.type === 'resourceStatement';
                          }).forEach((ex)=>{
                            newStr += ex.statement;
                          });
                        return newStr;
                      }, resources);
        cb(null, {resourcesStr, mdFilesWithIncludes, params});
      });
    },
    nestIncludes,
    resolveNestedIncludes
  ], (err, {resourcesStr, contentStr}) =>{
    newTree.resourcesStr = resourcesStr;
    newTree.contentStr = contentStr;
    if (childrenCustomizers.length > 0) {
      newTree.customizers = childrenCustomizers;
    }
    // recursively repeat dat stuff with children dirs
    asyncMap(childrenDirs, (dir, cback) =>{
      concatTree(dir, params, cback);
    }, (error, populatedDirs) =>{
      newTree.children = populatedDirs;
      callback(error, newTree);
    });
  });
};
