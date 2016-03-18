Modulo documentation | contents structure | WIP
=================


Modulo presents a two-level file structure in which the root corresponds to the entire document (book/thesis/monograph) and subfolders correspond each to one section (chapter, article, ...).

**In the following, *contentRoot* will stand for the content folder of the app, for instance root/server/contents.**

# Types of folders

There are two types of folders :
* those that don't start with a ``_`` are content folders
* those that start with a ``_`` are plugin folders

## Plugin folders

They can be either at the root of the document, or inside a section.

They are plugins that deal with the look of the document or section. They can be either :
* css styles
* react components : they correspond to additional/alternative ways to display figures or even main content
* html templates for displaying bibliography, references, ...


## Content folders

Contents folders are the contentRoot folder and all folders that contain a meta.txt file featuring the meta property "general:type:content".

* each content folder ***must feature a meta.txt file*** that describes the metadata of the section
* each content folder ***should feature a content.md file*** that describes the content of the section (chapter, or cover for the rootfolder), **except if it used only for hierarchical structure (eg : part title)**

Then, it can optionally contain :
* other ``.md`` files that will be able to be concatenated in to the main.md file
* ``.bib`` files that will be loaded as bibliographical resources

## Overview

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

