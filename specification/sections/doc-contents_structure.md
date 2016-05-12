Modulo documentation | contents structure | WIP
=================


Modulo presents a two-level file structure in which the root corresponds to the entire document (book/thesis/monograph) and subfolders correspond each to one section (chapter, article, ...).

**During the flatfile-to-modulo transformation process**, all sections (root and subsections) are gathered in one flat array of sections. Each section contains informations about its relations to other sections (child or parent section, preceding section, ...).

# Types of folders

There are two types of folders :
* those that **don't start** with a ``_`` are content folders
* those that **do start** with a ``_`` are plugin folders

## Plugin folders

They can be either at the root of the document, or inside a section.

They are plugins that deal with the look of the document or section. They can be either :
* css styles
* react components : they correspond to additional/alternative ways to display figures or even main content
* templates for displaying bibliography, references, ...

By default, plugins follow the inheritance process : if a css style plugin is applied to some section, it will be inherited by its children sections unless they have their own plugin ; in that latter case, child's plugin always override inherited plugin.

## Content folders

Content folders must contain to types of files :
* ``.md`` files, which feature markdown content
* ``.bib`` files, which feature simili-BibTeX content

**Each content folder must include a ``content.md`` main file which be used as the entrance to markdown contents of this folder.** 

**Each content folder can include additionnal ``.md`` files** are used to display content :
* the modulo transformation algorithm first looks for ``include`` statements in order to include files in one another, starting with the ones inside ``content.md``
* then, once all ``include`` are resolved, it includes automatically at the end of content the remaining contents, using filename's alphabetical order for ordering

**Each content folder can include one or several ``.bib`` files, which are concatenated in filename's alphabetical order** and then processed.

BibTeX objects describe two categories of objects :
* **modulo sections metadata** : each BibTeX object of which filename begins with ``modulo`` (e.g. : ``modulobook``) is a description of the curent section-folder metadata (e.g. : author, title, keywords, ...)
* **modulo resources description** : bibliographical records, static or dynamic data source description, entity description.

## Contents ordering and sections hierarchization

See meta_syntax spec.

## Contents metadata populating system

See meta_syntax spec.

## Overview

Example of data structure from contentRoot:

```
.
+--meta.bib
+--content.md
+--chapter 1
|   +--meta.bib
|   +--content.md
+--chapter 2
|   +--meta.bib
|   +--content.md
```

