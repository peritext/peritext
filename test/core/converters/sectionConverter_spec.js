import {expect} from 'chai';
import {waterfall} from 'async';
import {writeFile} from 'fs';

import {parseSection, serializeSectionList} from './../../../src/core/converters/sectionConverter';
import {createFromPath, updateFromPath, deleteFromPath, readFromPath} from './../../../src/core/connectors/filesystem';
import defaultParameters from './../../../src/config/defaultParameters'
import * as models from './../../../src/core/models/'

import {sample_folder_path, crud_cobaye_path} from "./../../test_settings.json";
const base_path = __dirname + '/../../' + sample_folder_path;

describe('sectionConverter:parser', function(){
  it('should parse sample content successfully', function(done){
    waterfall([
        function(callback){
          readFromPath({path:base_path, depth : true, parseFiles : true}, function(err, results){
            callback(err, results);
          });
        },
        function(tree, callback){
          parseSection({tree, models, parameters : defaultParameters}, callback);
        }
      ],
      function(err, results){
        writeFile(base_path + '/parsing_output.json', JSON.stringify(results, null, 2), 'utf8', function(err){
        });
        // console.log(tree,  err);
        done();
      });
  });

  it('should have attributed unique identifiers to all original objects', function(done){
    waterfall([
        function(callback){
          readFromPath({path:base_path, depth : true, parseFiles : true}, function(err, results){
            callback(err, results);
          });
        },
        function(tree, callback){
          parseSection({tree, models, parameters : defaultParameters}, callback);
        }
      ],
      function(err, results){
        let number = 0;
        results.sections.forEach((section) =>{
          //verifying metadata
          section.metadata.forEach((meta1) => {
            number = 0;
            section.metadata.forEach((meta2) =>{
              if(meta1.domain === meta2.domain && meta1.key === meta2.key){
                number ++;
              };
            });
            expect(number).to.equal(1);
          });
          //verifying citekeys, first listing all citekeyed objects (resources and contextualizers)
          const citeKeyed = section.resources.concat(section.contextualizers);
          citeKeyed.forEach((obj)=>{
            expect(obj).to.have.property('citeKey');
            number = 0;
            citeKeyed.forEach((obj2)=>{
              if(obj.citeKey === obj2.citeKey){
                number++;
              }
            });
            expect(number).to.equal(1);
          })
        });
        // console.log(tree,  err);
        done();
      });
  });
})


describe('sectionConverter:serializer', function(){
  it('should serialize without errors, inconsistancies or undefined values', function(done){
    let parsedFsTree;
    waterfall([
        function(callback){
          readFromPath({path:base_path, depth : true, parseFiles : true}, function(err, results){
            parsedFsTree = results;
            callback(err, results);
          });
        },
        function(tree, callback){
          parseSection({tree, models, parameters : defaultParameters}, callback);
        },
        function(results, callback){
          serializeSectionList({sectionList : results.sections, models, basePath : base_path}, callback);
        }
      ],
      function(err, fsTree){
        // tests
        fsTree.children.forEach((child) => {
          expect(child.stringContents).not.to.equal("undefined");
          if(child.type === "file"){
            expect(child).not.to.have.key("children");
          } else if(child.type === "folder"){
            expect(child.extname).to.equal("");
          }
        })
        writeFile(base_path + '/serialized_fstree.json', JSON.stringify(fsTree, null, 2), 'utf8', function(err){
        });
        done();
      });
  });
});
