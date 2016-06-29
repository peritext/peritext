/**
 * This module parses and serializes bibTex objects
 */

/**
 * homemade bibTeX syntax parser (performance could perhaps be improved I guess)
 * it needs a second pass to parse {} in values and analyze them against a model - that should be done elsewhere, as this converter just deals with syntax-to-object conversion
 */
class bibTexParser {

  constructor() {
    this.STATES = ['bibType', 'citeKey', 'properties'];
  }

  addValue(obj, key, value) {
    if (obj[key]) {

      if (Array.isArray(obj[key])) {
        obj[key].push(value);
      }else obj[key] = [obj[key], value];

    }else obj[key] = value;

    return obj;
  }

  consume() {
    const matchBibType = /^@([^{]+)/;
    const matchCiteKey = /^{([^,]+),/;
    const wrappers = [
      ['{', '}'],
      ['"', '"'],
      ["'", "'"]
    ];
    let match;
    if (this.currentState === 'bibType') {
      match = matchBibType.exec(this.consumable);
      if (match) {
        this.currentObject.bibType = match[1];
        this.consumable = this.consumable.substr(match[1].length + 1);
        this.currentState = this.STATES[1];
        return true;
      }
      this.error = {
        type: 'error',
        preciseType: 'bibParsingError',
        message: 'could not find bibType',
        initialString: this.initialStr
      };
      return true;

    }else if (this.currentState === 'citeKey') {
      match = matchCiteKey.exec(this.consumable);
      if (match) {
        this.currentObject.citeKey = match[1];
        this.consumable = this.consumable.substr(match[1].length + 2);
        this.currentState = this.STATES[2];
        return true;
      }
      this.error = {
        type: 'error',
        preciseType: 'bibParsingError',
        message: 'could not find citekey',
        initialString: this.initialStr
      };
      return true;

    /**
     * ``key = value`` structure
     * value is always wrapped inside character couples that vary depending on bibtex implementation (" { ')
     * possibility of nested wrapping (eg {Name {{S}urname}})
     */
    }else if (this.currentState === 'properties') {
      const wrapped = [wrappers[0]];
      let index = 0;
      let mode = 'key';
      let temp = '';
      let tempKey = '';
      let trespassing;
      let character;
      let entering;

      while (wrapped.length > 0) {

        trespassing = index > this.consumable.length - 1;
        character = this.consumable.charAt(index);

        if (trespassing) {
          this.error = {
            type: 'error',
            preciseType: 'bibParsingError',
            message: 'finished to parse bibtex string without finding closing character ' + wrapped[wrapped.length - 1][1],
            initialString: this.initialStr
          };
          return true;
        // end of wrapped expression - if matches with last recorded wrapper's closing character
        }else if (character === wrapped[wrapped.length - 1][1]) {
          wrapped.pop();
          if (wrapped.length > 1) {
            temp += character;
          }
          index = 1;
        // end of key specification, record tempkey and wait to have found value
        }else if (mode === 'key' && character === '=') {
          tempKey = temp.trim();
          temp = '';
          mode = 'value';
          index = 1;
        // end of value specification - add value and reboot temp
        }else if (mode === 'value' && wrapped.length < 2 && character === ',') {
          this.addValue(this.currentObject, tempKey, temp.trim());
          temp = '';
          mode = 'key';
          index = 1;
        // in the middle of some key or value = continue
        }else if (mode === 'value') {
          entering = false;
          // catch wrapper char
          wrappers.some((wrapper) => {
            if (this.consumable.charAt(index) === wrapper[0]) {
              entering = true;
              return wrapped.push(wrapper);
            }
          });
          if (!(entering && wrapped.length <= 2)) {
            temp += character;
          }
          index = 1;
        // default, by security
        }else {
          temp += character;
          index = 1;
        }
        this.consumable = this.consumable.substr(index);
      }
      this.addValue(this.currentObject, tempKey.trim(), temp.trim());

      // add if not empty
      if (Object.keys(this.currentObject).length) {
        this.results.push(Object.assign({}, this.currentObject));
      }
      this.currentObject = {};
      this.consumable = this.consumable.substr(index).trim();
      this.currentState = this.STATES[0];
      return true;
    }
  }


  parse(str, callback) {
    this.currentObject = {};
    this.currentState = this.STATES[0];
    this.results = [];
    this.consumable = str.trim();
    this.initialStr = str.trim();
    this.error = null;
    while (this.error === null && this.consumable.trim().length > 0) {
      this.consume();
    }
    return callback(this.error, this.results);
  }

}

const parser = new bibTexParser();

const validateBibObject = function(bibObject) {
  if (bibObject.citeKey === undefined) {
    return {
      type: 'error',
      preciseType: 'bibObjectValidationError',
      message: 'bibObject must have a citeKey property',
      bibObject: bibObject
    };
  } else if (bibObject.bibType === undefined) {
    return {
      type: 'error',
      preciseType: 'bibObjectValidationError',
      message: 'bibObject must have a bibType property',
      bibObject: bibObject
    };
  }

  for (const key in bibObject) {
    if (typeof bibObject[key] === 'object' && !Array.isArray(bibObject[key])) {
      return {
        type: 'error',
        preciseType: 'bibObjectValidationError',
        message: 'bibObject cannot contain nested objects',
        bibObject: bibObject
      };
    }
  }

  return true;
};

export function serializeBibTexObject(bibObject, callback) {
  const validated = validateBibObject(bibObject);
  if (validated.type === 'error') {
    return callback(validated, undefined);
  }
  let str = '';
  let val;
  for (const key in bibObject) {
    if (bibObject[key]) {
      val = bibObject[key];
      if (Array.isArray(val)) {
        val.forEach((value)=>{
          str += '\t' + key + ' = {' + value + '},\n';
        });
        //  val = val.join(',');
      }else if (key !== 'citeKey' && key !== 'bibType') {
        str += '\t' + key + ' = {' + val + '},\n';
      }
    }
  }
  // removing the last coma
  if (str.length > 1) {
    str = str.substr(0, str.length - 2);
  }
  return callback(null, `@${bibObject.bibType}{${bibObject.citeKey},
    ${str}
}`);
}

export function parseBibTexStr(str, callback) {
  if (typeof str === 'string') {
    return parser.parse(str, callback);
  }
  return callback(new Error('must input a string'), undefined);
}

/**
Accepted inputs for authors and persons (to add in doc/spec):
{Martin}, Julia; Coleman
{Jakubowicz}, Andrew
{Charalambos}, D. Aliprantis and Kim C. {Border}
{Martin}, Julia; Coleman
{Jakubowicz}, Andrew
{Charalambos}, D. Aliprantis and Kim C. {Border}
Maskin, Eric S.
{Martin}, Julia; Coleman
{Jakubowicz}, Andrew
{Charalambos}, D. Aliprantis and Kim C. {Border}
Maskin, Eric S.
{Martin}, Julia; Coleman
{Jakubowicz}, Andrew
{Charalambos}, D. Aliprantis and Kim C. {Border}
*/
export function parseBibAuthors(str) {
  const authors = str.split(/;|and|et/);
  const additionalInfo = /\(([^)]*)?\)?\(?([^)]*)?\)?/;
  let match;
  return authors.filter((inputStr) =>{
    return inputStr.trim().length > 0;
  }).map((inputAuthorStr) =>{
    let workingStr = inputAuthorStr;
    let authorStr = '';
    let firstName;
    let lastName;
    let role = 'author';
    let information;
    match = inputAuthorStr.match(additionalInfo);
    if (match) {
      workingStr = workingStr.replace(match[0], '');
      if (match[1]) {
        role = match[1].trim();
      }
      if (match[2]) {
        information = match[2];
        information = information.trim();
      }
    }
    const lastNameMatch = workingStr.match(/{([^}]*)}/);
    if (lastNameMatch) {
      lastName = lastNameMatch[1].trim();
      authorStr = [workingStr.substr(0, lastNameMatch.index), workingStr.substr(lastNameMatch.index + lastNameMatch[0].length)].join('');
      firstName = authorStr.replace(',', '').trim();
    } else {
      let vals = workingStr.split(',');
      if (vals.length > 1) {
        firstName = vals[1].trim();
        lastName = vals[0].trim();
      } else if (workingStr.trim().indexOf(' ') > -1) {
        vals = workingStr.trim().split(' ');
        firstName = vals.shift().trim();
        lastName = vals.join(' ').trim();
      } else {
        lastName = workingStr.trim();
        firstName = '';
      }
    }
    const citeKey = (role + '-' + firstName + lastName).toLowerCase().replace(' ', '-');
    return {firstName, lastName, role, information, citeKey};
  });
}

// nested json-like bib objects
export function parseBibContextualization(inputStr) {
  const bracketsRE = /([^=^,]+)=(?:{)([^}]+)(?:}),?/g;
  const quoteRE = /([^=^,]+)="([^"]+)",?/g;
  const paramsObject = {};


  const str = inputStr.substr(1, inputStr.length - 2).replace(/&quot;/g, '"');
  let match;
  let key;
  let expression;
  let subObject;
  let newObj;


  while ((match = bracketsRE.exec(str)) !== null) {
    key = match[1].trim();
    expression = match[2].trim().split(',');
    // simple
    if (expression.length === 1) {
      paramsObject[key] = expression[0];
    // nested
    } else {
      subObject = {};

      let isArray;

      expression = expression.map((exp) =>{
        const split = exp.split('=');
        if (split.length === 2) {
          isArray = false;
          return {
            key: split[0],
            value: split[1]
          };
        }
        isArray = true;
        return exp;
      });

      if (!isArray) {
        subObject = expression.reduce((obj, exp)=>{
          obj[exp.key] = exp.value;
          return obj;
        }, subObject);
      }

      newObj = Object.assign({}, subObject);

      if (paramsObject[key] === undefined) {
        paramsObject[key] = newObj;
      } else if (Array.isArray(paramsObject[key])) {
        paramsObject[key].push(newObj);
      } else paramsObject[key] = [paramsObject[key], newObj];
    }

  }

  while ((match = quoteRE.exec(str)) !== null) {
    key = match[1].trim();
    expression = match[2].trim();
    paramsObject[key] = expression;
  }


  return paramsObject;
}


function resolveNested(subVal) {
  if (typeof subVal !== 'string') {
    return subVal;
  }
  let expression = subVal.split(',');
  let subObject;
  let newObj;
  // simple
  if (expression.length === 1) {
    return subVal;
  // nested
  }
  subObject = {};
  let isArray;
  expression = expression.map((exp) =>{
    const split = exp.split('=');
    if (split.length === 2) {
      isArray = false;
      return {
        key: split[0],
        value: split[1]
      };
    }
    isArray = true;
    return exp;
  });

  if (!isArray) {
    subObject = expression.reduce((obj, exp)=>{
      obj[exp.key] = exp.value;
      return obj;
    }, subObject);
  }

  newObj = Object.assign({}, subObject);
  return newObj;
}

export function parseBibNestedValues(bibObject) {
  const newObject = Object.assign({}, bibObject);
  let subVal;
  for (const index in newObject) {
    if (newObject[index]) {
      subVal = newObject[index];
      if (Array.isArray(subVal)) {
        newObject[index] = bibObject[index].map(resolveNested);
      }else {
        newObject[index] = resolveNested(newObject[index]);
      }
    }
  }
  return newObject;
}
