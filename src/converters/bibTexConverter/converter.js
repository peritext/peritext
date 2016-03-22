/*
 * homemade bibTeX syntax parser (performance could perhaps be improved I guess)
 * it needs a second pass to parse {} in values and analyze them against a model - that should be done elsewhere, as this converter just deals with syntax-to-object conversion
 */
class bibTexParser{

  constructor(){
    this.STATES = ["bibType", "citeKey", "properties"];
  }

  addValue(obj, key, value){
    if(obj[key]){

      if(Array.isArray(obj[key])){
        obj[key].push(value);
      }else obj[key] = [obj[key], value];

    }else obj[key] = value;

    return obj;
  }

  consume(){
    const matchBibType = /^@([^{]+)/;
    const matchCiteKey = /^{([^,]+),/;
    const wrappers = [
      ['{', '}'],
      ['"', '"'],
      ["'", "'"]
    ];
    let match;
    if(this.currentState === 'bibType'){
      match =  matchBibType.exec(this.consumable);
      if(match){
        this.currentObject.bibType = match[1];
        this.consumable = this.consumable.substr(match[1].length + 1);
        return this.currentState = this.STATES[1];
      }else return this.error = new Error('could not fine bibtype');
    }else if(this.currentState === "citeKey"){
      match =  matchCiteKey.exec(this.consumable);
      if(match){
        this.currentObject.citeKey = match[1];
        this.consumable = this.consumable.substr(match[1].length + 2);
        return this.currentState = this.STATES[2];
      }else return this.error = new Error('could not find correct citeKey');
    }else if(this.currentState === 'properties'){
      let wrapped = [wrappers[0]],
          index = 0,
          mode = 'key',
          temp = '',
          tempKey = '';

      while(wrapped.length > 0){
        if(index > this.consumable.length - 1){
          return this.error = new Error('finished to parse bibtex string without finding closing character '+ wrapped[wrapped.length - 1][1]);
        }else if(this.consumable.charAt(index) === wrapped[wrapped.length - 1][1]){
          wrapped.pop();
          temp += this.consumable.charAt(index);
          index = 1;
        //end of key specification, record tempkey and wait to have found value
        }else if (mode === 'key' && this.consumable.charAt(index) === '='){
          tempKey = temp.trim();
          temp = '';
          mode = 'value';
          index = 1;
        //end of value specification - add value and reboot temp
        }else if(mode === 'value' && wrapped.length < 2 && this.consumable.charAt(index) === ','){
          this.addValue(this.currentObject, tempKey, temp.trim());
          temp = '';
          mode = 'key';
          index = 1;
        //in the middle of some key or value = continue
        }else if (mode === 'value'){
          wrappers.some((wrapper) => {
            if(this.consumable.charAt(index) === wrapper[0]){
              return wrapped.push(wrapper);
            }
          });
          temp += this.consumable.charAt(index);
          index = 1;
        //default, by security
        }else{
          temp += this.consumable.charAt(index);
          index = 1;
        }
        this.consumable = this.consumable.substr(index);
      }

      //add if not empty
      if(Object.keys(this.currentObject).length){
        this.results.push(Object.assign({}, this.currentObject));
      }
      this.currentObject = {};
      this.consumable = this.consumable.substr(index).trim();
      return this.currentState = this.STATES[0];
    }
  }


  parse(str, callback){
    this.currentObject = {};
    this.currentState = this.STATES[0];
    this.results = [];
    this.consumable = str.trim();
    this.error = null;
    while(this.error === null && this.consumable.trim().length > 0){
      this.consume();
    }
    return callback(this.error, this.results);
  }

}

const parser = new bibTexParser();

const validateBibObject = function(bibObject){
  if(bibObject.citeKey === undefined){
    return new Error('bibObject must have a citeKey property');
  } else if (bibObject.bibType === undefined){
    return new Error('bibObject must have a bibType property');
  } else{
    for (let key in bibObject){
      if(typeof bibObject[key] === 'object' && !Array.isArray(bibObject[key])){
        return new Error('bibObject cannot contain nested objects');
      }
    }
  }
  return true;
}

export function serializeBibTexObject(bibObject, callback){
  var validated = validateBibObject(bibObject);
  if(validated !== true){
    return callback(validated, undefined);
  }
  let str = '', val;
  for(let key in bibObject){
    val = bibObject[key];
    if(Array.isArray(val)){
      val = val.join(',');
    }
    if(key !== 'citeKey' && key !== 'bibType'){
      str += '\t' + key + ' = {' + val + '},\n';
    }
  }
  if(str.length > 1){
    str = str.substr(0, str.length - 2);
  }
  return callback(null, `@${bibObject.bibType}{${bibObject.citeKey},
    ${str}
}`)
}

export function parseBibTexStr(str, callback){
  if(typeof str === 'string'){
    return parser.parse(str, callback);
  }else{
    return callback(new Error('must input a string'), undefined);
  }
}
