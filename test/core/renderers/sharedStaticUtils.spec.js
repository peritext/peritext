import {expect} from 'chai';

import {composeRenderedSections} from '../../../src/renderers/sharedStaticUtils';
import {sectionTypeModels, settingsModels} from '../../../src/core/models';
import {resolveSettings} from '../../../src/core/utils/modelUtils';

/*
const sectionTypes = Object.keys(sectionTypeModels.acceptedTypes);

describe('shared static utils', ()=>{
  describe('composeRenderedSections', ()=>{
    it ('should render empty sections', (done)=>{
      const none = composeRenderedSections();
      expect(none).to.be.defined;
      expect(none).to.have.property('renderedSections');
      expect(none.renderedSections).to.have.length(0);
      done();
    });
    it ('should not modify input css styles if no settings are provided', (done)=>{
      const none = composeRenderedSections(undefined, undefined, 'mycss');
      expect(none.finalStyle).to.equal('mycss');
      done();
    });
    it('should  update even if styles are not given as a string', done=>{
      const none = composeRenderedSections(undefined, undefined, {});
      expect(none.finalStyle).to.equal('');
      done();
    });
    describe('handle all settings configurations', ()=>{
      const mock = [{
          metadata: [
            {
              domain: 'global',
              key: 'citeKey',
              value: 'mock'
            },
            {
              domain: 'global',
              key: 'bibType',
              value: 'book'
            }
          ],
          contents: [
            {
              node: 'text',
              text: 'coucou'
            }
          ],
          notes: [],
          resources: [],
          contextualizers: [],
          customizers: [],
          contextualizations: []
        }];
      sectionTypes.forEach(sectionType => {
        let sets = resolveSettings({}, sectionType, settingsModels);
        mock[0].metadata[1].value = sectionType;

        it ('should compose rendered sections successfully for section type ' + sectionType + ' with default settings', done =>{
          const composed = composeRenderedSections(mock, sets);
          expect(composed).to.be.defined;
          expect(composed.finalStyle).to.be.defined;
          expect(composed.renderedSections).to.be.defined;
          done();
        });

        // check all that settings configurations don't break
        const props = Object.keys(sets);
        props.forEach(prop => {
          const mod = settingsModels[prop];
          if (mod.values) {
            mod.values.forEach(possibility=> {
              const possibleSettings = Object.assign({}, sets);
              possibleSettings[prop] = possibility;
              it ('should compose rendered sections successfully for section type ' + sectionType + ' with setting ' + prop + ' set to '+ possibility, (done)=> {
                const composed = composeRenderedSections(mock, possibleSettings);
                expect(composed).to.be.defined;
                expect(composed.finalStyle).to.be.defined;
                expect(composed.renderedSections).to.be.defined;
                done();
              });
            });
          }
        });
      });
      // check notes settings
      it ('should display a note section or note regarding notePosition settings', (done)=>{
        mock[0].notes = [{
          contents: [],
          id: 'mock1',
          noteNumber: 1
        }];
        mock[0].metadata[1].value = '';

        let settings = resolveSettings({notesPosition: 'document-end'}, 'book', settingsModels);
        let composed = composeRenderedSections(mock, settings);
        let rendered = composed.renderedSections;
        let hasEndNotes = rendered.find(section=>{
          return section.type === 'endnotes';
        });
        expect(hasEndNotes).to.be.defined;

        settings = resolveSettings({notesPosition: 'footnotes'}, 'book', settingsModels);
        composed = composeRenderedSections(mock, settings);
        rendered = composed.renderedSections;
        hasEndNotes = rendered.find(section=>{
          return section.type === 'endnotes';
        });
        expect(hasEndNotes).not.to.be.defined;
        done();
      });



      // check figures settings
      // check references settings
      // check glossary settings
      // check figures table settings
      // check toc
      // check table
    });
  });
});
*/
