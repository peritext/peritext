/**
 * Assets controller - a set of pure functions for interacting with an assets source (through a connector)
 * @module controllers/assetsController
 */

let connector;
let connectorName;
let tempConnectorName;

/**
* Updates the active connector module according to connection params
* @param {Object} params - connection params
*/
const updateConnector = (params)=> {
  tempConnectorName = params.connector;
  if (tempConnectorName !== connectorName) {
    connectorName = tempConnectorName;
    connector = require('./../../connectors/' + params.connector);
  }
};

/**
 * Provides the URI of a specific assets file from connector
 * @param {array|string} path - the path of the assets file to look for
 * @param {Object} params - connection params
 * @return {function(connectorError: error, uri: string)} callback - possible errors and the uri
*/
export const getAssetUri = (path, params, callback)=> {
  updateConnector(params);
  connector.getAssetUri({path, params}, callback);
};

/**
* Returns an appropriate connector function for directly reading a file from assets source
* @param {Object} params - connection params
* @return {function(err: error, res: Object)} readFunction - the connector function for directly reading a file contents from assets source
*/
export const getReader = (params) =>{
  updateConnector(params);
  return connector.readFromPath;
};
