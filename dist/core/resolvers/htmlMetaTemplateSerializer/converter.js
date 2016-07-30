'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
// templates have two variables : ${key} and ${value}
// if value is an array
// modificators are specifed after commas
// modificators : join(), personsToString

var serializeHtmlMeta = exports.serializeHtmlMeta = function serializeHtmlMeta(metadata, template) {
  var transformationAction = template.match(/\${value:([^}]*)/);
  var transformationArgument = void 0;
  var value = void 0;
  if (transformationAction) {
    transformationAction = transformationAction[1];
    if (transformationAction.indexOf('join(') === 0) {
      try {
        transformationArgument = transformationAction.match(/join\(([^\)]*)\)/)[1];
      } catch (exception) {
        transformationArgument = ', ';
      }
    }
  }

  if (transformationAction === 'join' && Array.isArray(metadata.value)) {
    value = metadata.value.join(transformationArgument);
  } else if (transformationAction === 'personsToString' && Array.isArray(metadata.value)) {
    var persons = metadata.value.map(function (person) {
      return person.firstName ? person.firstName + ' ' + person.lastName : person.lastName;
    });
    value = persons.join(', ');
  } else value = metadata.value;
  var output = template;
  while (output.indexOf('${value') > -1) {
    output = output.replace('${key}', metadata.key).replace(/\${value:?([^}]*)?}/, value);
  }
  return output;
};