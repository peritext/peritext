// templates have two variables : ${key} and ${value}
// if value is an array
// modificators are specifed after commas
// modificators : join(), personsToString

export function serializeHtmlMeta(metadata, template) {
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
  const output = template.replace('${key}', metadata.key).replace(/\${value:?([^}]*)?}/, value);
  return output;
}
