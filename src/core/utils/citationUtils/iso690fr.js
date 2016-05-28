/*
 * iso690 bibliographic norm formatter (lang: fr)
 * Doc 1 : http://revues.refer.org/telechargement/fiche-bibliographie.pdf
 * Doc 2 : https://www.mpl.ird.fr/documentation/download/FormBibliog.pdf
 * TODO 1 : Not finished resourceType-to-citation mapping (documented properly only books and journal articles - setup a default presentation for others)
 * TODO 2 : handle year numerotation - if several publications of the same author(s) are cited, they should be alphabetically numeroted in the order of bibliography
 * (this require to handle the ${bibliography} template feature first, then update code accordingly)
 */

import * as formatter from './../microDataUtils/';

function formatCitationDetails(contextualizer) {
  let pageAddon = '';

  if (contextualizer.page) {
    pageAddon = ', p. ' + formatter.formatSimpleProp(contextualizer, 'page', 'quotepage');
  } else if (contextualizer.pages) {
    pageAddon = ', pp. ' + formatter.formatSimpleProp(contextualizer, 'pages', 'quotepage');
  }

  let additionnal = '';

  if (contextualizer.caption) {
    additionnal += '. ' + formatter.formatSimpleProp(contextualizer, 'caption', 'comment', 'i');
  }

  if (contextualizer.note) {
    additionnal += '. ' + formatter.formatSimpleProp(contextualizer, 'note', 'comment', 'i');
  }

  if (contextualizer.translation) {
    additionnal += '. <span class="modulo-contents-citation-translation">Traduction : <q>' + contextualizer.translation + '</q></span>';
  }
  if (contextualizer.original) {
    additionnal += '. <span class="modulo-contents-citation-original">Citation originale : <q>' + contextualizer.original + '</q></span>';
  }
  return pageAddon + additionnal;
}


 /*
 * Long citation (bibliography style)
 */

export function formatBlockCitation(contextualizer, resource, ibid, opCit) {
  /*
   * Resource-related population
   */

  let ref = '';
  if (ibid) {
    ref += '<i class="modulo-contents-citation-ibid">Ibid.</i>';
  } else {
    const title = formatter.formatTitle(resource);
    let authors;
    switch (resource.bibType) {
    case 'book':
      authors = resource.author.map((author) =>{
        return formatter.formatAuthor(author, '${lastName:capitals}, ${firstName}');
      }).join(', ');
      if (opCit) {
        ref += authors + ', <i class="modulo-contents-citation-opcit">op.cit.</i>';
        break;
      } else {
        ref += authors + '. ' + title;
        if (resource.edition) {
          ref += '. ' + formatter.formatSimpleProp(resource, 'edition', 'bookEdition');
        }
        if (resource.publisher) {
          ref += '. ' + formatter.formatPublisher(resource, '${publisher} : ${address}');
        }
        if (resource.year || resource.date) {
          ref += ', ' + formatter.formatDate(resource, 'year');
        }
      }
      break;

    case 'article':
      authors = resource.author.map((author) =>{
        return formatter.formatAuthor(author, '${lastName:capitals}, ${firstName}');
      }).join(', ');
      if (opCit) {
        ref += authors + ', <i class="modulo-contents-citation-opcit">op.cit.</i>';
        break;
      } else {
        let parent = formatter.formatParentJournal(resource, '${journal}, ${date}, vol. ${volume}, no ${issue}' );
        if (resource.pages) {
          parent += ', p. ' + formatter.formatSimpleProp(resource, 'pages', 'pages');
        }
        ref += authors + '. ' + title + '. ' + parent;
      }
      break;

    default:
      authors = resource.author.map((author) =>{
        return formatter.formatAuthor(author, '${lastName:capitals}, ${firstName}');
      }).join(', ');
      if (opCit) {
        ref += authors + ', <i class="modulo-contents-citation-opcit">op.cit.</i>';
        break;
      } else {
        ref += authors + '. ' + title;
        if (resource.edition) {
          ref += '. ' + formatter.formatSimpleProp(resource, 'edition', 'bookEdition');
        }
        if (resource.publisher) {
          ref += '. ' + formatter.formatPublisher(resource, '${publisher} : ${address}');
        }
        if (resource.year || resource.date) {
          ref += ', ' + formatter.formatDate(resource, 'year');
        }
      }
      break;
    }

    if (!opCit) {
      if (resource.isbn) {
        ref += '. ISBN : ' + formatter.formatSimpleProp(resource, 'isbn', 'isbn');
      }
      if (resource.issn) {
        ref += '. ISSN : ' + formatter.formatSimpleProp(resource, 'issn', 'issn');
      }
      if (resource.doi) {
        ref += formatter.formatDoi(resource, '. DOI : ${doi}');
      }
      if (resource.url) {
        ref += formatter.formatUrl(resource, '. Accessible en ligne : ${url}');
      }
    }
  }

  /*
   * Contextualizer-related population
   */
  const additionnal = formatCitationDetails(contextualizer);

  const wrappers = formatter.wrapCitation(resource);
  return wrappers.before + ref + additionnal + wrappers.after;
}


/*
 * Short citation
 */

export function formatInlineCitation(contextualizer, resource, ibid, opCit) {
  /*
   * Resource-related population
   */

  let ref = '';
  if (ibid) {
    ref += '<i class="modulo-contents-citation-ibid">ibid.</i>';
  } else {
    let authors;
    if (resource.author.length <= 2) {
      authors = resource.author.map((author) =>{
        return formatter.formatAuthor(author, '${lastName:capitals}');
      }).join(' et ');
    } else {
      authors = formatter.formatAuthor(resource.author[0], '${lastName:capitals}') + '<i class="modulo-contents-citation-etal">et al.</i>';
    }
    if (opCit) {
      ref = authors + ', <i class="modulo-contents-citation-opcit">op.cit.</i>';
    } else if (resource.date || resource.year) {
      ref = authors + ', ' + formatter.formatDate(resource, 'year');
    } else {
      ref = authors;
    }
  }

  /*
   * Contextualizer-related population
   */
  const additionnal = formatCitationDetails(contextualizer);
  const wrappers = formatter.wrapCitation(resource);
  return wrappers.before + ref + additionnal + wrappers.after;
}
