import {hasResource} from './../../utils/sectionUtils';

export function resolveContextualizations({section, models}, cb){
  const errors = [];

  //verify that all required resources exist
  section.contents = section.contents.map((content) =>{
    if(content.contextualizations.length){
      content.contextualizations = content.contextualizations.filter((contextualization) =>{
        let ok = true;
        contextualization.resources.some((res) =>{
          // console.log(section.resources);
          if(hasResource(section.resources, {citeKey : res})){
            return true;
          }else  {
            errors.push(new Error('resource ' + res + ' was asked in a contextualization but was not found'));
            return ok = false;
          }
        });

        return ok;
      });
    };
    return content;
  });

  //parse contextualizers against their models

  cb(null, {errors, section})
}
