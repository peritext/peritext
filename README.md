[WIP] Peritext - *a contextualization-oriented academic publishing engine*
==========

[![Build Status](https://travis-ci.org/peritext/peritext.svg?branch=master)](https://travis-ci.org/peritext/peritext) [![Documentation coverage](https://rawgithub.com/peritext/peritext/master/doc/badge.svg)](https://github.com/peritext/peritext/tree/master/doc) [![Coverage Status](https://coveralls.io/repos/github/peritext/peritext/badge.svg?branch=master)](https://coveralls.io/github/peritext/peritext?branch=master)

Peritext is a javascript/node library aimed at facilitating the making of media-rich, data-driven and multimodal academic publication projects.

# !!!! Caution : Work In Progress !!!

Peritext is in its really early phase of existence : some modules APIs should change a lot in the near future, test coverage is poor, contextualization components are minimal, and exporters too. Use it at your own risk, but more than that, feel free to give a hand to the project !

# The RCC model

The core of the library is centered on the manipulation of a specific data abstraction of academic documents, which is labeled the *Resource-Contexutalization-Contextualizer Model*.

The *Resource-Contextualization-Contextualizer Model* is a way to think of an academic document as an entity composed by ``contents``, ``resources``, ``contextualizations`` and ``contextualizers``:

* ``Contents`` are the main textual, narrative contents of a document. These are a linear succession of sections, titles, paragraphs, ... written by the author and ordered in a specific sequence. In peritext, they are presumed to be written in regular ``markdown`` syntax, directly by the author or translated as such from a wysiwig editor
* ``Resources`` are **all the exogeneous "things" mentionned by the author**. These can be bibliographical records (of books, articles, ...), media descriptions (images, videos), data sources (as files, as url, ...), or even entities (persons, places, organization, concepts, ...). All the resources are described with the ``bibTeX`` syntax, a json-like way of describing entities
* ``Contextualizations`` are statements written by the author *within contents* about **how to contextualize a specific resource at a specific point of her text, in a specific way.** For example, if one uses in her document some *dataset* about some phenomenon (*the resource*), she will be able to *contextualize* this resource in several ways along its contents : as a ``table`` in her first chapter, then later as a ``timeline``, then as a `map`, or even as a simple ``academic reference`` contextualization in the end of her text. All these forms are specific *contextualizations types* of the same resource.
* ``Contextualizers``, to finish with, are **sets of contextualization parameters** describing how to contextualize a resource. They can be one-shot, partially or completely implicit set of parameters described in contents at the time of contextualization. But they can also be described explicitly in order to be reused along a given document. In such a scenario, the same set of parameters will be able to be reused to compare several resources, or to be used as a basis of parameters overrided along several contextualizations to perform ``data travelling`` operations for instance (e.g. : a series of *timeline* contextualizations that show different periods of time, but keep the same color coding, etc.)

# Why is this model useful ?

* it allows to **consistently handle all the kinds of "things" that populate nowadays' scholarly argumentation processes** with a simple and extendable model that consider all these entities as *resources* and does not preempt the way they should be presented in a document.
* as no external element can be used in contents without being previously described as a resource, it **enforces a sense of rigourousness** by the author while referencing documents, datasets and so on. Authors cannot mention something if they don't describe its metadata first.
* it allows to **serve both sequential reading practices, and "slice-oriented" reading practices** : you can use a peritext document representation to produce a "text" decorated with contextualizations, like a traditional print-like artifact. But you can also use it to display a resources list decorated with their textual "implementation" (like interactive glossaries, reference lists/bibliographies, tables of figures, ...), and so on.
* it allows to put a great deal of attention in the non-textual elements that compose a publication. Contextualizers allow to build **parametric illustrations** descriptions that describe very precisely how to present her resources, and to perform "**data travelling**" argumentation by sequentially showing the same resources with different parameters.
* it **allows users to author high-quality documents accross several media**, while not avoiding to put a great attention into specific designs : **peritext allows to finely style output documents with css3/@paged stylesheet**, that can be output-specific (screens, print)
* it **facilitates SEO and indexation**, as peritext outputs are highly enriched in ``dublincore``  & ``opengraph`` metadata at the views level, and ``schema`` and ``RDFa`` microdata at the level of specific elements (e.g. : if you talk about a person in your document, it will be micro-encoded as a person so that an indexing robot recognizes that your document deals with this person).

# What use cases is this model useful for ?

* **multi-supports** publication: write once, publish everywhere
* **media-related or interview-related** research publishing: quote timecoded specific portions of recorded media. Display subtitles/transcriptions if you have them. See media thumbnails in static outputs.
* **data-related** research publishing: show your data through different angles. Discuss it, argument with it, travel inside it, make it live through your textual argumentation.
* **web-related** research publishing: quote tweets, webpages, search engine results. See the publication evolve with time for dynamic outputs.
* **design-related** publishing: show your productions and process more comprehensively in academic publications. Take care of your publication's design through fine-grained custom css, while staying inside academic standards.

---

# The library

To allow an authoring process based on the RCC Model, Peritext library is a  set of modules whose core is centered on **converting the javascript representation of *flatfile-represented contents* to the javascript representation of a *context-oriented academic document*, and vice versa**.

Peritext set of modules handles two-ways conversions along the several steps of a continuum that we could represent as following :

```
(1) filesystem data <-> (2) filesystem representation <-> (3) abstract rcc document representation <-> (4) output-specific rcc document representation <-> (5) outputs (pdf, static html, epub, ...) and lib. getters/setters
```

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
      'citeKey': 'resource1',
      /*...*/
    },
    /*...*/
  },
  'contextualizations': { // contextualizations involved in the whole document
    'cont1': {
      'bibType': 'contextualization',
      'citeKey': 'cont1',
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

## (abstract rcc document representation <-> output-specific rcc document representation) peritext contextualizers and renderers

Peritext handles the conversion of an abstract RCC representation to output-specific document representations that are specific to static (e.g. print) or dynamic outputs.

This is done through *contextualizers* plugins that transform the pseudo-dom representation of sections' contents to pseudo-dom output-specific representations (e.g. a website block contextualization will result in the insertion of a screenshot figure for print output, but it will result in the insertion of an iframe for dynamic output). At this point though, document representation is still a plain javascript object.

*Contextualizers* plugins also provide *react* components to represent documents as React representations. They can be used genuinely in an app, or used by *renderers* plugins that produce usable representations of contents for outputs (e.g. static html). Contextualizers components can be customized and overriden by specific applications. They are all supposed to handle both static (e.g. print) outputs and dynamic (e.g. web) outputs.

## (output-specific rcc document representation <-> outputs) exporters and lib. getters/setters

Eventually, Peritext flexibly handles outputing academic documents to real outputs.

Outputs can be either files (`pdf`, `xml`, `html`, ...) handled by ``exporters`` plugins, or a javascript representation to manipulate in another application to produce APIs, webapps, content editors, ... for that latter matter, it provides a set of getters and setters functions that facilitate working with ``RCC document representation`` objects.

[Check outputs demo in the examples folder](https://github.com/peritext/peritext/blob/master/examples/phdThesis/output/les_formats.pdf)

[check lectio app to see an example of read-only utilisation of Peritext](https://github.com/peritext/peritext-lectio).
