
export default function mapData(layer, resources, data, parseTime) {

  const fields = Object.keys(layer)
                  .filter(key =>
                    typeof layer[key] === 'object' && layer[key].type === 'path'
                  )
                  .map(key => Object.assign(
                      layer[key],
                      {field: key}
                    )
                  );

  const baseDatasetMatch = fields[0].path[0].match(/@res([0-9]+)/);
  const baseDatasetResource = baseDatasetMatch && baseDatasetMatch[1] && resources[+baseDatasetMatch[1] - 1];
  const baseDataset = data[baseDatasetResource.id] && data[baseDatasetResource.id].data;
  // mapping now
  const output = fields.reduce((results, field) => {
    const transformDate = field.field.indexOf('date') > -1;
    const fieldName = field.field.slice(0, field.field.length - 1);
    return results.map(point => {
      let value;
      if (transformDate) {
        value = parseTime(point[field.path[2]]);
        // tolerating small error by spliting with spaces and searching for the correct date
        if (value === null) {
          const values = point[field.path[2]].split(' ');
          let index = 0;
          while (index < values.length && !value) {
            value = parseTime(values[index]);
            index++;
          }
        }
      } else {
        value = point[field.path[2]];
      }
      return Object.assign(point, {
        [fieldName]: value
      });
    });
  }, baseDataset);
  return Object.assign(layer, {items: output});
}
