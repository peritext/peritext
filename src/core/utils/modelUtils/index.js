

export function getResourceModel(bibType, resourceModels){
  let model  = resourceModels.individual[bibType];
  if(model){
    //first set highestly specific props
    let properties = model.properties, otherProps, existing;
    //then parse related categories
    model.categories.forEach((category) => {
      otherProps = resourceModels.collective[category]
                    .properties
                    .filter((prop) =>{
                      existing = properties.find((p) =>{
                        return p.key === prop.key
                      });
                      if(existing){
                        return false;
                      }else return true;
                    });
      properties = properties.concat(otherProps);
    });

    //then finally parsed common props
    otherProps = resourceModels.collective.common
                    .properties
                    .filter((prop) =>{
                      existing = properties.find((p) =>{
                        return p.key === prop.key
                      });
                      if(existing){
                        return false;
                      }else return true;
                    });
    properties = properties.concat(otherProps);

    return Object.assign({}, model, {properties});
  }else return undefined;
}
