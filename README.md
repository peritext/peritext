[WIP] Peritext - *a contextualization-oriented academic publishing engine*
==========

[![Build Status](https://travis-ci.org/peritext/peritext.svg?branch=master)](https://travis-ci.org/peritext/peritext) [![Documentation coverage](https://rawgithub.com/peritext/peritext/master/doc/badge.svg)](https://github.com/peritext/peritext/tree/master/doc) [![Coverage Status](https://coveralls.io/repos/github/peritext/peritext/badge.svg?branch=master)](https://coveralls.io/github/peritext/peritext?branch=master)

Peritext is a javascript/node library aimed at facilitating the making of media-rich, data-driven and multimodal academic publication projects.

# !!!! Caution : Work In Progress !!!

Peritext is in its really early phase of existence : some modules APIs should change a lot in the near future, test coverage is poor, contextualization components are minimal, and exporters too. Use it at your own risk, but more than that, feel free to give a hand to the project !

![Peritext header](https://raw.githubusercontent.com/robindemourat/peritext/master/specification/assets/peritext-header.png)

# The RCC model

The core of the library is centered on the manipulation of a specific data abstraction of multimodal scholarly documents, which is labeled the *Resource-Contexutalization-Contextualizer Model*.

The *Resource-Contextualization-Contextualizer Model* is a way to model an academic document as an entity composed of ``contents``, ``resources``, ``contextualizations`` and ``contextualizers``:

* ``Contents`` are the main textual, narrative contents of a document. These are a linear succession of sections, titles, paragraphs, ... written by the author and ordered in a specific sequence. In peritext, they are presumed to be written in regular ``markdown`` syntax, directly by the author or translated as such from a wysiwig editor
* ``Resources`` are **all the external "entities" mentionned by the author**. These can be bibliographical records (of books, articles, ...), media descriptions (images, videos), data sources (as files, as url, ...), or even entities (persons, places, organization, concepts, ...). All the resources are described with the ``bibTeX`` syntax, a json-like way of describing entities
* ``Contextualizations`` are statements written by the author *within contents* about **how to contextualize a specific resource at a specific point of her text, in a specific way.** For example, let's say one uses in her document some *dataset* about some phenomenon (*the resource*). She will be able to *contextualize* this resource in several ways along its contents : as a ``table`` in her first chapter, then later as a ``timeline``, then as a `map`, then as a simple ``academic reference`` contextualization in the end of her text. All of these are specific *contextualizations types* of the same resource.
* ``Contextualizers``, to finish with, are **sets of contextualization parameters** describing how to contextualize a resource. Contextualizers can be a one-shot, partially or completely implicit set of parameters described in contents at the time of contextualization. But they can also be described explicitly in order to be reused several times along a given document. In such a scenario, the same set of parameters can be reused to compare several resources with the same contextualization parameters (e.g. visualizing different datasets with the same visualization parameters) ; explicit contextualizers can also be used as a parameters basis to be overriden locally along several contextualizations (e.g. : displaying along the text a series of *timeline* contextualizations that look globally the same but show different periods of time)

![Peritext resource model in one image](https://raw.githubusercontent.com/robindemourat/peritext/master/specification/assets/peritext-document-model.png)

# Why is this model useful ?

* it allows to **consistently handle all the kinds of "entities" that populate nowadays' scholarly argumentation processes** with a simple and extendable model that does not preempt the way they should be presented in a document.
* as no external element can be used in contents without being previously described as a resource, it **enforces a sense of rigourousness** by the author while referencing documents, datasets and so on. Authors cannot mention something if they don't describe its metadata first.
* it allows to **serve both sequential reading practices, and "slice-oriented" reading practices** : you can use a peritext document representation to produce a text populated with contextualizations. But you can also use it to display the same document from the point of view of resources or contextualizations, showing for each their related textual "contexts" (think of interactive glossaries, reference lists/bibliographies, tables of figures, ...).
* it allows to put a great deal of attention in the non-textual elements that compose a publication. Contextualizers allow to build **parametric illustrations** that describe very precisely how to present her resources, and to perform "**data travelling**" argumentation by sequentially showing the same resources with different angles and display parameters.
* it **allows users to author high-quality documents accross several media**, while not avoiding to put a great attention into specific designs : **peritext allows to finely style output documents with css3/@paged stylesheets**
* it **facilitates SEO and indexation**, as peritext outputs are highly enriched in ``dublincore``  & ``opengraph`` metadata at the views level, and ``schema`` and ``RDFa`` microdata at the level of specific elements (e.g. : if you talk about a person in your document, it will be micro-encoded as a person so that an indexing robot recognizes that your document deals with this person).

# What use cases is this model useful for ?

* **multi-supports** publication: write once, publish everywhere
* **media-related or interview-related** research publishing: quote timecoded specific portions of recorded media. Display subtitles/transcriptions if you have them. See media thumbnails in static outputs.
* **data-related** research publishing: show your data through different angles. Discuss it, argument with it, travel inside it, make it live through your textual argumentation.
* **web-related** research publishing: quote tweets, webpages, search engine results. See the publication evolve with time for dynamic outputs.
* **design-related** publishing: take care of your publication's design through fine-grained custom css, while staying inside academic standards.

---

# The library

To allow an authoring process based on the RCC Model, Peritext library is a  set of modules whose core is centered on **converting the javascript representation of *flatfile-structured contents* to the javascript representation of a *RCC document*, and vice versa**.

Peritext set of modules handles conversions between several representations of a document that could be represented as following :

![Peritext resource model in one image](https://raw.githubusercontent.com/robindemourat/peritext/master/specification/assets/peritext-modules.png)

Each conversion step correspond to specific peritext modules. Let's present them quickly.

## (filesystem data<-->filesystem representation) Peritext connectors

Peritext contents are assumed to be written in plain text files (in ``markdown`` for narratives and ``bibtex`` for resources description) and hosted in flatfile-represented data sources (ftp server, local hard drive/server files, google drive, amazon s3, ...). 

The relation to these datasources is handled via *connectors* plugins that provide a consistant API for transactions with these sources. *Connectors* are the native entrypoint and exitpoint of working with peritext documents.

The choice of flat-file representation for the data source is motivated by the desire to provide a very flexible and light way to produce academic documents (as opposed to "big platforms"), but it could be as well connected to a more traditionnal database by not using peritext connectors (WIP).

## (filesystem representation<-->abstract rcc document representation) Peritext core

Peritext core modules are about converting a representation of flat-file contents to a RCC document representation.

The *RCC document representation* js object looks like that :

```js
{
  'forewords': {/*...*/}, // special section for forewords/frontpage of document - see sections data below
  'sections': { // sections composing the document - they are presented in a flat organization, but can specify sequentiality/hierarchy (subparts, ...) indication in their metadata
    'section1': {
      'metadata': { // section metadata in several domains
        'general': {/*...*/},
        'twitter': {/*...*/},
        'dublincore': {/*...*/},
        /*...*/
      }
      'contents': [ // javascript representation of pseudo-DOM tree of contents core
        {
          'type': 'element',
          'tag': 'p',
          'child' : [/*...*/]
        },
        /*...*/
      ]
      'notes': [ // javascript representation of pseudo-DOM tree of contents notes
        {/*...*/},
        /*...*/
      ]
      'contextualizations': ['cont1', 'cont2'], // list of involved contextualizations (sugar)
      'customizers' : {/*...*/} // section-specific css stylesheets
    },
    'section2': {/*...*/}
  },

  'summary': ['section1', 'section2'], // linear order of sections
  'resources': { // resources involved in the whole document
    'resource1': {
      'bibType': 'book',
      'id': 'resource1',
      /*...*/
    },
    /*...*/
  },
  'contextualizations': { // contextualizations involved in the whole document
    'cont1': {
      'bibType': 'contextualization',
      'id': 'cont1',
      'resources': ['resource1'],
      /*...*/
    }
    'cont2': {/*...*/}
  }
  'contextualizers': { // contextualizers involved in the whole document
    'cont1': {
      /*...*/
    },
    'explicit-contexutalizer': {
      /*...*/
    }
  } 
}
```

Note that contents are represented as a *pseudo-DOM* javascript representation, which is very similar to the output of `html2json` library (used as a basis in the process of conversion).

## (abstract rcc document representation <-> output-specific rcc document representation) peritext contextualizers

Peritext handles the conversion of an abstract RCC representation to output-specific document representations. Output is defined by a type of output (either print-like or web-like) and a set of organization-related rendering parameters (such as: where to put the notes ? at what level to compute bibliography (whole document/chapters) ? ...).

This step is done through *contextualizers* plugins that transform the pseudo-dom representation of sections' contents to pseudo-dom output-specific representations. For each contextualization in the document, the related contextualizer plugin is called : it takes the previous document and returns an updated document in which the contextualization has been resolved. 

For instance, for the `webpage` contextualizer plugin, inputting a document which contains a *website contextualization* will result : 

* for print-like outputs, in a document in which a website's screenshot figure representation has been added, 
* for web-like outputs, in a document in which an iframe figure representation has been added

Please note that at this point though, document representation is still a plain javascript object representation.

## (output-specific rcc document representation <-> outputs) renderers, exporters and lib. getters/setters

*Contextualizers* plugins also provide *react* components to compose static or dynamic html representations. They can be used in an app, or they can be used by *renderers* plugins that produce usable representations of contents for outputs (e.g. static html). Contextualizers components can be customized or overriden by specific applications. 

Ideally the library thrives to eventually support an ecosystem approach of contextualizers, but all contextualizers should handle both static (e.g. print) outputs and dynamic (e.g. web) outputs.

Eventually, Peritext flexibly handles outputing academic documents to real outputs. 

`exporters` take as argument a representation served by `renderers` (e.g. static html) and output a file (`pdf`, `xml`, `html`, ...).

For uses of Peritext as a library in web applications, it finally provides a set of `getters` and `setters` functions that facilitate working with ``RCC document representation`` objects in applications.

[Check outputs examples (WIP!)](https://github.com/peritext/peritext/blob/master/examples/phdThesis/output/les_formats.pdf)

[Check lectio app to see an example of read-only utilisation of Peritext as a web library (WIP!)](https://github.com/peritext/peritext-lectio).
