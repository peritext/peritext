/**
 * Resolver dedicated to resolve metadata templates against their data
 * @module resolvers/htmlMetaTemplateSerializer
 */

// templates have two variables : ${key} and ${value}
// if value is an array
// modificators are specifed after commas
// modificators : join(), personsToString

/**
 * Consumes a metadata object against an html metadata node template
 * @param {Object} metadata - the metadata object
 * @param {string} template - the template to consumes
 * @return {string} htmlMeta - the representation of the html metadata as string
 */
export const serializeHtmlMeta = (metadata, key, template) => {
  let transformationAction = template.match(/\${value:([^}]*)/);
  let transformationArgument;
  let value;
  if (transformationAction) {
    transformationAction = transformationAction[1];
    if (transformationAction.indexOf('join(') === 0) {
      try {
        transformationArgument = transformationAction.match(/join\(([^\)]*)\)/)[1];
      }catch (exception) {
        transformationArgument = ', ';
      }
    }
  }

  if (transformationAction === 'join' && Array.isArray(metadata.value)) {
    value = metadata.value.join(transformationArgument);
  }else if (transformationAction === 'personsToString' && Array.isArray(metadata.value)) {
    const persons = metadata.value.map((person)=>{
      return (person.firstName) ? person.firstName + ' ' + person.lastName : person.lastName;
    });
    value = persons.join(', ');
  }else value = metadata.value;
  let output = template;
  while (output.indexOf('${value') > -1) {
    output = output.replace('${key}', key).replace(/\${value:?([^}]*)?}/, value);
  }
  return output;
};
