let connector;
let connectorName;
let tempConnectorName;

function updateConnector(params) {
  tempConnectorName = params.connector;
  if (tempConnectorName !== connectorName) {
    connectorName = tempConnectorName;
    connector = require('./../../connectors/' + params.connector);
  }
}

export function getAssetUri(path, params, callback) {
  updateConnector(params);
  connector.getAssetUri({path, params}, callback);
}
