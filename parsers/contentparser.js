var marked = require('marked');
var parser = {};
//var matchTitles = /(?<=(?!h1|h2|h3|h4|h5|h6)\>)(?!\<)(.+?)(?=\<\/.+?(?=h1|h2|h3|h4|h5|h6))/;


var makeToc = function(html){

}


parser.parse = function(str, callback){

  var html = marked(str);

  callback(undefined, {
      raw : str,
      html : html,
      references : [],
      figures : [],
      glossaryTerms : [],
      toc : []
    });
}


module.exports = parser;
