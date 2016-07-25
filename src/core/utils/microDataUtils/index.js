/**
 * Collection of utils for formatting scholarly citations in html/schema/microformat/RDFa
 * Schema reference could be even more covered
 */

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
  case 'inherits':
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
