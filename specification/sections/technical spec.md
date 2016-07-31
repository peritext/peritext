Peritext documentation | technical reflections | WIP
=================


# Requirements

Modularity of the data parsing model and data access:

* peritext is purposed to be source-agnostic, and not indispensable for source reviewing (data should be easily readable without using peritext)
* data access, data management and data processing should be separated
* data models (for metadata, markdown, referencing) should be encoded in separate data files (.csv, .json) from the code
* external resources transactions (zotero, google spreadsheet ...) should be clearly separated from the core of the engine

Flatfile-to-rich-document process:

* metadata and encoding models must be separed from the scripts
* document parsers should be lazy and process only the necessary data for a given query
* document parsers should not perform several times the same operations on files

SEO and indexability:

* app must be isomorphic/universal (all views rendered as html server-side)
* html schema props must be used whenever possible

Social:

* all the internal data logic of a publication should be available as a public API
* should be possible to share specific parts of the document with different levels of granularity
* should be possible to access through permalinks specific parts of the document with different levels of granularity


Scalability and project evolution:

* it should be internationalized from scratch
* it should be test-driven from scratch
* it should be easily scalable (library, collection, ...) later on
* it should be able to welcome a further possible editing back-office interface
* it should be easily convertible into a SaaS platform

# Global rationale

Peritext is a library aiming at supporting the writing of contextualization-oriented and multimodal documents.

* ``peritext core`` is a library aimed at performing data conversions : turning the javascript representation of flatfile contents (called a ``fsTree``) to the javascript representation of a contextualization-oriented document (called ``peritextDocument``) - and vice versa. It covers :
    - ``generic components`` used by core and plugins
    - ``controllers`` aimed at manipulating a given type of contents (contents, assets, annotations)
    - ``converters`` aimed at managing the main conversion between ``fsTree`` and ``peritextDocument``, but also bibTex, markdown, ... conversions
    - ``models`` which describe what can be done by users in terms of resources, contextualizations, rendering settings, and so on
    - ``resolvers`` which resolve data against models
    - ``validators`` which are modules aimed at verifying that everything is ok with the contents provided by users, and to throw meaningfull errors and warning if necessary
    - ``utils`` used along the app
* a first set of "plugins" called ``connectors`` allow to read & update a flatfile-representable data source according to the ``fsTree`` model
* a second set of "plugins" called ``renderers`` convert ``peritextDocuments`` to actionable representation (epub-oriented json, html, xml, ...)
* a third set of "plugins" called ``exporters`` wrap a renderer and output a specific file format (``pdf``, ``epub``, ``zip``)
* a fourth set of "plugins" called ``contextualizers`` deals with contextualizations and how to transform and render a specific contextualization type (``webpage``, ``timeline``, ``imagegallery``, ``citation``, ...)
* a fifth set of "plugins" called ``referencers`` deals with the rendering of academic references

# [web plugin] Global app architecture : redux architecture

![Peritext architecture](https://raw.githubusercontent.com/robindemourat/peritext/master/specification/assets/peritext-architecture.png)

# Technological stack / package survey


Parsers helpers
 :
* marked
* zotero-bib-parser and bib-parser for ... bib parsing
* https://www.npmjs.com/package/bibtex-parse-js
* citeproc-js : https://github.com/juris-m/citeproc-js - transforms json citations to html through csl files : "+" > compatibility | "-" > does not allow to structure data or to customize rendering

Outputs : 

Pdf :
* pdfkit : http://pdfkit.org/
* phantomjs > pdf : http://www.feedhenry.com/server-side-pdf-generation-node-js/
* **phantomjs-pdf** -> https://www.npmjs.com/package/phantomjs-pdf
* **wkhtmltopdf** -> https://www.npmjs.com/package/wkhtmltopdf
* example with heroku impl : https://github.com/gr2m/wkhtmltopdf-node-heorku
* **hummusjs** for pdf post-production ops (page numbers, ...) --> https://github.com/galkahana/HummusJS

Chose to use Prince for now, because even if it is not free it's the best.

epub :

* best so far after investigation : https://www.npmjs.com/package/epub-gen
* --> https://www.npmjs.com/package/epub
* https://github.com/fabi1cazenave/node-html2epub

indesign :

* --> http://networkcultures.org/digitalpublishing/2014/05/15/import-html-into-indesign-via-xml/

Interface components :

* react head (html head metadata) --> https://github.com/nfl/react-helmet
* react-redux
* react
* react-dom
* react-css-modules --> https://github.com/gajus/react-css-modules
* PaCoMo
* radium
* d3.js
* https://www.npmjs.com/package/redux-promise

Tests :

* chai
* redux-test-reducer --> https://github.com/amsardesai/redux-test-reducer
* chai-immutable

Git organization :

* Commitizen --> http://commitizen.github.io/cz-cli/

# Data sources purposes

There are three different data source supporting different needs.

**Document source (eg=Google Drive)** represents the actual text-based contents of a document and its structure.

**Assets source (eg=Amazon s3)** represents all assets being used in resources and figures. They are typically images, videos, data files, and so on ...

**Annotation source (default=Disqus)** is used to allow for comments on specific entities of the document (paragraphs / figures / citations / ...). 

For the future two things must be kept in mind :

* in the future of the project, read/write and git-based version of peritext, comments should be able to be targeted both at a specific entity and a specific record of the publication
* ideally, it could be great to add a layer on top of discussion system (through inline syntax ?) in order to support more precise contributions : support the editorial process (change suggestions, ...), opinion giving, fact-checking, linking to another entity of the publication, ...

# Peritext document model

Peritext is made of sections. Each section is a linear "part" of the document to display, figuring either a chapter, a section, or even a paragraph if the writer wants to go to this level of granularity.

Each section is made of several types of data :

* ***metadata*** : title, author, abstract, ...
* ***resources*** : objects which are quoted, used, cited, visualized inside the section. Linkd to contextualizations.
* ***data*** : resource-related data (tables, etc.). An array composed of elements which are either an unresolved Promise, the data, or an error. These promises are defined during the content parsing process. They are resolved either lazyly for dynamic web-like outputs, or alltogether for static (e.g. pdf) outputs
* ***content*** : content composed of a collection or react components. Linked to contextualizations and notes, and possibly to metadata through template calls.
* ***notes*** : pointed in contents and similar, aside or foot contents. Linked to contents and contextualizations.
* ***contextualizers*** : descriptions of some ways to display resources. Linked to contextualizatiosn.
* ***contextualizations*** : pointed in contents, resources contextualizations through a contextualizer
* ***customizers*** : set of data that customize a specific document aspect
  - ***css*** : document or section specific style rules
  - ***settings***: rules about the disposition of contents (whether to put a cover, where to put notes and figures, whether and where to display table of contents, etc.)

Each section inherits by default some data (like metadata) from the root section, and possibly from its parent when it has one.

However, some elements of the contents will be repeatedly called in the document within several times : images, bibliographical references, data sources visualized in different ways.

That's why we should separate "resources" and "resources contextualization" through "contextualizers" in peritext's conceptual model.

"Resources" are of several types, that can be sorted into three broad categories :

* **bibliographical records** : books, documents, ...
* **data/media** source metadata : images, video, tables, ... which have invariant information (owner, technical information, way to retrieve it)
* **entities (or glossary entries)** : bound to notions, persons, places, ... these are "things" cited in the document.

They are handled in very different ways when featured in sections, but described with the same type of syntax, extended from the BibTeX standard.

Then, they are called inside the document through what I chose to call 'countextualizer', which is a way of specifying how it should be displayed. The conjunction of a resource, a contextualizer and a anchoring point inside the contents constitute a "contextualization".

* bibliographical records can be short-cited or long-cited, at specific pages, ...
* data/media can be inserted inside the document, used to produce a visualization, displayed in rough form as aside figure
* entities can be used to generate a glossary, or just to enrich the semanticity of a page ...

# Modules

Peritext modules could be categorised as following :

* the ``core`` of the app is about turning a custom representation of a flatfile content (called ``fsTree`` in app. jargon) into a javascript array representing a series of sections (called ``peritextSectionsArray``), the first being the document root
* the ``connectors`` plugins handle how to get an ``fsTree`` representation from a given source of data, and how to set the content of a given source of data from a ``fsTree`` representation
* the ``contextualizers`` plugins handle a specific contextualizer and how to handle it in static/block, static/inline, dynamic/block and dynamic/inline forms
* the ``renderers`` plugins render a ``peritextSectionsArray`` to a specific data format
* the ``exporters`` plugins produce a file in a specific format (pdf, epub, ...)


# Parsers

## Parsers order and repetition

Because of metadata vertical propagation, metadata should always be processed for the whole document (therefore most probably cached - both separately (section by section) - and when computed).

Section contents could be parsed on demand - or all processed then cached (case of printed document ...).

## Metadata parser

The metadata file parser will use an external model file to process data.

It will take as input a String representing the metadata of a folder, and its type (root or part). It will render a json file presented metadata in structured+html form.

1. parse all folders metadata file by mapping them to objects containing an array of metadata entities
2. resolve hierarchy (by nesting the structure, or by adding a 'parent' reference property ?)
3. resolve specific metadata enrichment and lateral propagation from root to leaves of the sections tree
4. resolve order of sections (``general:after`` || alphabetical)

## Section parser

1. get metadata
2. resolve ``$include:blabla$`` by trying to include related files
3. strip out from the completed ``content.md`` file all the resources description statements
4. parse external resource descriptions statements (``.bib``)
5. parse markdown content (to html)
6. bind html resource contextualisations to resources descriptions ?

# Outputs

From a peritextSectionsList, outputs allow to render the document or a section of the document in a certain way (pdf, epub, react app, ...).

This is where document customizers (e.g. : css styles) are resolved, citation style is applied, and contextualizations are resolved to add content in the body (html code, footnotes, plain svg, dynamic React components calls, ...).

# Data-source transactions middlewares

Should all provide with two simple methods :
* list the contents of a folder
* get the string content of a text file

# UI routes and permalinks

```
rooturl/lectio/section/:sectionCiteKey?
```

--> will serve the root section, a particular document or a 404 screen

```
rooturl/lectio/glossary/:sectionCiteKey?
```

```
rooturl/lectio/figures/:sectionCiteKey?
```

```
rooturl/lectio/social/:sectionCiteKey?
```


# Forseen external API endpoints

## Get document data (root or part)

```
GET root/api/document/:documentCiteKey?
```

| parameter | description |
| --------- | ----------- |
| filter | coma-separated content type filters |

'filter' parameter - should allow for getting just a part of data (values coma separated) :

* metadata:just metadata
* html:just html content
* md:just initial md content
* figures:just figures
* glossary:just glossary elements
* references:just bibliographical references

## Get document summary

```
GET root/api/summary/
```

## Get glossary

```
GET root/api/glossary/
```

## Get figures list

```
GET root/api/figures/
```

## Get references list

```
GET root/api/references/
```

## Global search

```
GET root/api/search/
```

| parameter | description |
| -------- | -------- |
| query | query to perform |
| filter | coma-separated filters |

# Components and modules planning

## Sources middlewares

Public fonctions :

* connect to source / authenticate / setup
* getFileFromPath
* getTreeFromPath

## API Controllers

### Content API controller

### Assets API controller

### Annotations API controller

## "Read mode" interface structure

Grounding on [first interface](http://modesofexistence.org/anomalies) and rapid prototyping/wireframing of the new reader (https://marvelapp.com/5212b6g)

React components hierarchy :

```
- content wrapper
    - menu toggle
    
    - content container (scrllable)
        + content container
            + (loop) content blocks
        + sidenotes container
            + (loop) sidenotes
        + comments markers container
            + (loop) comments markers
- navbar
    - table of contents
    - views related links fixed bottom
        - search block
- aside column
    - fixed header
    - body (scrollable)
    - fixed footer
```

## Application state

```
{
    navigation : {},//for routing
    data : {//data is composed of "sectionObject" objects - they all have the same recursive structure
            metadata : [{
                    domain : string,
                    key : string,
                    vertically_inherited : sectionObjectReference|undefined,
                    laterally_inherited : metadataObjectReference|undefined,
                }],
            contents : [
                {}, //ordered list of elements to be displayed as primary content
                //technically they are all html blocks (possibly containing onclick and onscroll aside triggers)
                {
                    html : '<html>',
                    contextualizations : []//list of references to resources
                }
            ],
            resources : [], //resources used in the section
            contextualizations : []//the contextualizations lirary of the section
        },
    config : {
        assetsSource : {}, // metadata about sources (source type, user id, api key, root)
        contentSource : {},
        annotationSource : {}
    }
}
```

# Webschema & metadata

W3C spec : https://www.w3.org/wiki/WebSchemas/CitationPromotion
Schema spec : http://schema.org/Thesis

Recommandation : overload items with 3 domains of microcitation :
* microdata
* RDFa
* JSON-LD
