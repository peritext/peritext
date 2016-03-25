import {expect} from 'chai';

import {sectionTypeModels, resourceModels, metadataModels} from './../../../src/core/models'


describe('models:metadataModels', function(){
  it('should have all requiredForTypes and applicableInTypes values pointing to actual section types', function(done){
    const propsToCheck = ['requiredForTypes', 'applicableInTypes'];
    propsToCheck.forEach(function(propToCheck){
      for(let i in metadataModels){
        for(let j in metadataModels[i]){
          let prop = metadataModels[i][j];
          if(prop[propToCheck]){
            prop[propToCheck].forEach(function(type){
              let hasAType;
              if(type !== '*'){
                for(let t in sectionTypeModels.acceptedTypes){
                  if(t === type){
                    hasAType = true;
                  }
                }
              }else{
                hasAType = true;
              }
              expect(hasAType).to.be.true;
            })
          }

        }
      }
    });
    done();
  });

  it('should have all propagatesTo properties pointing to an actual property model', function(done){
    for(let i in metadataModels){
      for(let j in metadataModels[i]){
        let prop = metadataModels[i][j];
        if(prop['propagatesTo']){
          prop['propagatesTo'].forEach(function(to){
            to = to.split('_');

            let domain = (to.length > 1)?to.shift():'general';
            let key = to.join('_');

            expect(metadataModels[domain][key]).not.to.be.undefined;
          })
        }

      }
    }
    done();
  })
})

describe("models:resourceModels", function(){
  it('should have all properties categories pointing to an existing category', function(done){

    for(let i in resourceModels.individual){
      let model = resourceModels.individual[i];
      if(model.categories){
        model.categories.forEach((modelCategory) => {
          let hasCat;

          for(let cat in resourceModels.collective){
            if(modelCategory === cat){
              hasCat = true;
            }
          }

          expect(hasCat).to.be.true
        })
      }
    }
    done();
  })
})
