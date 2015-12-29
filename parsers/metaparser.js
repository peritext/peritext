
var modelPath = __dirname + "/../models/metadata.csv";
var fs = require('fs');
var d3 = require('d3');
var parser = {};

var populateTemplate = function(key, value, template){
  template = template.replace('$value$', value);
  template = template.replace('$key$', key);
  return template;
}

//to do : check if no title or other verification on meta
parser.parse = function(str, callback){

  var props = {},
      metadata = {},
      splitted = str.split('\n');
  //first : inherit parent metadata

  //second : parse specified metadata props
  splitted.forEach(function(statement){
    var els = statement.split(':');
    if(els.length > 1){
      var domain, key, value;
      if(els.length == 2){
        domain = "general";
        key = els[0];
        value = els[1];
      }else{
        domain = els[0];
        key = els[1];
        value = els.slice(2, els.length).join(':');
      }

      props[domain+':'+key] = {value:value};

      if(domain == 'general'){
        metadata[key] = value;
      }
    }
  });

  //third : create html and propagate values
  fs.readFile(modelPath, 'utf8', function (err, data) {
    var model = d3.csv.parse(data);
    //console.log(model);

    model.forEach(function(mod){
      for(var key in props){
        if(mod.type + ':' + mod.key == key){
          if(mod.pattern.length > 0){
            props[key].html = populateTemplate(key, props[key].value, mod.pattern);
          }

          var propagation = mod.propagation.split(',');
          propagation.forEach(function(toKey){
            if(!props[toKey]){
              model.forEach(function(mod2){
                if(mod2.type + ':' + mod2.key == toKey){
                  props[toKey] = {
                    value : props[key].value
                  };
                  if(mod2.pattern.length > 0){
                    props[toKey].html = populateTemplate(toKey, props[toKey].value, mod2.pattern);
                  }
                }
              })
            }
          });
        }
      }
    });

    metadata.props = props;
    console.log('metadata built, result : ', metadata);
    callback(undefined, metadata);
  });
}

module.exports = parser;
