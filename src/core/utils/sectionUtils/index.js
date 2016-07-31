/**
 * Utils - section metadata & resources utils : access, filter, deletion, ...
 * @module utils/sectionUtils
 */

/**
 * Gets a value in metadata props array by its domain and key
 * @param {array} metaList - the list of metadata objects in which looking for the value
 * @param {string} domain - the domain of the prop, stored in its "domain" prop
 * @param {string} key - the key of the prop, stored in its "key" prop
 * @return {string} value - the value
 */
export const getMetaValue = (metaList, domain, key) =>{
  const prop = metaList.find((meta) =>{
    return meta.domain === domain && meta.key === key;
  });
  if (prop) {
    return prop.value;
  }
  return undefined;
};

/**
 * Sets a value in metadata props array after localized it by its domain and key
 * @param {array} metaList - the list of metadata objects in which looking for the value
 * @param {string} domain - the domain of the prop, stored in its "domain" prop
 * @param {string} key - the key of the prop, stored in its "key" prop
 * @param {string} newValue - the new value to assign to the prop
 * @return {array} newlist - the updated list
 */
export const setMetaValue = (metaList, domain, key, newValue) =>{
  const newMetaList = metaList.map((meta) =>{
    if (meta.domain === domain && meta.key === key) {
      meta.value = newValue;
    }
    return meta;
  });
  return newMetaList;
};

/**
 * Checks if the value has a metadata property
 * @param {array} metaList - the list of metadata objects in which looking for the value
 * @param {string} domain - the domain of the prop, stored in its "domain" prop
 * @param {string} key - the key of the prop, stored in its "key" prop
 * @return {boolean} hasMeta - whether the prop is there
 */
export const hasMeta = (metaList, domain, key) =>{
  if (typeof domain === 'string') {
    return getMetaValue(metaList, domain, key) !== undefined;
  }else if (domain.domain) {
    return getMetaValue(metaList, domain.domain, domain.key) !== undefined;
  }
  throw new Error('error in couple ' + domain + '_' + key + ': hasMeta method needs either a domain+key pair or a metadata prop object');
};

/**
 * Finds a specific section in a sections list through one of its metadata
 * @param {array} sections - the sections array to search in
 * @param {string} domain - the domain of the prop used to search the section, stored in its "domain" prop
 * @param {string} key - the key of the prop used to search the section, stored in its "key" prop
 * @return {Object} section - the resulting section
 */
export const findByMetadata = (sections, domain, key, value) =>{
  return sections.find((section) =>{
    const meta = getMetaValue(section.metadata, domain, key);
    return meta === value;
  });
};

/**
 * Checks if two metadata props have the same scope (domain and key)
 * @param {Object} meta1 - the first metadata prop
 * @param {Object} meta1 - the second metadata prop
 * @return {boolean} sameScope - whether the two props have the same scope
 */
export const sameMetaScope = (meta1, meta2) =>{
  return meta1.domain === meta2.domain && meta1.key === meta2.key;
};

/**
 * Delete a specific metadata prop
 * @param {array} metaList - the list of metadata objects in which looking for the value
 * @param {string} domain - the domain of the prop, stored in its "domain" prop
 * @param {string} key - the key of the prop, stored in its "key" prop
 * @return {array} updatedMetaList - the new metadata list, without the deleted prop
 */
export const deleteMeta = (metaList, domain, key) =>{
  return metaList.filter((meta)=>{
    return !(domain === meta.domain && key === meta.key);
  });
};

/**
 * Converts a bibtex metadata expression (e.g. "title", "twitter_twitter") to an object prop
 * @param {string} str - the bibtex metadata expression
 * @return {Object} metadata - the metadata prop object, without value
 */
export const metaStringToCouple = (str) =>{
  const parts = str.split('_');
  const domain = (parts.length > 1) ? parts.shift() : 'general';
  const key = parts.join('_');
  return {domain, key};
};

/**
 * Checks if a resource list contains a resource, by citeKey
 * @param {array} resourcesList - the resources list in which looking for
 * @param {Object} resource - the resource to look for
 * @return {boolean} hasResource - whether resource is present in the list
 */
export const hasResource = (resourcesList, resource) =>{
  return resourcesList.find((res) =>{
    return resource.citeKey === res.citeKey;
  }) !== undefined;
};

/**
 * Filter resources that have a specific value
 * @param {array} resourcesList - the list of resource sto filter
 * @param {string} key - the key by which filtering the resources
 * @param {string} value - the value by which filtering the resources
 * @return {array} updatedResourceList - the filtered resources list
 */
export const filterResources = (resourcesList, key, value) =>{
  return resourcesList.filter((res) =>{
    return res[key] === value;
  });
};

