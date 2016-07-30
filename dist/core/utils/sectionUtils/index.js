'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * section metadata & resources utils : access, filter, deletion, ...
 */

// section metadata access util
var getMetaValue = exports.getMetaValue = function getMetaValue(metaList, domain, key) {
  var prop = metaList.find(function (meta) {
    return meta.domain === domain && meta.key === key;
  });
  if (prop) {
    return prop.value;
  }
  return undefined;
};

var setMetaValue = exports.setMetaValue = function setMetaValue(metaList, domain, key, newValue) {
  var newMetaList = metaList.map(function (meta) {
    if (meta.domain === domain && meta.key === key) {
      meta.value = newValue;
    }
    return meta;
  });
  return newMetaList;
};

var hasMeta = exports.hasMeta = function hasMeta(metaList, domain, key) {
  if (typeof domain === 'string') {
    return getMetaValue(metaList, domain, key) !== undefined;
  } else if (domain.domain) {
    return getMetaValue(metaList, domain.domain, domain.key) !== undefined;
  }
  throw new Error('error in couple ' + domain + '_' + key + ': hasMeta method needs either a domain+key pair or a metadata prop object');
};

var findByMetadata = exports.findByMetadata = function findByMetadata(sections, domain, key, value) {
  return sections.find(function (section) {
    var meta = getMetaValue(section.metadata, domain, key);
    return meta === value;
  });
};

var sameMetaScope = exports.sameMetaScope = function sameMetaScope(meta1, meta2) {
  return meta1.domain === meta2.domain && meta1.key === meta2.key;
};

var deleteMeta = exports.deleteMeta = function deleteMeta(metaList, domain, key) {
  return metaList.filter(function (meta) {
    return !(domain === meta.domain && key === meta.key);
  });
};

var metaStringToCouple = exports.metaStringToCouple = function metaStringToCouple(str) {
  var parts = str.split('_');
  var domain = parts.length > 1 ? parts.shift() : 'general';
  var key = parts.join('_');
  return { domain: domain, key: key };
};

var hasResource = exports.hasResource = function hasResource(resourcesList, resource) {
  return resourcesList.find(function (res) {
    return resource.citeKey === res.citeKey;
  }) !== undefined;
};

var filterResources = exports.filterResources = function filterResources(resourcesList, key, value) {
  return resourcesList.filter(function (res) {
    return res[key] === value;
  });
};