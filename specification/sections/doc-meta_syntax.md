Modulo documentation | metadata files syntax | WIP
=================


# Global considerations

## Targets : root section and children sections

Metadata is represented by ``metadata.bib`` files which can target :
* the root of the document
* a section of the document

## Metadata types : private and public purposes

Metadata entries can deal with two types of information :
* public metadata : title, author, ... basically used to populate the ``head`` tag of html pages, or to generate templates, it deals with information about the contents of the section being displayed
* private metadata : deals with sections identification, ordering and hierarchization - see below

## Metadata vertical and lateral propagation

Metadata propagates in a Modulo document in two ways :
* vertically (i.e. hierarchically) : from root to children, to the possible children of these children, and so on
* laterally : from one metadata domain to another (e.g. from dublincore metadata to twitter metadata)


# Syntax pattern : bibTeX

## What is BibTex

Here is a bibTeX definition of a book chapter :

```
@inbook{inbook,
  author       = {Peter Eston}, 
  title        = {The title of the work},
  chapter      = 8,
  pages        = {201-213},
  publisher    = {The name of the publisher},
  year         = 1993,
  volume       = 4,
  series       = 5,
  address      = {The address of the publisher},
  edition      = 3,
  month        = 7,
  note         = {An optional note}
}
```

And of a periodical's article :

```
@incollection{incollection,
  author       = {Peter Farindon}, 
  title        = {The title of the work},
  booktitle    = {The title of the book},
  publisher    = {The name of the publisher},
  year         = 1993,
  editor       = {The editor},
  volume       = 4,
  series       = 5,
  chapter      = 8,
  pages        = {201-213},
  address      = {The address of the publisher},
  edition      = 3,
  month        = 7,
  note         = {An optional note}
}
```

## Modulo metadata BibTeX

Modulo uses the BibTeX syntax to describe its documents.
It uses a loosely and "tolerant" definition of BibTeX, accepting zotero-flavoured BibTeX, and adding its own specificities to the format :

```
Strict BibTeX [key, value] syntax is as following :

For a number :
  key = value
For a string :
  key = {value}

Tolerant bibtext also accepts these notations :
  key = 'value'
  key = "value"
  key = "va'l'ue"
  key = {va{l}ue}
  key = "val{u}e"

```

The first part of a BibTeX object (eg ``@incollection``) describes the type of the section being written. 

Concerning modulo metadata, a modulo section metadata will always be recognized by the fact it is preceded by ``modulo`` :

```
@incollection{mycollection} //resource, not modulo metadata
@moduloincollection{mycollection} //metadata, because it begins with "modulo"
```

The second just after the opening bracket (eg ``incollection``) would describe a ``cite_key`` in regular BibTeX : **in Modulo the citeKey is central, and should be also used as the slug of this section, usable to reference it in other content sections or for other purposes** - slug is an internal metadata. **All citeKeys should be unique along a whole document**.

Then follows a collection of key+value pairs, that Modulo respects but also extends for its own purposes.

Modulo follows and extends BibTex syntax to other types following a systematic syntax featuring three different information pieces :

*  the domain of the meta property (example: "general", "dublincore", "twitter", ...)
* the key of the property to specify (example: "title")
* the value of the property to specifiy


```
[domain of the property]__[key of the property]

//Note that there are two underscores ('_')

This would give us for example as a property name :
twitter_title

And in context :

@inbook{chapter_slug,
    //....

    twitter_title = "My chapter",

    //....

}
```

# Metadata types and propagation

## Internal metadata : Sections' organization and hierarchy

There is a specific domain for metadata which deals with the organization of the sections - we call them internal metadata.

### type property

Each bibtex starts with the specification of a type of item.

In Modulo only the root metadata should mandatorily comply to established BibTeX types, so that it should be either :
* ``@book``
* ``@proceedings``
* ...

```
@modulobook
```

By default, subparts should be typed as ``section`` and their type should be derived from parent (if parent is ``@book``, children section will be ``@bookchapter``, and so on ...).

However it should be possible to not use the ``section`` feature (allowing to build, for instance, a collection of several ``@book`` with Dicto).

* a metadata property is recognized by the fact that its type begins by ``@modulo_``
* the word after ``@modulo_`` belongs to traditional bibTeX typology


There is a special type used for inheritance : 
* ``@modulo_section`` - when using this one, section type is guessed from an inheritance system

There are several types that are proposed that don't belong to ``BibTex`` standard typology :
* ``inherits`` : occurs when a section is specified as the child of an item which should not have citation child (for instance : an article)
* ``collection`` : typically : a books collection, a journal issue, etc ...


The model of accepted types should contain therefore the type of possible children ``@modulosection`` and the default type to apply when root is a ``@modulosection``

### The case of authors

Names definition in BibTeX are a mess in practice.
The choice is made to handle as much as possible of them.

Accepted inputs for authors :

```
{Martin}, Julia; Coleman
{Jakubowicz}, Andrew
{Charalambos}, D. Aliprantis and Kim C. {Border}
{Martin}, Julia; Coleman
{Jakubowicz}, Andrew
{Charalambos}, D. Aliprantis and Kim C. {Border}
Maskin, Eric S.
{Martin}, Julia; Coleman
{Jakubowicz}, Andrew
{Charalambos}, D. Aliprantis and Kim C. {Border}
Maskin, Eric S.
{Martin}, Julia; Coleman
{Jakubowicz}, Andrew
{Charalambos}, D. Aliprantis and Kim C. {Border}
```

### citeKey property

The citeKey of metadata object should be unique. To decide for app logic :

* throw error 
* throw warning and overwrite choice 
* automatic rename

### Organization properties

Let's consider the following print document summary :

```
---Forewords
---Introduction
--Part 1
-----Chapter 1
-----Chapter 2
--Part 2
-----Chapter 3
-----Chapter 4
---Conclusion
```


Content pieces such as 'Forewords' or 'Introduction' have no "parents", though they don't have the same level of importance or generality than Part 1 or 2.

This demonstrate that when we deal with a text organization everything can not be fit in a tree-like structure. Relevant organization is rather defined by the **sequentiality** of elements.
But sequentiality does not suffice to assert that 'Introduction' is less general than 'Part 1' (information that could graphically be coded as a larger left-gutter distance). We therefore need a **generality** parameter for structuring information.
To finish with, we have nevertheless **inclusion or belonging** informations, that are distinct from the previous : Chapter 1 *belongs* to the Part 1, and is affected by it in a number of ways - for instance, it would share the same keywords, maybe the same author(s), or the same typographic setting, etc.

Therefore, there are four types of organizational information that can be given to a Modulo's section :
* **identification information** : *this section will be identified by this expression*
* **sequentiality information** : *this section follows that other section*
* **generality information** : *this section is of that importance regarding its parent section* (think of html titles h1, h2, h3, ...)
* **belonging information** : *this section is the children section of that other section*

Here is a list of organization metadata properties derived from this typology :
* ``after`` : after [that section]'s slug
* ``generalityLevel`` : importance level of the section (computed by addition with the hierarchicalLevel of parent)
* ``parent`` : child of [that section] slug

E.g : 
```bibtex

@modulosection{chapter2,
  title : "Chapter 2",
  after : "chapter1",
  parent : "part1"
}

```


*Personal note about that :*
*This variety is provided in order to allow for a maximum flexibility in terms of organization of editorial content. Most text's digital representation paradigms stand between two extreme designs : considering a text as an unordered and linear sequence of characters, or considering it as a tree structure composed of parts, subparts, sub-subparts, etc. (e.g. : xml and other sgml-derivated formats). A third, more recent family abolishes completely the linearity or hierarchization of contents and deals with a set of small content elements handled as a flat graph structure in which 'paths' are specified to build on-the-fly linear experiences (e.g. Scalar). It seems to me a bit hard and too bold for intuitively building stories. With this part of Modulo's design I just want to "remediate", in a humble and analogy-minded manner, all the possibilities of print documents structures - and then take advantage of the potential of the digital in terms of reuse and navigation inside generated contents.*


#### WIP points & open questions

**WIP : Logical conflicts between ordering and belonging.** *What if, on one hand, I specify the ordering of an element by declaring a preceding element at begining of sections list, and on the other hand I specify as parent an element which is in a totally different part of the list of sections, like in the end ?*

This could not happen in a print document, but is logically conceivable (having "disseminated kindred" dispersed along a linear sequence that does not follows hierarchical trees). For now I think concerns should be separated : hierarchy deals mainly with parent-to-children propagation of metadata and plugins (see below), and ordering deals mainly with display of the document's story or argument. So **that should be logically possible** but, later on, **that displayed as an unusual practice** (with warnings and stuff) by the editor's UI, somehow.

**WIP : Question**. *Should hierarchy information be inherited from the previous section if previous section is specified ? (this would avoid to have to declare the parent section for each subsection)*

I don't think so. **Parent metadata should be declared explicitely for each section.**


### Property vertical propagation

By default, all contentRoot's metaproperties are disseminated to the children parts.

*So for instance, if I specify at the root's metadata file that the author is Paolo, all children sections will feature metadata's author as Paolo, if not specified otherwise.*

Another case of propagation is when a section features a 'parent' metadata property. In this case the inheritance tree is nested, and the element inherits from its parent's metadata (which therefore will have to be parsed first). *If a section has as a parent another section which feature Jean as its author, it will have itself Jean as author.*


### Breaking vertical propagation/inheritance

There should be two ways to make a children element having a different metaproperty than its inherited one :
* set a new value for this metaproperty
* unset the metaproperty

To unset an inherited meta property, it could be done by specifying no value (example : ``twitter_card : ""``).

# External metadata and lateral propagation

## External metadata models definition

External metadata properties are characterized by several information :
* the domain they belong to (Dublin Core, Twitter, OpenGraph, ...)
* the key they expose (title, authors, ...)
* whether their key calls for a single value or possibly several
* whether they should be unique or could be several (and then merged into a single array)
* possibly in which sectionTypes they are applicable
* if they are required for a given sectionType (book, article, ...)
* a description of the metadata entry
* their html insertion model (how to feature them inside)
* the other properties to which they propagate (in the form of ``domain_key`` or ``key`` if domain is ``general``)

A metadata model entry features a template that specified how to represent it in the ``<head>`` of HTML documents - so for instance (using es2015's string templating feature) :

```
'<meta name="DC.subject" content="${value}" />'
```

Which gives us for a property description :
```
[key] : {
  "description" : "", // for doc, editor UI, etc.
  "valueType" : "", // string | stringArray | ...
  "unique" : true, // required - what to do if there is this key several times in a metadata object ?
  "headTemplate" : "", //html template
  "requiredForTypes" : [],
  "applicableInTypes" : [],
  "propagatesTo" : []
}
```


## Properties lateral propagation

Modulo is supposed to be smart and **disseminate similar metadata accross metadata domains** if not specified otherwise. For example, the "title" property should automatically spread to "dublincore:title", "og:title", "twitter:title" ... if not specified otherwise later on in the metadata file.

See source's ``src/core/models/metadataModel.json`` to see the WIP lateral propagation system.


## Todolist

### general properties

* title
* abstract
* keyword
* author
* date
* address
* chapter
* editor
* edition
* howpublished
* institution
* journal
* organization
* pages
* publisher
* school
* series
* type
* volume
* language
* language

### Dublincore properties

* title
* creator
* subject
* description
* publisher
* contributors
* date
* type
* format
* identifier
* source
* language
* rights
* dcterms.available - The date the resource became available.
* dcterms.created - The creation date of the resource.
* dcterms.dateAccepted - The date the resource was accepted.
* dcterms.submitted - The date the resource was submitted.
* dcterms.issued - The publication date of a resource.



### OpenGraph properties (minimal)

* title
* description
* type
* image
* url

### Twitter properties

* card
* site
* siteId
* creator
* creatorId
* description
* title
* image
