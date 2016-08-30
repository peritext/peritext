'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * This module parses and serializes bibTex objects
 * @module converters/bibTexConverter
 */

/**
 * homemade bibTeX syntax parser (performance could be improved I guess)
 * it needs a second pass to parse {} in values and analyze them against a model - that should be done elsewhere, as this converter just deals with syntax-to-object conversion
 */

var bibTexParser = function () {
  /**
   * constructor
   */

  function bibTexParser() {
    _classCallCheck(this, bibTexParser);

    this.STATES = ['bibType', 'citeKey', 'properties'];
  }

  /**
   * Adds a key+value prop to the resource's javascript representation object
   * @param {object} obj - the resource representation
   * @param {string} key - the key to populate
   * @param {string} value - the value to set
   * @return {object} newObj - the updated resource representation
   */


  _createClass(bibTexParser, [{
    key: 'addValue',
    value: function addValue(obj, key, value) {
      if (obj[key]) {

        if (Array.isArray(obj[key])) {
          obj[key].push(value);
        } else obj[key] = [obj[key], value];
      } else obj[key] = value;

      return obj;
    }

    /**
     * Consumes a string (stored in this.consumable) representation of a bibTeX expression
     * @return {boolean} exit - a simple exit trigger (but internal props will have been mutated)
     */

  }, {
    key: 'consume',
    value: function consume() {
      var _this = this;

      var matchBibType = /^@([^{]+)/;
      var matchCiteKey = /^{([^,]+),/;
      var wrappers = [['{', '}'], ['"', '"'], ["'", "'"]];
      var match = void 0;
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
      } else if (this.currentState === 'citeKey') {
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

        /*
         * ``key = value`` structure
         * value is always wrapped inside character couples that vary depending on bibtex implementation (" { ')
         * possibility of nested wrapping (eg {Name {{S}urname}})
         */
      } else if (this.currentState === 'properties') {
          var _ret = function () {
            var wrapped = [wrappers[0]];
            var index = 0;
            var mode = 'key';
            var temp = '';
            var tempKey = '';
            var trespassing = void 0;
            var character = void 0;
            var entering = void 0;

            while (wrapped.length > 0) {

              trespassing = index > _this.consumable.length - 1;
              character = _this.consumable.charAt(index);

              if (trespassing) {
                _this.error = {
                  type: 'error',
                  preciseType: 'bibParsingError',
                  message: 'finished to parse bibtex string without finding closing character ' + wrapped[wrapped.length - 1][1],
                  initialString: _this.initialStr
                };
                return {
                  v: true
                };
                // end of wrapped expression - if matches with last recorded wrapper's closing character
              } else if (character === wrapped[wrapped.length - 1][1]) {
                  wrapped.pop();
                  if (wrapped.length > 1) {
                    temp += character;
                  }
                  index = 1;
                  // end of key specification, record tempkey and wait to have found value
                } else if (mode === 'key' && character === '=') {
                    tempKey = temp.trim();
                    temp = '';
                    mode = 'value';
                    index = 1;
                    // end of value specification - add value and reboot temp
                  } else if (mode === 'value' && wrapped.length < 2 && character === ',') {
                      _this.addValue(_this.currentObject, tempKey, temp.trim());
                      temp = '';
                      mode = 'key';
                      index = 1;
                      // in the middle of some key or value = continue
                    } else if (mode === 'value') {
                        entering = false;
                        // catch wrapper char
                        wrappers.some(function (wrapper) {
                          if (_this.consumable.charAt(index) === wrapper[0]) {
                            entering = true;
                            return wrapped.push(wrapper);
                          }
                        });
                        if (!(entering && wrapped.length <= 2)) {
                          temp += character;
                        }
                        index = 1;
                        // default, by security
                      } else {
                          temp += character;
                          index = 1;
                        }
              _this.consumable = _this.consumable.substr(index);
            }
            _this.addValue(_this.currentObject, tempKey.trim(), temp.trim());

            // add if not empty
            if (Object.keys(_this.currentObject).length) {
              _this.results.push(Object.assign({}, _this.currentObject));
            }
            _this.currentObject = {};
            _this.consumable = _this.consumable.substr(index).trim();
            _this.currentState = _this.STATES[0];
            return {
              v: true
            };
          }();

          if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
        }
    }

    /**
     * Parses a bibTeX string and callbacks a javascript objet
     * @param {string} str - the string to parse
     * @param {function(error:error, results:Object)} callback
     */

  }, {
    key: 'parse',
    value: function parse(str, callback) {
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
  }]);

  return bibTexParser;
}();

var parser = new bibTexParser();

var validateBibObject = function validateBibObject(bibObject) {
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

  for (var key in bibObject) {
    if (_typeof(bibObject[key]) === 'object' && !Array.isArray(bibObject[key])) {
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

/**
 * Serializes a javascript object representing a resource or a contextualizer, to a bibTeX-formatted string
 * @param {object} bibObject - the resource/contextualizer representation
 * @return {function(error:error, bibStr: string)} callback - error and the bibTeX mention as a string
 */
var serializeBibTexObject = exports.serializeBibTexObject = function serializeBibTexObject(bibObject, callback) {
  var validated = validateBibObject(bibObject);
  if (validated.type === 'error') {
    return callback(validated, undefined);
  }
  var str = '';
  var val = void 0;

  var _loop = function _loop(key) {
    if (bibObject[key]) {
      val = bibObject[key];
      if (Array.isArray(val)) {
        val.forEach(function (value) {
          str += '\t' + key + ' = {' + value + '},\n';
        });
        //  val = val.join(',');
      } else if (key !== 'citeKey' && key !== 'bibType') {
          str += '\t' + key + ' = {' + val + '},\n';
        }
    }
  };

  for (var key in bibObject) {
    _loop(key);
  }
  // removing the last coma
  if (str.length > 1) {
    str = str.substr(0, str.length - 2);
  }
  return callback(null, '@' + bibObject.bibType + '{' + bibObject.citeKey + ',\n    ' + str + '\n}');
};

/**
 * Parses a bibTeX string and returns an object
 * @param {string} str - the bibTeX string to parse
 * @return {function(error: error, result: Object)} callback - error and the resulting object
 */
var parseBibTexStr = exports.parseBibTexStr = function parseBibTexStr(str, callback) {
  if (typeof str === 'string') {
    return parser.parse(str, callback);
  }
  return callback(new Error('must input a string'), undefined);
};

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

/**
 * Parses a list of authors as they are formatted in bbiTeX statements
 * @param {string} str - the bibTeX string to parse
 * @return {array} authors - the javascript representation of authors as an array
 */
var parseBibAuthors = exports.parseBibAuthors = function parseBibAuthors(str) {
  var authors = str.split(/;|and|et/);
  var additionalInfo = /\(([^)]*)?\)?\(?([^)]*)?\)?/;
  var match = void 0;
  return authors.filter(function (inputStr) {
    return inputStr.trim().length > 0;
  }).map(function (inputAuthorStr) {
    var workingStr = inputAuthorStr;
    var authorStr = '';
    var firstName = void 0;
    var lastName = void 0;
    var role = 'author';
    var information = void 0;
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
    var lastNameMatch = workingStr.match(/{([^}]*)}/);
    if (lastNameMatch) {
      lastName = lastNameMatch[1].trim();
      authorStr = [workingStr.substr(0, lastNameMatch.index), workingStr.substr(lastNameMatch.index + lastNameMatch[0].length)].join('');
      firstName = authorStr.replace(',', '').trim();
    } else {
      var vals = workingStr.split(',');
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
    var citeKey = (role + '-' + firstName + lastName).toLowerCase().replace(' ', '-');
    return { firstName: firstName, lastName: lastName, role: role, information: information, citeKey: citeKey };
  });
};

/**
 * Parses a bibTeX-like contextualization statement given as string and returns an object
 * @param {string} inputStr - the bibTeX string to parse
 * @return {Object} contextualization - the contextualization object
 */
var parseBibContextualization = exports.parseBibContextualization = function parseBibContextualization(inputStr) {
  var bracketsRE = /([^=^,]+)=(?:{)([^}]*)(?:}),?/g;
  var quoteRE = /([^=^,]+)="([^"]*)",?/g;
  var paramsObject = {};

  var str = inputStr.substr(1, inputStr.length - 2).replace(/&quot;/g, '"');
  var match = void 0;
  var key = void 0;
  var expression = void 0;
  var subObject = void 0;
  var newObj = void 0;

  while ((match = bracketsRE.exec(str)) !== null) {
    key = match[1].trim();
    expression = match[2].trim().split(',');
    // simple
    if (expression.length === 1) {
      paramsObject[key] = expression[0];
      // nested
    } else {
        subObject = {};

        var isArray = void 0;

        expression = expression.map(function (exp) {
          var split = exp.split('=');
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
          subObject = expression.reduce(function (obj, exp) {
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
};

var resolveNested = function resolveNested(subVal) {
  if (typeof subVal !== 'string') {
    return subVal;
  }
  var expression = subVal.split(',');
  var subObject = void 0;
  var newObj = void 0;
  // simple
  if (expression.length === 1) {
    return subVal;
    // nested
  }
  subObject = {};
  var isArray = void 0;
  expression = expression.map(function (exp) {
    var split = exp.split('=');
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
    subObject = expression.reduce(function (obj, exp) {
      obj[exp.key] = exp.value;
      return obj;
    }, subObject);
  }

  newObj = Object.assign({}, subObject);
  return newObj;
};

/**
 * Parses bibTeX nested values inside a bibObject
 * @param {Object} bibObject - the object to parse
 * @return {Object} newObject - the resulting updated object
 */
var parseBibNestedValues = exports.parseBibNestedValues = function parseBibNestedValues(bibObject) {
  var newObject = Object.assign({}, bibObject);
  var subVal = void 0;
  for (var index in newObject) {
    if (newObject[index]) {
      subVal = newObject[index];
      if (Array.isArray(subVal)) {
        newObject[index] = bibObject[index].map(resolveNested);
      } else {
        newObject[index] = resolveNested(newObject[index]);
      }
    }
  }
  return newObject;
};