import {expect} from 'chai';

import {serializeBibTexObject, parseBibTexStr} from './../../src/converters/bibTexConverter';



const validSyntaxes = [
  `@incollection{in_collection,
      author       = {Peter Farindon},
      title        = {The title of the work},
      booktitle    = {The title of the book},
      publisher    = {The name of {the} publisher},
      year         = 1993,
      editor       = {The editor},
      volume       = 4,
      series       = 5,
      chapter      = 8,
      pages        = {201-213},
      address      = {The address of the publisher},
      edition      = 3,
      month        = 7,
      note         = {An optional note}
    }`,
    `@incollection{in_collection,
      author       = {Peter Farindon},
      author       = {Jimmy Hendrix},
      keyword     = {test1},
      keyword     = {test2},
      title        = {The title of the work},
      booktitle    = {The title of the book},
      publisher    = {The name of {the} publisher},
      year         = 1993,
      editor       = {The editor},
      volume       = 4,
      series       = 5,
      chapter      = 8,
      pages        = {201-213},
      address      = {The address of the publisher},
      edition      = 3,
      month        = 7,
      note         = {An optional note}
    }`,
    `@incollection{in_collection,
      author       = "Peter Farindon",
      author       = "Jimmy {H}endrix",
      keyword      = "test1",
      keyword      = "test2",
      title        = "The title of {the} work",
      booktitle    = "The title of the book",
      publisher    = "The {name {of} the} publisher",
      year         = 1993,
      editor       = "The editor",
      volume       = 4,
      series       = 5,
      chapter      = 8,
      pages        = "201-213",
      address      = "The address of the publisher",
      edition      = 3,
      month        = 7,
      note         = "An optional note"
    }`
]


const invalidSyntaxes = [
  `@incollection{in_collection,
      author       = {Peter Farindon},
      title        = {The title of the work},
      booktitle    = {The title of the book},
      publisher    = {The name of {the} publisher,
      year         = 1993,
      editor       = {The editor},
      volume       = 4,
      series       = 5,
      chapter      = 8,
      pages        = {201-213},
      address      = {The address of the publisher},
      edition      = 3,
      month        = 7,
      note         = {An optional note}
    }`,
    `incollection{in_collection,
      author       = "Peter Farindon",
      author       = "Jimmy {H}endrix",
      keyword      = "test1",
      keyword      = "test2",
      title        = "The title of {the} work",
      booktitle    = "The title of the book",
      publisher    = "The {name {of} the} publisher",
      year         = 1993,
      editor       = "The editor",
      volume       = 4,
      series       = 5,
      chapter      = 8,
      pages        = "201-213",
      address      = "The address of the publisher",
      edition      = 3,
      month        = 7,
      note         = "An optional note"
    }`
]

const serializationInput = {
  citeKey : 'in_collection',
  bibType : 'incollection',
  author : ['Peter Farindon', 'Jimmy Hendrix'],
  keywords : ['test1', 'test2'],
  title : 'The title of the work',
  booktitle : 'The title of the book',
  publisher : 'The name of the publisher',
  year : '1993',
  editor : 'The editor',
  volume : '4',
  series : '5',
  chapter : '8',
  pages : '201-213',
  address : 'The address of the publisher',
  edition : '3',
  month : '7',
  note : 'An optional note'
}

const serializationOutput = `@incollection{in_collection,
\tauthor = {Peter Farindon,Jimmy Hendrix},
\tkeywords = {test1,test2},
\ttitle = {The title of the work},
\tbooktitle = {The title of the book},
\tpublisher = {The name of the publisher},
\tyear = {1993},
\teditor = {The editor},
\tvolume = {4},
\tseries = {5},
\tchapter = {8},
\tpages = {201-213},
\taddress = {The address of the publisher},
\tedition = {3},
\tmonth = {7},
\tnote = {An optional note}
}`

describe('bibtext parser', function(){
  it('should work for all valid syntaxes', function(done){
    parseBibTexStr(validSyntaxes.join('\n\n'), function(err, results){
      expect(err).to.be.null;
      done();
    });
  });

  it('should throw errors for all types of invalid syntaxes', function(done){
    invalidSyntaxes.forEach((str, i) => {
      parseBibTexStr(str, function(err, results){
        expect(err).not.to.be.null;
      });
    });
    done();
  });
});

describe('bibtext serializer', function(){
  it('should throw an error if no bibType or citeKey specified in argument object', function(done){
    const bibObj = {};

    serializeBibTexObject(bibObj, function(err, result){
      expect(err).not.to.be.null;
      done();
    });
  });

  it('should render predictively a simple object', function(done){
    serializeBibTexObject(serializationInput, function(err, str){
      expect(str.replace(/\s/g, '')).to.equal(serializationOutput.replace(/\s/g, ''));
      done();
    });
  });

  it('should throw an error if input object is complex (contains object properties)', function(done){
    const bibObject = {
      citeKey : 'test',
      array : ['1','2'],
      bibType : 'test',
      'nested' : {
        'mykey' : 'myprop'
      }
    }
    serializeBibTexObject(bibObject, function(err, result){
      expect(err).not.to.be.null;
      done();
    });
  });

})
