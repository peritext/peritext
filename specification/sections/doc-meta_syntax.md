Modulo documentation | metadata files syntax | WIP
=================

# Principles

* hierarchical representation of components is not mandatory
* metadata inheritance system

# Global considerations

# Syntax pattern

Meta files are composed of plain text - for which each property is separated by others through a linebreak plus '*' .

Model:
```
meta property one
*
meta property two
*
metadata property three

this property spreads 
on several lines
*
metadata property four
```

Then each metadata item is composed of at least three parts, that are separated with the ':' symbol.

* first part describes the domain of the meta property (example: "general", "dublincore", "twitter", ...)
* second part represents the key of the property to specify (example: "title")
* third properties
* additional properties can be specified with additional ':' when required (example : "dublincore:creator:author:Popol") - if not required by the 

Model:
```
first property domain:first property key:first property value
*
second property domain:second property key:second property value
```

# Config metadata - sections' organization

There is a specific domain for metadata which deals with the organization of the sections.

There are three types of organizational information that can be given to a Modulo's section :
* ordering information : *this section follows that other section*
* importance information : *this section is of that importance regarding its parent section* (think of html titles h1, h2, h3, ...)
* hierarchy information : *this section is the children section of that other section*

**Logical conflicts.** *What if, on one hand, I specify the ordering of an element by specifying a preceding element at begining of sections list, and on the other hand I specify as parent an element which is in a totally different part of the list of sections, like in the end ?*
For now I think concerns should be separated : hierarchy deals with metadata propagation (see below), ordering with display of the document. So that could be logically possible but, later on, prevented or displayed as a bad practice (with warnings and stuff) by the editor's UI.

**Question**. *Should hierarchy information be inherited from the previous section if specified ? (this would avoid to have to reset the parent section for each subsection)*
I don't think so.

This variety is provided in order to allow for a maximum flexibility in terms of organization of the editorial content. 

*Personal note about that : most text's digital representation stand between two extreme designs : considering a text as a linear suite of blocks, or considering it as a tree structure of parts, subparts, sub-subparts, etc. With this part of Modulo's design I want to match with the complexity of print documents structures in terms of summary and index, where for instance a 'Forewords' or an 'interlude' does not fit into a well-organized tree structure of parts, subparts, etc.*


The domain used could be ``config``. So for instance in order to specify the parent of a section :
```
config:parent:Part 1
```

Here is a first (provisionnal) list of metadata properties :
* ``config:parent`` : after [that section]'s slug (folder title)
* ``config:parent-title`` : after [that section]'s title
* ``config:importance-level`` : importance level of the section (computed by addition with the importance-level of parent)
* ``config:parent`` : id (folder title) of the parent of the section
* ``config:parent-title`` : title of the parent of the section

# Properties lateral propagation

Modulo is supposed to be smart and disseminate similar metadata accross metadata domains if not specified otherwise. For example, the "title" property should automatically spread to "dublincore:title", "og:title", "twitter:title" ... if not specified otherwise later on in the metadata file.

See assets/modulo metadata model to see the propagation table.

A metadata model entry features a template that specified how to represent it in the ``<head>`` of HTML documents - so for instance (using es2015's string templating feature) :
```
'<meta name="DC.subject" content="$value" />'
```

# Property vertical propagation

By default, all contentRoot's metaproperties are disseminated to the children parts.

*So for instance, if I specify at the root's metadata file that the author is Paul, all children sections will feature metadata's author as Paul, if not specified otherwise.*

Another case of propagation is when a section features a 'parent' metadata property. In this case the inheritance tree is nested, and the element inherits from its parent's metadata (which therefore will have to be parsed first). *If a section has as a parent another section which feature Jean as its author, it will have itself Jean as author.*


## Breaking vertical propagation/inheritance

There should be two ways to make a children element having a different metaproperty than its inherited one :
* set a new value for this metaproperty
* unset the metaproperty

To unset an inherited meta property, it could be done by specifying no value (example : "twitter:card:") or by preceding the meta property with "unset " (example : "unset dublincore:author:popol").

