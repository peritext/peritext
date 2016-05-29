import {expect} from 'chai';
import {waterfall} from 'async';
import {resolve} from 'path';


import {createFromPath, updateFromPath, deleteFromPath, readFromPath, getAssetUri} from './../../../src/core/connectors/filesystem'

import {sample_folder_path, sample_assets_path, crud_cobaye_path} from "./../../test_settings.json";
const base_path = __dirname + '/../../' + sample_folder_path;
const base_assets_path = __dirname + '/../../' + sample_assets_path;
const crud_path = __dirname + '/../../' + crud_cobaye_path;

const params = {
  basePath: base_path
}

describe('filesystem:readFromPath', function(){

  let path;


  it('should return an error if the path asked leads to a non accepted file', function(done){
    path = ['for_tests.gif'];
    readFromPath({path, params}, function(err, data){
      expect(err).not.to.be.null;
      expect(data).to.be.undefined;
      done();
    });
  });


  it('should throw an error if the path asked does not exist', function(done){
    path = ['ekieki', 'pouetpouet.md'];
    readFromPath({path, params}, function(err, data){
      expect(data).to.be.undefined
      expect(err).not.to.be.null;
      done();
    })
  })

  it('should return a single element if asking a single file', function(done){
    path = ['content.md'];
    console.log('read from path : ', path);
    readFromPath({path, params}, function(err, element){
      expect(err).to.be.null;
      expect(element).to.be.an('object');
      expect(element).to.have.property('stringContents');
      done();
    });
  })

  it('should return the first level of tree structure if no depth is specified', function(done){
    path = '';// base_path + '/';

    readFromPath({path, params}, function(err, data){
      expect(err).to.be.null;
      expect(data).to.be.an('object');

      expect(data).to.have.property('children');
      let children = data.children;
      children.forEach(function(child){
        expect(child).not.to.have.property('children');
      });
      done();
    });
  })

  it('should parse all the dir tree if depth option is set to true', function(done){
    path = ''; //base_path + '/';
    readFromPath({path, params, depth : true}, function(err, data){
      expect(err).to.be.null;
      expect(data).to.be.an('object');

      expect(data).to.have.property('children');
      let children = data.children;
      children
        .filter((e)=>{
          return e.type === 'directory'
        }).forEach((child) => {
            expect(child).to.have.property('children')
          });

      done();
    });
  });

  it('should parse all accepted files if parseFiles option is specified', function(done){
    path = '';//base_path + '/';
    readFromPath({path, params, depth : true, parseFiles : true, acceptedExtensions : ['.md', '.bib']}, function(err, data){
      expect(err).to.be.null
      expect(data).to.be.an('object');

      data.children.filter((child) => {
        return child.type === 'file'
                && ['.md', '.bib'].indexOf(child.extname) > -1
      }).forEach(function(file){
        expect(file).to.have.property('stringContents')
      });

      data.children.filter((child) => {return child.type === 'folder'})
        .forEach(function(folder){
          folder.childrenfilter((child) => {
              return child.type === 'file'
                      && ['.md', '.bib'].indexOf(child.extname) > -1
            }).forEach(function(file){
              expect(file).to.have.property('stringContents')
            });
        })

      done();
    });
  });
});

describe('filesystem:createFromPath', function(){
  let path = crud_path + '/';



  it('should not be able to overwrite an existing file if overwrite option set to false', function(done){
    createFromPath({path: path + 'dont_overwrite.txt', params, stringContents : 'I am overwritten'}, function(err){
      expect(err).not.to.be.null
      done();
    });
  });

  it('should be able to overwrite an existing file if overwrite option is set to true', function(done){
    waterfall([
      function(callback){
        createFromPath({path: path + 'overwrite.txt', params, overwrite : true, stringContents : 'version 1'}, function(err){
          expect(err).to.be.null;
          callback(null);
        });
      },
      function(callback){
        createFromPath({path: path + 'overwrite.txt', params, overwrite : true, stringContents : 'version 2'}, function(err){
          expect(err).to.be.null;
          callback(null);
        });
      },
      function(callback){
        readFromPath({path: path + 'overwrite.txt', params, parseFiles : true, acceptedExtensions : [".txt"]}, function(err, data){
          expect(err).to.be.null;
          callback(null, data);
        });
      }
    ], function(err, contents){
      expect(err).to.be.null
      expect(contents.stringContents).to.equal('version 2');
      done();
    });
  });

  it('should create intermediary folders for file creation if required', function(done){
    let localPath = path + '/in/some/several/folders.txt';
    waterfall([
      function(callback){
        createFromPath({path: localPath, params, overwrite : true, stringContents : 'hello'}, function(err){
          expect(err).to.be.null;
          callback(null);
        });
      },
      function(callback){
        readFromPath({path: localPath, params, parseFiles : true, acceptedExtensions : [".txt"]}, function(err, data){
          expect(err).to.be.null;
          callback(null, data);
        });
      }
    ], function(err, contents){
      expect(err).to.be.null
      expect(contents.stringContents).to.equal('hello');
      done();
    });
  });
});

describe('filesystem:updateFromPath', function(){
  let path = crud_path + '/';

  it('should return an error if the asked file does not exist', function(done){
    updateFromPath({path: 'not_existing.txt', params: {basePath: crud_path}}, function(err, newElement){
      expect(err).not.to.be.null;
    });
    done();
  });

  it('should not be able to update directories', function(done){
    updateFromPath({path: path, params: {basePath: crud_path}}, function(err, newElement){
      expect(err).not.to.be.null;
    });
    done();
  });

  it('should be able to update a file content', function(done){
    const date = new Date().toString();

    waterfall([
      function(callback){
        updateFromPath({path: 'date.txt', params: {basePath: crud_path}, stringContents : date}, function(err){
          expect(err).to.be.null;
          callback(null);
        });
      },
      function(callback){
        readFromPath({path: 'date.txt', params: {basePath: crud_path}, parseFiles : true, acceptedExtensions : [".txt"]}, function(err, newElement){
          expect(err).to.be.null;
          expect(newElement.stringContents).to.equal(date);
          done();
        });
      }
    ], function(err, element){

    });
  });
});

describe('filesystem:deleteFromPath', function(){
  let path = crud_path + '/';

  it('should return an error if the asked tree node does not exist', function(done){
    deleteFromPath({path: path + '/dont/exists', params}, function(err){
      expect(err).not.to.be.null;
      done();
    })
  });

  it('should recursively delete a folder even if it is not empty', function(done){
    let localPath = path + '/folder_to_delete/with/some/contents/inside.txt';
    waterfall([
      function(callback){
        //create a folder
        createFromPath({path: localPath, params, overwrite: true, stringContents: 'hello'}, function(err){
          expect(err).to.be.null;
          callback(null);
        });
      },
      //delete it
      function(callback){
        deleteFromPath({path: path + '/folder_to_delete/', params}, function(err){
          expect(err).to.be.null;
          callback(null);
        });
      },
      //try to read it
      function(callback){
        readFromPath({path: path + '/folder_to_delete/', params}, function(err){
          expect(err).not.to.be.null;
          callback(null);
        });
      }
    ], function(err, contents){
      expect(err).to.be.null
      done();
    });
  });
});

describe('filesystem:getAssetUri', function() {
  it('should return the correct asset uri', function(done) {
    let test = 'img.jpg';
    let expected = resolve(base_assets_path + '/' + test);
    getAssetUri({path: test, params: {basePath: base_assets_path}}, function(err, path){
      expect(err).to.be.null;
      expect(path).to.equal(expected);
      done();
    });
  });
})
