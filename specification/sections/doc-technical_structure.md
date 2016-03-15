Modulo documentation | technical structure | WIP
=================


# Requirements

Modularity of the convertions model and data access :

* modulo is purposed to be source-agnostic, and not indispensable for source reviewing (data should be easily readable, even without modulo)
* data access, data management and data processing should be separated
* data models (for metadata, markdown, referencing) should be encoded in separate data files (.csv, .json) from the code
* external resources transactions (zotero, google spreadsheet ...) should be clearly separated from the core of the engine

Flatfile-to-rich-document process:
* metadata and encoding models must be separed from the scripts
* document parsers should be lazy and process only the necessary data for a given query
* document parsers should not perform several times the same operations on files


Scalability and project evolution:
* it should be easily scalable (library, collection, ...) later on
* it should be able to welcome a further possible editing back-office interface
* it should be easily convertible into a SaaS platform

# Global architecture : flux architecture

Flux architecture is not required for the v1 of the project, as it is a read-only app, not dynamically supporting data-intensive operations.

Though, this architecture would ensure maximum scalability for the future.

![Modulo architecture](https://raw.githubusercontent.com/robindemourat/modulo/master/specification/assets/modulo-architecture.png)

# Data sources purposes

There are three different data source supporting different needs.

**Document source** represents the actual text-based contents of a document.

**Assets source** represents all assets being used in resources and figures. They are typically images, videos, data files, and so on ...

**Disqus** is used to allow for comments on specific entities of the document (paragraphs / figures / citations / ...). For the future two things must be kept in mind :
* in the future of the project, read/write and git-based version of modulo, comments should be able to be targeted both at a specific entity and a specific record of the publication
* ideally, it could be great to add a layer on top of discuss system (through inline syntax ?) in order to support more precise contributions : support the editorial process (change suggestions, ...), opinion giving, fact-checking, linking to another entity of the publication, ...

# Conceptual model of a Modulo node

Modulo is made of nodes. Each node is a linear "part" of the document to display, figuring either a chapter, a section, or even a paragraph if the writer wants to go to this level of granularity.

Each node inherits by default some data (like metadata) from the root, and possibly from a specified parent, and change other (like its content).

However, some elements of the content will be repeatedly called in the document within several times : images, bibliographical references, data sources visualized in different ways.

That's why we should separate "resources" and "resources mobilizations" in modulo's conceptual models.

"Resources" are of three types :
* bibliographical records : books, documents, ... accessed at a specific time and possibly quoted, commented, and translated in different places of the document
* figures : image, video, data, ... which has invariant information (owner, technical information, way to retrieve it) and contextual uses (through legend, data visualization, ...)
* entities (or glossary entries) : bound to notions, persons, places, ... these are "things" cited in the document.

Typically, each type of resource should be represented by a type of file :
* .bib files represent bibliographical records
* .entity files represent entities description
* .fig files represent document descriptions

And each of these files should be able to describe one or several resources.

The game of Modulo is to enable writing of a document in a "traditional", linear way (chapters and their attachements), but to provide multiple and non-linear ways of displaying the data then.

When resources have been described, modulo should provide with a (most uniform possible) way of contextualizing resources.


# Forseen code structure elements (not finished)

```
.
+--api
|   +--queries //all utils for preparing API responses
|   +--routes //index and controllers for the different API views
    |   +--someRoute
+--config //dev and prod configs + application sources (for contents, assets, and comments : flatfile, s3, disqus ...)
+--credentials //all private credentials (zotero, google analytics, data sources, ...)
+--contents //documents contents
+--htmltemplates//html templates to use and populate
+--plugins//data communication and middlewares
|   +--flatfile //handle CRUD on flatfiles
|   +--s3//handle CRUD on S3
|   +--zotero //handle zotero querying and templating
+--models //default templating, markdown and metadata models
+--parsers //string parsers : metadata parser, figure/resource parser, modulo-markdown parser, ...
+--routes.js //handle classical routes
```


### Metadata file parser

The metadata file parser will use an external model file to process data.

It will take as input a String representing the metadata of a folder, and its type (root or part). It will render a json file presented metadata in structured+html form.

Algorithm to process a file :

1. (if applicable) parse parent folder metadata
2. populate all unset metadata which have a default value
3. parse the current metadata file and isolate items. For each metadata item :
4. process and record the statement as is for the pointed property (override any previous inherited/default/propagated value)
5. if it has propagation features, try to propagate the metadata for each related item **if it has not been set before in the current metadata file** but **no matter if it has a default value or is inherited from parent**

Additionnally it should be able to quickly render a file :

* check if data is available for a give part slug (availabilityLookup)
* check if data is viewable/public to serve (visibilityLookup)
* verifying the type of a folder (content, resource, ...)
* get the title of a part (titleLookUp)

## Content file parser

The content file parser will use an external model file to process data.

It will take as input a String representing the markdown content of a folder.

It should do two things :

* process markdown content according to a modulo-flavoured marked renderer
* possibly enrich the content with some external calls (zotero, google docs, document metadata) through modules

It should return several things :
* html representation of the content (that would fit into a template)
* html representation of the table of contents
* json library of the modulo resources used

# (client) routes access

public/** should be freely accessible

---


```
rooturl/contents/*
```

--> files should be freely accessible at root/contents/ if not specified otherwise in the folder's meta.txt document.

```
api/* 
```

--> will feature api endpoints

Otherwise : 

```
rooturl/
```

--> will serve the document root

```
rooturl/:slug
```

--> will serve a particular document or a 404 screen


# Forseen API endpoints (read-only for now)

## Get document data (root or part)

```
GET root/api/document/:documentslug?
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



