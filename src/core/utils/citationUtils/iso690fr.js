/*
 * iso690 bibliographic norm formatter (lang: fr)
 * Doc 1 : http://revues.refer.org/telechargement/fiche-bibliographie.pdf
 * Doc 2 : https://www.mpl.ird.fr/documentation/download/FormBibliog.pdf
 * TODO 1 : Not finished resourceType-to-citation mapping (documented properly only books and journal articles - setup a default presentation for others)
 * TODO 2 : handle year numerotation - if several publications of the same author(s) are cited, they should be alphabetically numeroted in the order of bibliography
 * (this require to handle the ${bibliography} template feature first, then update code accordingly)
 */

import * as formatter from './../microDataUtils/';

function formatCitationDetails(contextualization, resource) {
  let pageAddon = '';

  if (contextualization.page) {
    pageAddon = ', p. ' + '<span class="modulo-contents-citation-quote-pages">' + contextualization.page + '</span>';
  } else if (contextualization.pages) {
    pageAddon = ', pp. ' + '<span class="modulo-contents-citation-quote-pages">' + contextualization.pages + '</span>';
  }

  let additionnal = '';

  if (resource.caption) {
    additionnal += '. ' + formatter.formatSimpleProp(resource, 'caption', 'comment', 'i');
  }

  if (contextualization.note) {
    additionnal += '. ' + formatter.formatSimpleProp(contextualization, 'note', 'comment', 'i');
  }

  if (contextualization.translation) {
    additionnal += '. <span class="modulo-contents-citation-translation">Traduction : <q>' + contextualization.translation + '</q></span>';
  }
  if (contextualization.original) {
    additionnal += '. <span class="modulo-contents-citation-original">Citation originale : <q>' + contextualization.original + '</q></span>';
  }
  return pageAddon + additionnal;
}


 /*
 * Long citation (bibliography style)
 */

export function formatBlockCitation(contextualization, resource, ibid, opCit) {
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
        let parent = formatter.formatParentJournal(resource, '${journal}, ${date}, vol. ${volume}, no ${issue}, ISSN : ${issn}' );
        if (resource.pages) {
          parent += ', p. ' + formatter.formatPages(resource);
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
  const additionnal = formatCitationDetails(contextualization, resource);

  const wrappers = formatter.wrapCitation(resource);
  return wrappers.before + ref + additionnal + wrappers.after;
}


/*
 * Short citation
 */

export function formatInlineCitation(contextualization, resource, ibid, opCit) {
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
  const additionnal = formatCitationDetails(contextualization, resource);
  const wrappers = formatter.wrapCitation(resource);
  return wrappers.before + ref + additionnal + wrappers.after;
}
