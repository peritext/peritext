let connector;
let connectorName;
let tempConnectorName;

const updateConnector = (params)=> {
  tempConnectorName = params.connector;
  if (tempConnectorName !== connectorName) {
    connectorName = tempConnectorName;
    connector = require('./../../../connectors/' + params.connector);
  }
};

export const getAssetUri = (path, params, callback)=> {
  updateConnector(params);
  connector.getAssetUri({path, params}, callback);
};

export const getReader = (params) =>{
  updateConnector(params);
  return connector.readFromPath;
};
