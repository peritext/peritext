

var parser = {};

//to do : check if no title or other verification on meta
parser.parse = function(str, callback){

  var props = [],
      splitted = str.split('\n');

  /*if(splitted.length == 0){
    return callback({
       status : 404,
      message : 'meta file is empty for the requested document'
    }, undefined);
  }*/

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

      props.push({
        domain : domain,
        key : key,
        value : value
      });
    }
  });

  var metadata = {};
  console.log('metadata props parsed : ', props);
  for(var i = props.length - 1; i >= 0 ; i-- ){
    if(props[i].domain === 'general'){
      console.log('converting to general metadata : ', props[i].key, ' : ', props[i].value);
      metadata[props[i].key] = props[i].value;
      props.splice(i);
    }
  }

  metadata.props = props;
  console.log('metadata built, result : ', metadata);
  callback(undefined, metadata);
}

module.exports = parser;
