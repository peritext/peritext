Modulo documentation | contents structure | WIP
=================


Modulo presents a two-level file structure in which the root corresponds to the entire document (book/thesis/monograph) and subfolders correspond each to one part (chapter/article/...).

**In the following, *contentRoot* will stand for the content folder of the app, basically root/server/contents.**

# Types of folders

Several types of folders in the contents :
* ressources folders --> are public and can be processed and called in the documents (default)
* content folders --> feature the contents of pages to display (they should be accessible with general:type:content)
* templates folders -->  templates to use for things such as reference, bibliography, ...
* plugins template that will feature additional/custom modulo modules
* other folders --> other folder types - for instance for glossary, index, ... - still a mystery (they should be specified with general:type:***)


## Content folders

Contents folders are the contentRoot folder and all folders that contain a meta.txt file featuring the meta property "general:type:content".

* each content folder ***must feature a meta.txt file*** that describes the metadata of the entity
* each content folder ***must feature a content.md file*** that describes the content of the part (chapter, or cover for the rootfolder)

Then, it can optionally :

* contain a style.css file that will specify style for this part (contentRoot/style.css will apply to all subfolders)
* images, videos, data, and other files, that will be accessed through the documents as if their were root (exemple : "contentRoot/chapter1/img.png" will be accessed in the content file as "img.png")
* a templates folder that will feature templates to use for things such as reference, bibliography, ...
* a plugins template that will feature additional/custom modulo modules

## Overview

By default, sub-parts are ordered in alphabetical order of folders.

Example of data structure from contentRoot:

```
.
+--meta.txt
+--content.md
+--chapter 1
|   +--meta.txt
|   +--content.md
|   +--images
    |   +--myimage.png
+--chapter 2
|   +--meta.txt
|   +--content.md
+--cover-files
|   +--cover-image.jpg
```

# Credentials

Credentials should use a simple structure and separate files for each credential type.

```
.
+--zotero.txt
+--analytics.txt
+--editor.txt
```

