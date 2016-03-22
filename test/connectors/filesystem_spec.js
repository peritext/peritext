import {expect} from 'chai';
import {waterfall} from 'async';
import {resolve} from 'path';


import {readFromPath} from './../../src/connectors/filesystem'

import {sample_folder_path, crud_cobaye_path} from "./../test_settings.json";
const base_path = __dirname + '/../' + sample_folder_path;



describe('filesystem:readFromPath', function(){

  let path;


  it('should return an error if the path asked leads to a non accepted file', function(done){
    path = [base_path, 'for_tests.gif'];
    readFromPath({path}, function(err, data){
      expect(err).not.to.be.null;
      expect(data).to.be.undefined;
      done();
    });
  });


  it('should throw an error if the path asked does not exist', function(done){
    path = [base_path, 'kikalou', 'pouetpouet.md'];
    readFromPath({path}, function(err, data){
      expect(data).to.be.undefined
      expect(err).not.to.be.null;
      done();
    })
  })

  it('should return a single element if asking a single file', function(done){
    path = [base_path , '/content.md'];
    readFromPath({path}, function(err, element){
      expect(err).to.be.null;
      expect(element).to.be.an('object');
      expect(element).to.have.property('stringContents');
      done();
    });
  })

  it('should return the first level of tree structure if no depth is specified', function(done){
    path = base_path + '/';

    readFromPath({path}, function(err, data){
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
    path = base_path + '/';
    readFromPath({path, depth : true}, function(err, data){
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
    path = base_path + '/';
    readFromPath({path, depth : true, parseFiles : true, acceptedExtensions : ['.md', '.bib']}, function(err, data){
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
  let path = crud_cobaye_path + '/';

  it('should be able to create an empty file', function(done){
    done();
  });

  it('should be able to create a file with contents', function(done){
    done();
  });

  it('should be able to create a folder', function(done){
    done();
  });

  it('should be able not to overwrite an existing file if specified', function(done){
    done();
  });

  it('should create intermediary folders for file creation if required', function(done){
    done();
  });
});

describe('filesystem:updateFromPath', function(){
  it('should return an error if the asked tree node does not exist', function(done){
    done();
  });
});

describe('filesystem:deleteFromPath', function(){
  it('should return an error if the asked tree node does not exist', function(done){
    done();
  });

  it('should recursively delete a folder even if it is not empty', function(done){
    done();
  });
});
