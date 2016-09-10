import {expect} from 'chai';

import * as lib from './../../../src/core/utils/sectionUtils';

const data = [
  {
    domain: "twitter",
    key: "title",
    value: "title1"
  },
  {
    domain: "twitter",
    key: "author",
    value: "success"
  }
]

describe('sectionUtils:getMetaValue', function(){
  it('should return a meta value if present', function(done){
    const response = lib.getMetaValue(data, "twitter", "author");
    expect(response).to.equal("success");
    done();
  });
  it('should not return a meta value if not present', function(done){
    const response = lib.getMetaValue(data, "twitter", "notthere");
    expect(response).to.equal(undefined);
    done();
  });
});

describe('sectionUtils:setMetaValue', function(){
  it('should transform the targeted meta value', function(done){
    const response = lib.setMetaValue(data, "twitter", "title", "newtitle");
    expect(lib.getMetaValue(data, "twitter", "title")).to.equal("newtitle");
    done();
  });
  it('should return metalist unharm if target not found', function(done){
    const response = lib.setMetaValue(data, "twitter", "notthere", "nogo");
    expect(lib.getMetaValue(data, "twitter", "notthere")).to.equal(undefined);
    done();
  });
});

describe('sectionUtils:hasMeta', function(){
  it('should return true if meta is present', function(done){
    const response = lib.hasMeta(data, "twitter", "title");
    expect(response).to.equal(true);
    done();
  });
  it('should return false if meta not present', function(done){
    const response = lib.hasMeta(data, "twitter", "notthere");
    expect(response).to.equal(false);
    done();
  });
  it('should not accept when no domain is given', function(done){
    try{
      const response = lib.hasMeta(data, undefined, "cocou");
    }catch(e){
      expect(e).to.be.defined;
    }
    done();
  });
});


describe('sectionUtils:sameMetaScope', function(){
  const metas = [
    {
      domain : "1",
      key : "2",
      value : "val1"
    },
    {
      domain : "1",
      key : "2",
      value : "val2"
    },
    {
      domain : "1",
      key : "3",
      value : "val3"
    }
  ]
  it('should return true if same', function(done){
    const response = lib.sameMetaScope(metas[0], metas[1]);
    expect(response).to.equal(true);
    done();
  });
  it('should return false if not same', function(done){
    const response = lib.sameMetaScope(metas[0], metas[2]);
    expect(response).to.equal(false);
    done();
  });
});

describe('sectionUtils:metaStringToCouple', function(){
  const complete = "twitter_title";
  const incomplete = "title";
  it('should predictively convert str to couple', function(done){
    const response = lib.metaStringToCouple(complete);
    expect(response).to.eql({domain: "twitter", key: "title"});
    done();
  });
  it('should handle no-domain couple (e.g. : "title")', function(done){
    const response = lib.metaStringToCouple(incomplete);
    expect(response).to.eql({domain: "general", key: "title"});
    done();
  });
});
