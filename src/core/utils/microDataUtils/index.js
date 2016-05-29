import {getMetaValue} from './../sectionUtils/'

/*
 * Collection of utils for formatting scholarly citations in html/schema/microformat/RDFa
 * Schema reference could be even more covered
 */


 // I transform 1, 2, 3 incrementation into a, b, c
export function toLetters(num) {
  const mod = num % 26;
  let pow = num / 26 | 0;
  const out = mod ? String.fromCharCode(64 + mod) : (--pow, 'Z');
  return pow ? toLetters(pow) + out : out;
}


// I give the schema type of an object based on its bibType
export function bibToSchema(bib) {
  switch (bib) {
  case 'book':
    return 'Book';
  case 'article':
    return 'ScholarlyArticle';
  case 'booklet':
    return 'CreativeWork';
  case 'conference':
    return 'Chapter';
  case 'incollection':
    return 'Chapter';
  case 'inbook':
    return 'Chapter';
  case 'mastersthesis':
    return 'Thesis';
  case 'phdthesis':
    return 'Thesis';
  case 'proceedings':
    return 'Book';
  case 'image':
    return 'ImageObject';
  case 'online':
    return 'WebSite';
  case 'vectorsImage':
    return 'ImageObject';
  case 'tabularData':
    return 'Dataset';
  case 'video':
    return 'VideoObject';
  case 'audio':
    return 'AudioObject';
  default:
    return 'CreativeWork';
  }
}

// formats a resource prop into a html-schema node
export function formatSimpleProp(object, objectKey, propName, tagType = 'span', subTag = '') {
  if (object[objectKey]) {
    return '<'
    + tagType
    + ' class="modulo-contents-citation-' + objectKey
    + '" itemprop="'
    + propName
    + '" property="'
    + propName
    + '">'
    + (subTag.length ? '<' + subTag + '>' : '')
    + object[objectKey]
    + (subTag.length ? '<' + subTag + '/>' : '')
    + '</'
    + tagType
    + '>';
  }
  return '';
}


// formats prop that is itself an entity, returns a [before, after] wrapping array
export function formatEntityProp(object, propName, propType, tagType = 'span') {
  return [('<'
    + tagType
    + ' class="modulo-contents-citation-' + propName
    + '" itemscope itemprop="'
    + propName
    + '" property="'
    + propName
    + '" '
    + 'itemscope itemtype="http://schema.org/'
    + propType
    + '">')
    ,
    ('<'
    + tagType
    + '/>')
    ];
}

/*
 * SPECIFIC FORMATTERS
 */

export function setSectionMeta(section) {
  let output = ' itemscope itemType="http://schema.org/' + bibToSchema(getMetaValue(section.metadata, 'general', 'bibType'))
              + '" vocab="http://schema.org/" ressource="#' + getMetaValue(section.metadata, 'general', 'citeKey') + '"'
              + (section.parent ? 'itemprop="hasPart" property="hasPart" ' : '')
  return output;
}

export function metadataToSchema(section) {
  let output = '<div class="modulo-contents-schema-metadata-placeholder" style="visibility:hidden">';
  let meta = section.metadata.filter((prop) =>{
    return prop.domain === 'general';
  }).reduce((obj, prop) =>{
    obj[prop['key']] = prop['value'];
    return obj;
  }, {});

  if (meta.title) {
    output += formatSimpleProp(meta, 'title', 'name');
  }

  if (meta.date) {
    output += formatDate(meta);
  }

  if (meta.author) {
    meta.author.forEach((auth)=>{
      output += formatAuthor(auth, '${firstName} ${lastName}');
    })
  }

  // TODO : continue along with other metadata-to-schema conversions

  return output + '</div>';
}

export function formatImageFigure(resource, imageKey, captionContent, inputSchemaType) {
  const schemaType = inputSchemaType || resource.schematype || 'webpage';
  let output = '<div class="modulo-contents-figure" itemscope itemprop="citation" itemtype="http://schema.org/'
              + schemaType
              + '"'
              + ' typeof="' + schemaType + '" resource="#' + resource.citeKey + '"'
              + '>'
              + '<span itemprop="name" property="name" style="display:none">' + resource.title + '</span>'
              + '<figure itemprop="image" property="image" itemscope itemType="http://schema.org/ImageObject" typeof="ImageObject">'
              + '<a href="' + resource[imageKey] + '" itemprop="contentUrl" property="contenturl" value="' + resource[imageKey] + '"></a>'
              + '<img itemprop="image" value="image" src="' + resource[imageKey] + '" alt="' + resource.title + '" />'
              + '<figcaption itemprop="caption" value="caption">'
              + captionContent
              + '</figcaption>'
              + '</figure>'
              + '</div>';
  return output;
}

export function formatLink(resource, text, inputSchemaType) {
  const schemaType = inputSchemaType || resource.schematype || 'webpage';
  let output = '<a class="modulo-contents-hyperlink" itemscope itemprop="citation" itemtype="http://schema.org/'
              + schemaType
              + '"'
              +' typeof="' + schemaType + '" resource="#' + resource.citeKey + '"'
              + ' target="_blank"'
              + ' href="'
              + resource.url
              + '" >'
              + '<span itemprop="name" property="name" value="' + resource.title + '"/>'
              + text
              + '<span itemprop="url" property="url" style="display:none"/>' + resource.url + '</span>'
              + '</a>'
  return output;
}

// wraps the citation of an element inside a schema "citation" html object
export function wrapCitation(resource, tagType = 'span') {
  const schemaType = resource.schemaType || bibToSchema(resource.bibType);
  let before = '<' + tagType + '  class="modulo-contents-citation-wrapper" itemprop="citation" ';
  // microdata header
  before += 'itemscope itemtype="http://schema.org/' + schemaType + '"';
  before += ' id="' + resource.citeKey + '"';
  // RDFa header
  before += ' typeof="' + schemaType + '" resource="#' + resource.citeKey + '"';
  before += '>';
  return {
    before,
    after: '</' + tagType + '>'
  };
}

export function formatTitle(resource) {
  return '<cite class="modulo-contents-citation-title" property="name" itemprop="name">' + resource.title + '</cite>';
}

export function formatDate(resource, mod) {
  let val = resource.date || '';
  const hasDate = val.length > 0;
  if (!hasDate && resource.month) {
    val += resource.month + ' ';
  }
  if (!hasDate && resource.year) {
    val += resource.year;
  }

  if (val && mod) {
    if (mod === 'year') {
      const match = val.match(/([\d]{2,4})/);
      if (match) {
        val = match[1];
      }
    }
  }
  return val.length ? '<time class="modulo-contents-citation-date" property="datePublished" itemprop="datePublished" datetime="' + val + '">' + val + '</time>' : '';
}

export function formatPages(resource) {
  const pages = resource.pages.split(/[-–]/);
  return 'p.<span class="modulo-contents-citation-pages" itemprop="pageStart" property="pageStart">' + pages[0] + '</span>-<span itemprop="pageEnd" property="pageEnd">' + pages[1] + '</span>';
}


// pattern example : ${firstName:initials} ${lastName:capitals}
// pattern example : ${lastName:capitals}, ${firstName:initials}
export function formatAuthor(author, pattern) {
  const vals = Object.assign({}, author);
  // catch format transformers
  const transformFirstNameMatch = pattern.match(/(\${firstName(:[^}]*)?})/);
  const transformLastNameMatch = pattern.match(/(\${lastName(:[^}]*)?})/);
  // if transformers - transform
  if (transformFirstNameMatch) {
    if (transformFirstNameMatch[2] === ':initials') {
      // processing composed names (e.g. Gian-Marco Patalucci)
      let initials = vals.firstName.split('-').map((term)=>{
        if (term.length > 0) {
          return term.toUpperCase().substr(0, 1) + '.';
        }
        return term;
      }).join('-');
      // processing multiple names (e.g. Donald Ronald Romuald Reagan)
      initials = vals.firstName.split(' ').map((term)=>{
        if (term.length > 0) {
          return term.toUpperCase().substr(0, 1) + '.';
        }
        return term;
      }).join(' ');
      vals.firstName = initials;
    }
  }
  if (transformLastNameMatch) {
    if (transformLastNameMatch[2] === ':capitals') {
      vals.lastName = vals.lastName.toUpperCase();
    }
  }
  const wrappers = ['<span class="modulo-contents-citation-author" itemprop="author" itemscope itemtype="http://schema.org/Person" property="author"  typeof="Person">',
                    '</span>'];
  vals.firstName = '<span class="modulo-contents-citation-author-firstname" itemprop="givenName" property="givenName" >' + vals.firstName + '</span>';
  vals.lastName = '<span class="modulo-contents-citation-author-lastname" itemprop="familyName" property="familyName" >' + vals.lastName + '</span>';
  // todo: process pattern
  return wrappers[0] + pattern.replace(/(\${firstName(:[^}]*)?})/, vals.firstName).replace(/(\${lastName(:[^}]*)?})/, vals.lastName) + wrappers[1];
}

export function formatDoi(resource, pattern) {
  return pattern.replace('${doi}', '<a class="modulo-contents-citation-doi" itemprop="sameAs" property="sameAs" href="http://dx.doi.org/' + resource.doi + '">' + resource.doi + '</a>');
}

export function formatUrl(resource, pattern) {
  return pattern.replace('${url}', '<a class="modulo-contents-citation-url" itemprop="url" property="url" href="' + resource.url + '">' + resource.url + '</a>');
}

// Handling nested description of parent journal
// Example of output:
// Sciences du Design, 2013, 3(2). ISSN : xxxx-xxxx
// Example of corresponding pattern:
// ${journal}, ${date}, ${volume}(${issue}). ISSN : ${issn};
export function formatParentJournal(resource, pattern) {
  const journalExpression = ['<span class="modulo-contents-citation-journal" itemprop="isPartOf" itemscope itemtype="http://schema.org/Periodical" typeof="Periodical">',
                              '<span itemprop="name" property="name">',
                              '</span>',
                              '</span>'
                              ];
  const volumeExpression = ['<span class="modulo-contents-citation-volume" itemscope itemprop="hasPart" itemtype="http://schema.org/PublicationVolume" typeof="PublicationVolume">',
                              '<span itemprop="volumeNumber" property="volumeNumber">',
                              '</span>',
                              '</span>'
                              ];
  const issueExpression = ['<span class="modulo-contents-citation-issue" itemscope itemprop="hasPart" itemtype="http://schema.org/PublicationIssue" typeof="PublicationIssue">',
                              '<span itemprop="issueNumber" property="issueNumber">',
                              '</span>',
                              '</span>'
                              ];

  let expression = journalExpression[0] + pattern.replace('${journal}', journalExpression[1] + resource.journal + journalExpression[2]) + journalExpression[3];

  expression = expression.replace('${date}', formatDate(resource));

  if (resource.volume) {
    expression = expression.replace('${volume}', volumeExpression[0] + volumeExpression[1] + resource.volume + volumeExpression[2]);
  } else expression = expression.replace('${volume}', '');

  if (resource.issue) {
    expression = expression.replace('${issue}', issueExpression[0] + issueExpression[1] + resource.issue + issueExpression[2] + issueExpression[3] + volumeExpression[3]);
  } else expression = expression.replace('${issue}', volumeExpression[3]);

  if (resource.issn) {
    expression = expression.replace('${issn}', formatSimpleProp(resource, 'issn', 'issn'));
  } else expression = expression.replace('${issn}', '');

  return expression;
}

// ${publisher} : ${address}
export function formatPublisher(resource, pattern) {
  const publisherExpression = ['<span class="modulo-contents-citation-publisher" itemprop="publisher" value="publisher" itemscope itemtype="http://schema.org/Organization" typeof="Organization">',
                              '<span itemprop="name" property="name">',
                              '</span>',
                              '</span>'
                              ];
  let expression = publisherExpression[0] + pattern.replace('${publisher}', publisherExpression[1] + resource.publisher + publisherExpression[2]) + publisherExpression[3];

  if (resource.address) {
    expression = expression.replace('${address}', '<span itemprop="address" value="address">' + resource.address + '</span>');
  }
  return expression;
}
