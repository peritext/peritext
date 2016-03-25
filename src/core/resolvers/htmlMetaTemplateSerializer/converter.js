
// templates have two variables : ${key} and ${value}
// if value is an array
// modificators are specifed after commas
// modificators : join(), personsToString

export function serializeHtmlMeta(metadata, template){
  let transformationAction = template.match(/\${value:([^}]*)/),
      transformationArgument,
      value;
  if(transformationAction){
    transformationAction = transformationAction[1];
    if(transformationAction.indexOf('join(') === 0){
      try{
        transformationArgument = transformationAction.match(/join\(([^\)]*)\)/)[1];
      }catch(e){
        transformationArgument = ', ';
      }
    }
  }

  if(transformationAction === 'join' && Array.isArray(metadata.value)){
    value = metadata.value.join(tranformationArgument);
  }else if(transformationAction === 'personsToString' && Array.isArray(metadata.value)){
    let persons = metadata.value.map((person)=>{
      return (person.firstName)?person.firstName + ' ' + person.lastName:person.lastName;
    });
    value = persons.join(', ');
  }else value = metadata.value;
  let output = template.replace('${key}', metadata.key).replace(/\${value:?([^}]*)?}/, value);
  return output;
}
