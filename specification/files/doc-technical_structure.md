Modulo documentation | technical structure | WIP
=================


# Backend requirements

* file parsing and file reading should be separated (in order to be able to migrate to s3 later on for instance)
* it should be able to serve the data at different levels of precisions
* metadata and encoding models must be separed from the scripts
* it should process only the necessary data for a given query
* it should not perform several times the same file processings
* it should be scalable (library, collection, ...) later on

# Forseen structure of root/server

```
.
+--api
|   +--queries //all utils for preparing views
|   +--routes
    |   +--someRoute
+--config //dev and prod configs
+--credentials //all private credentials (zotero, google analytics, ...)
+--contents //documents contents
+--templates//html templates to use
+-- models //markdown and metadata models
+--parsers //structure parser, metadata parser, data parser
+--renderers //html renderers
+--views
+--temp //possibly, some private files to hardwrite if needed
+--app.js
+--routes.js
```

# Routes access

public/** should be freely accessible.

content/* files should be freely accessible at root/contents/ if not specified otherwise in the folder's meta.txt document.

content/* folders should not be accessible.

api/* will feature api endpoints

Otherwise : 

```
rooturl/
```

--> will serve the document root

```
rooturl/:slug
```

--> will serve a particular document or a 404 screen

## Parsers

* should use an easily editable data model
* should be easily pluginable

I forsee 3 parsing scripts :

* file parser (that could be turned someday into an api middleware to s3 or another database)
* content file parser
* metadata file parser

# Forseen API endpoints

## Get document summary

```
root/api/summary/
```

## Get document data (root or part)

```
root/api/document/:documentslug?
```

| parameter | description |
| ========= | =========== |
| filter | coma-separated content type filters |

'filter' parameter - should allow for getting just a part of data (values coma separated) :
* metadata:just metadata
* html:just html content
* md:just initial md content
* figures:just figures
* glossary:just glossary elements
* references:just bibliographical references

## Get glossary

```
root/api/glossary/
```

## Get figures list

```
root/api/figures/
```

## Get references list

```
root/api/references/
```

## Global search

```
root/api/search/
```

| parameter | description |
| ========= | =========== |
| query | query to perform |
| filter | coma-separated filters |
