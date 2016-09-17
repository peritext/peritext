import {expect} from 'chai';

import {
  getDocument,
  getSection,
  getForewords,
  getTableOfSections,
  getTableOfFigures,
  getGlossary,

  getResourceContextualizations,
  getContextualizerContextualizations
} from '../../src/core/getters';
import {document} from '../_mock_content/mock';

describe('getters:getDocument', ()=>{
  it('should return a copy of the whole document', (done)=>{
    const newDocument = getDocument(document);
    expect(newDocument).to.be.defined;
    expect(JSON.stringify(newDocument)).to.equal(JSON.stringify(document));
    expect(newDocument).to.not.equal(document);
    done();
  });
});

describe('getters:getSection', ()=>{
  it('should return an object containing section contents and related resources/contextualizers/contextualizations', (done)=>{
    const section = getSection(document, 'partie_1');
    expect(section).to.be.an('object');
    expect(section).to.have.property('resources');
    expect(section).to.have.property('contextualizers');
    expect(section).to.have.property('contextualizations');
    expect(section.contextualizations).to.be.an('array');
    done();
  });
});

describe('getters:getForewords', ()=>{
  it('should return an object containing forewords contents and related resources/contextualizers/contextualizations', (done)=>{
    const section = getForewords(document);
    expect(section).to.be.an('object');
    expect(section).to.have.property('resources');
    expect(section).to.have.property('contextualizers');
    expect(section).to.have.property('contextualizations');
    expect(section.contextualizations).to.be.an('array');
    done();
  });
});

describe('getters:getTableOfSections', ()=>{
  it('should return a valid table of sections', (done)=>{
    const tableOfSections = getTableOfSections(document);
    expect(tableOfSections).to.be.an('array');
    tableOfSections.forEach(item => {
      expect(item).to.be.an('object');
      expect(item).to.have.property('id');
      expect(item).to.have.property('generalityLevel');
      expect(item).to.have.property('title');
    })
    done();
  });
});

describe('getters:getTableOfFigures', ()=>{
  it('should return id and number of each contextualizations that have a figureId', (done)=>{
    const contexts = {
      test1: {
        title: 'with figure',
        figureId: 'test1',
        figureNumber: 1
      },
      test2: {
        title: 'without figure',
      }
    };
    const nDoc = Object.assign({}, document, {contextualizations: contexts});
    const tableOfFigures = getTableOfFigures(nDoc);
    expect(tableOfFigures).to.be.an('array');
    expect(tableOfFigures).to.have.length(1);
    done();
  });
});

describe('getters:getGlossary', ()=>{
  it('should return a list of entity resources', (done)=>{
    const glossary = getGlossary(document);
    expect(glossary).to.be.an('array');
    glossary.forEach(entry=> {
      expect(entry).to.have.property('id');
      expect(entry).to.have.property('aliases');
    })
    done();
  });
});

describe('getters:getResourceContextualizations', ()=>{
  it('should return a list of contextualizations using with the resource', (done)=>{
    Object.keys(document.contextualizations)
    .map(key => document.contextualizations[key])
    .forEach(contextualization => {
      const res = contextualization.resources[0];
      const conts = getResourceContextualizations(document, res);
      expect(conts).to.be.an('array');
      expect(conts).to.be.length.above(0);
    });
    done();
  });
});

describe('getters:getContextualizerContextualizations', ()=>{
  it('should return a list of contextualizations involved with the contextualizer', (done)=>{
    Object.keys(document.contextualizations)
    .map(key => document.contextualizations[key])
    .forEach(contextualization => {
      const cont = contextualization.contextualizer;
      const conts = getContextualizerContextualizations(document, cont);
      expect(conts).to.be.an('array');
      expect(conts).to.be.length.above(0);
    });
    done();
  });
});

/**
======================================================
======================================================
======================================================
======================================================
*/
/*
describe('getters:generic', ()=>{
  it('should ...', (done)=>{
    // const tableOfContents = getTableOfContents(document);

    done();
  });
});
*/
