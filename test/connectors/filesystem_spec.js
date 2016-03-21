import {expect} from 'chai';
import {waterfall} from 'async';
import {resolve} from 'path';


import {getStringFromPath, getTreeFromPath} from './../../src/connectors/filesystem'

import {sample_folder_path} from "./../test_settings.json";
const base_path = __dirname + '/../' + sample_folder_path;


describe('filesystem:getStringFromPath', function(){

  let path;

  it('should throw an error if the file does not exist', function(){
    path = [base_path, 'kikalou', 'pouetpouet.md']
    getStringFromPath({path}, function(err, data){
      expect(data).to.be.undefined
      expect(err).not.to.be.null;
    })
  })

  it('should throw an error if the file cannot be parsed as text', function(){
    path = [base_path, 'for_tests.gif']
    getStringFromPath({path}, function(err, data){
      expect(data).to.be.undefined
      expect(err).not.to.be.null;
    })
  })

  it('should return string data if the file exists and is text', function(){
    path = ['content.md']
    getStringFromPath(path, function(err, data){
      expect(data).to.be.a('string')
      expect(err).to.be.null
    })
  });
})

describe('filesystem:getTreeFromPath', function(){

  let path;

  it('should return the first level of tree structure if no depth is specified', function(){
    path = base_path + '/';

    getTreeFromPath({path}, function(err, data){
      expect(err).to.be.null;
      expect(data).to.be.an('object')
      expect(data).to.have.property('children')
      let children = data.children;

      children.forEach(function(child){
        expect(child).not.to.have.property('children')
      });
    })
  })


  it('should return an error if path target is not a directory', function(){
    path = [base_path , '/for_tests.gif'];
    getTreeFromPath({path}, function(err, data){
      expect(err).not.to.be.null;
      expect(data).to.be.undefined;
    });
  })

  it('should parse all the tree if depth option is set to true', function(){
    path = base_path + '/';
    getTreeFromPath({path, depth : true}, function(err, data){
      // console.log(JSON.stringify(data, null, 6))
      expect(err).to.be.null;
      expect(data).to.be.an('object')
      expect(data).to.have.property('children')
      // let children = data.children;

      // children.forEach(function(child){
      //   expect(child).not.to.have.property('children')
      // });
    })
  })

  // it('should parse string contents if parse option is specified', function(){})


})
