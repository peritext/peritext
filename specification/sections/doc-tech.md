Modulo documentation | technical reflections | WIP
=================


# Requirements

Modularity of the data parsing model and data access :

* modulo is purposed to be source-agnostic, and not indispensable for source reviewing (data should be easily readable without using modulo)
* data access, data management and data processing should be separated
* data models (for metadata, markdown, referencing) should be encoded in separate data files (.csv, .json) from the code
* external resources transactions (zotero, google spreadsheet ...) should be clearly separated from the core of the engine

Flatfile-to-rich-document process:
* metadata and encoding models must be separed from the scripts
* document parsers should be lazy and process only the necessary data for a given query
* document parsers should not perform several times the same operations on files

SEO and indexability :
* app must be isomorphic/universal (all views rendered as html server-side)
* html schema props must be used whenever possible

Social :
* all the internal data logic of a publication should be available as a public API
* should be possible to share specific parts of the document with different levels of granularity
* should be possible to access through permalinks specific parts of the document with different levels of granularity


Scalability and project evolution:
* it should be internationalized from the begining
* it should be test-driven from the begining
* it should be easily scalable (library, collection, ...) later on
* it should be able to welcome a further possible editing back-office interface
* it should be easily convertible into a SaaS platform

# Global architecture : flux/redux architecture

Flux architecture is not required for the v1 of the project, as it is a read-only app, not dynamically supporting data-intensive operations.

Though, this architecture would ensure maximum scalability for the future.

![Modulo architecture](https://raw.githubusercontent.com/robindemourat/modulo/master/specification/assets/modulo-architecture.png)

# Technological stack survey

Architecture :
* redux
* Immutable

* uniloc (routing)
* axios (http requests)
* redux-api-middleware --> https://www.npmjs.com/package/redux-api-middleware

Parsers helpers :
* marked
* (markua-js ?)
* zotero-bib-parser and bib-parser for ... bib parsing

Interface components :

* react head (html head metadata) --> https://github.com/nfl/react-helmet
* react-redux
* react
* react-dom
* react-css-modules --> https://github.com/gajus/react-css-modules
* PaCoMo
* d3.js

Tests :

* chai
* redux-test-reducer --> https://github.com/amsardesai/redux-test-reducer
* chai-immutable

Git organization :

* Commitizen --> http://commitizen.github.io/cz-cli/

Starter kits :

1. Universal JS https://github.com/colinmeinke/universal-js#terms-concepts-and-reasoning (nice - )
1. https://github.com/davezuko/react-redux-starter-kit (maybe too new and too much technos that I don't know)
1. MERN https://github.com/hashnode/mern-starter (not finished - but seems to have nice cli utils)

TODO : dig deeper into https://github.com/xgrommx/awesome-redux

# Data sources purposes

There are three different data source supporting different needs.

**Document source (eg=Google Drive)** represents the actual text-based contents of a document and its structure - represented by folders and ``.metadata`` files.

**Assets source (eg=Amazon s3)** represents all assets being used in resources and figures. They are typically images, videos, data files, and so on ...

**Annotation source (default=Disqus)** is used to allow for comments on specific entities of the document (paragraphs / figures / citations / ...). For the future two things must be kept in mind :
* in the future of the project, read/write and git-based version of modulo, comments should be able to be targeted both at a specific entity and a specific record of the publication
* ideally, it could be great to add a layer on top of discussion system (through inline syntax ?) in order to support more precise contributions : support the editorial process (change suggestions, ...), opinion giving, fact-checking, linking to another entity of the publication, ...

# Modulo document model

Modulo is made of sections. Each section is a linear "part" of the document to display, figuring either a chapter, a section, or even a paragraph if the writer wants to go to this level of granularity.

Each section is made of two types of data :
* *content* : linear, xml/html structured, textual content
* *resources* : objects which are quoted, used, cited, visualized inside the section

Each section inherits by default some data (like metadata) from the root section, and possibly from its parent when it has one.

However, some elements of the contents will be repeatedly called in the document within several times : images, bibliographical references, data sources visualized in different ways.

That's why we should separate "resources" and "resources contextualization" in modulo's conceptual lidek.

"Resources" are of several types :
* bibliographical records : books, documents, ...
* data/media : images, video, tables, ... which has invariant information (owner, technical information, way to retrieve it)
* entities (or glossary entries) : bound to notions, persons, places, ... these are "things" cited in the document.

They are handled in very different way when featured in sections, but described with the same type of syntax, extended from the BibTex standard.

Then, they are called inside the document through what I chose call 'contextualization', which is a way of specifying how it should be displayed.
* bibliographical records can be short-cited or long-cited, at specific pages, ...
* data/media can be inserted inside the document, used to produce a visualization, displayed in rough form as aside figure
* entities can be used to generate a glossary, or just to enrich the semanticity of a page ...

# Forseen code structure (instable)

Everything here should be in a src/ file distinct from built code :

```
.
//logic and utils modules
|+--config //everything related to the bootstrapping and specification of the app
|   +--defaultModels //default metadata models for the application
|       +--metadataEntities.json //escription (by domain) of the diverse metadata entities
|       +--metadataPropagation.json // "table" of metadata entity propagation relations (ordered)
|   +--defaultTemplates //default templates models for the application
|       +--toc.md
|       +--short-citation.md
|       +--long-citation.md
|   +--config.json //dev and prod configs + application sources (for contents, assets, and comments : flatfile, s3, disqus ...)
|   +--credentials.json //all private credentials (zotero, google analytics, data sources, ...)
+--connectors
|      +--filesystem //handle flatfiles management on local server files
|      +--s3//handle flatfiles management on S3
|      +--drive//handle flatfiles management on drive
|      +--ftp//handle flatfiles management on ftp
|      +--github//handle flatfiles management on github
|      +--disqus//default system for annotation management
|+--converters //parsers/serialisers at different levels on top of the file structure tree level
|      +--bibTexConverter
|      +--sectionConverter
|+--controllers // internal controllers for transactions with different sources (contents, assets, annotations)
|       +--annotationsController
|       +--contentsController
|       +--assetsController
|+--validators // Functions which take an object containing inputs and return an object containing any errors and also a "purified" version of the object
|      +--metadataValidator
|      +--resourceValidator
|+--models //unchangeable models (using Immutable lib ?) for metadata parsing, ...
|      +--resourceTypes.json //types of accepted resources types and related information
|      +--sectionTypes.json //types of sections/documents (book, ...) with inheritance and accepted metadata

//app-relative architecture
|+--actions // Redux action creators
|+--actors // Handle changes to the store's state
|+--components // React components, stateless where possible
|+--constants // Define stateless data
|+--containers // Unstyled "smart" components which take the store's state and dispatch, and possibly navigation location, and pass them to "dumb" components
|+--reducers // Redux reducers
|+--static // Files which will be copied across to the root directory on build
|+--styles // Helpers for stylesheets for individual components
|+--intl //internationalized UI contents
```


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
- navbar
    - logo and title
    - search block
    - table of contents
    - views related links
- main column
    - content container
        - (loop) content blocks
    - sidenotes container
        - (loop) sidenotes
    - footer
- aside column
    - header
    - body
    - footer
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
                    resourcesReferences : []//list of references to resources
                }
            ],
            resources : [], //resources used in the section
        },
    config : {
        assetsSource : {}, // metadata about sources (source type, user id, api key, root)
        contentSource : {},
        annotationSource : {}
    }
}
```
