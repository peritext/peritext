
export function getAssetUri(connector, path, parameters, callback) {
  connector.getAssetUri({path, parameters}, callback);
}
