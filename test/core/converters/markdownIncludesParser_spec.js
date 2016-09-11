import {expect} from 'chai';

import {parseMarkdown} from '../../../src/core/converters/markdownIncludesParser'

// import {templateWrappingCharacters as includeWrappingChars, inlineResourceDescriptionWrappingCharacters as resWrappingChars} from './../../src/config/defaultParameters';

//arbitrary (but probably default) wrapping charsets for the tests
const includeWrappingChars = [
  '${',
  '}'
];

const resWrappingChars = [
  '$$$',
  '$$$'
]

const simpleCase = `
\${include:valid1}

$$$
@resource{id,
  test = {1, 2, 3},
  ok = ça va $$$ bling bling bling
  resource=hello
}
$$$

\${include:valid2}
`

const simpleCaseResultTest = `
includeStatement
resourceStatement
includeStatement
`


const trickyCases = [
//case inline include
`Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod

heyo yolo \${include:valid1} ok

tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
`,
//case include md in include resource
`$$$
@resource{id,
  test = {1, 2, 3},
  ok = ça va $$$ bling bling bling
  include in resource = \${include:should remain untouched}
}
$$$

\${include:valid1} \${include:valid2}`,
`Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod

heyo yolo \${include:valid1} ok

tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

$$$
@resource{id,
  test = {1, 2, 3},
  ok = ça va $$$ bling bling bling
  include in resource = \${include:should remain untouched}
}
$$$

Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

\${include:valid2}`
]

const errorCases = [
]

/*
describe('markdown includes parser', function(){
  it('should be able to parse resources inline desc and include calls', function(done){
    parseMarkdown(simpleCase, {includeWrappingChars, resWrappingChars}, function(err, {extracted, cleanStr}){
      expect(err).to.be.null;
      expect(extracted.filter((ex) => {
        return ex.type === 'resourceStatement';
      })).to.have.lengthOf(1);
      expect(extracted.filter((ex) => {
        return ex.type === 'includeStatement';
      })).to.have.lengthOf(2);

      extracted.forEach((ex) => {
        cleanStr = [cleanStr.substr(0, ex.index), ex.type, cleanStr.substr(ex.index)].join('')
      });

      expect(simpleCaseResultTest.trim()).to.equal(cleanStr.trim());

      done();
    })
  });

  it('should be able to parse an inline include', function(done){
    parseMarkdown(trickyCases[0], {includeWrappingChars, resWrappingChars}, function(err, {extracted, cleanStr}){
      expect(err).to.be.null;
      expect(extracted.filter((ex) => {
        return ex.type === 'resourceStatement';
      })).to.have.lengthOf(0);
      expect(extracted.filter((ex) => {
        return ex.type === 'includeStatement';
      })).to.have.lengthOf(1);
    });
    done();
  });

  it('should not parse include inside resources descriptions', function(done){
    parseMarkdown(trickyCases[1], {includeWrappingChars, resWrappingChars}, function(err, {extracted, cleanStr}){
      expect(err).to.be.null;
      expect(extracted.filter((ex) => {
        return ex.type === 'resourceStatement';
      })).to.have.lengthOf(1);
      expect(extracted.filter((ex) => {
        return ex.type === 'includeStatement';
      })).to.have.lengthOf(2);

      done();
    })
  });

  it('should be able to parse resources inline desc and include calls', function(done){
    parseMarkdown(trickyCases[2], {includeWrappingChars, resWrappingChars}, function(err, {extracted, cleanStr}){
      expect(err).to.be.null;
      expect(extracted.filter((ex) => {
        return ex.type === 'resourceStatement';
      })).to.have.lengthOf(1);
      expect(extracted.filter((ex) => {
        return ex.type === 'includeStatement';
      })).to.have.lengthOf(2);

      done();
    })
  });
});
*/
