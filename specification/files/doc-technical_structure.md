Modulo documentation | technical structure | WIP
=================


# Backend requirements

* data management and data processing should be separated : it should be easy to switch from a flatfile system to a s3 system, for instance
* data models (for metadata, markdown, referencing) should be encoded in separate data files (.csv, .json) from the code
* external resources transactions (zotero, google spreadsheet ...) should be clearly separated from the core of the engine
* it should be able to welcome a further possible editing back-office module
* metadata and encoding models must be separed from the scripts
* it should process only the necessary data for a given query
* it should not perform several times the same file processing
* it should be scalable (library, collection, ...) later on

# Forseen structure of root/server

```
.
+--api
|   +--queries //all utils for preparing API responses
|   +--routes //index and controllers for the different API views
    |   +--someRoute
+--config //dev and prod configs + application source (flatfile, s3, ...)
+--credentials //all private credentials (zotero, google analytics, editor ...)
+--contents //documents contents
+--htmltemplates//html templates to use and populate
+--middlewares//data communication
|   +--flatfile //handle CRUD on flatfiles
|   +--s3//handle CRUD on S3
|   +--zotero //handle zotero querying and templating
+--models //markdown and metadata models, default templating models
+--parsers //string parsers : metadata parser, data parser
+--renderers //html renderers for different types of pages (cover, part, search results, glossary, bibliography, ...)
+--temp //possibly, some private files to hardwrite if needed
+--app.js
+--controller.js //main controller/middleware for handling data CRUD
+--routes.js //handle classical routes
```


### controller.js : Main controller

Should :

* handle CRUD operations at an abstract level (data management type agnostic)
* check if data is available for a give part slug (availabilityLookup)
* check if data is viewable/public to serve (visibilityLookup)
* verifying the type of a folder (content, resource, ...)
* get the title of a part (titleLookUp)
* organize the parsing and rendering of a specific folder (rendering)

## root/parsers : parsers

* should use an easily editable data model
* should be easily pluginable/evolutive

I forsee several parsing scripts :

* file structure parser (that could be turned someday into an api middleware to s3 or another database)
* content file parser
* metadata file parser


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

# Routes access

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


# Forseen API endpoints

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


## Edit document content

```
PUT root/api/document/:documentslug?
```

| parameter | description |
| --------- | ----------- |
| type | 'content' or 'metadata' |

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
