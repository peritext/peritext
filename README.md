[WIP] Peritext - *a contextualization-oriented academic publishing engine*
==========

[![Build Status](https://travis-ci.org/peritext/peritext.svg?branch=master)](https://travis-ci.org/peritext/peritext) [![Documentation coverage](https://rawgithub.com/peritext/peritext/master/doc/badge.svg)](https://github.com/peritext/peritext/tree/master/doc) [![Coverage Status](https://coveralls.io/repos/github/peritext/peritext/badge.svg?branch=master)](https://coveralls.io/github/peritext/peritext?branch=master)

Peritext is a javascript/node library aimed at facilitating the making of media-rich, data-driven and multimodal academic publication projects.

# The RCC model

The core of the library is centered on the manipulation of a specific data abstraction of academic documents, which is labeled the *Resource-Contexutalization-Contextualizer Model*.

The *Resource-Contextualization-Contextualizer Model* is a way to think of an academic document as an entity composed by ``contents``, ``resources``, ``contextualizations`` and ``contextualizers``:

* ``Contents`` are the main linear, textual, narrative contents of a document. These are sections, titles, paragraphs, ... written by the author and ordered in a specific sequence. In peritext, they come written in regular ``markdown`` syntax
* ``Resources`` are **all the exogeneous "things" mentionned by the author**. These can be bibliographical records (of books, articles, ...), media descriptions (images, videos), data sources (as files, as url, ...), and even entities (persons, places, organization, concepts, ...). All the resources are described in the same logic, and written in ``bibTeX`` syntax
* ``Contextualizations`` are statements written by the author about **how to contextualize a specific resource at a specific point of her text, in a specific way.** For example, if one uses in her document *dataset* about some phenomenon, she will be able to *contextualize* this resource as a ``table`` in her first chapter, then later as a ``timeline``, then as a `map`, or even as a simple ``academic reference`` contextualization. All these forms are specific contextualizations types of the same resource.
* ``Contextualizers`` are **sets of contextualization parameters** describing how to contextualize a resource. They can be described explicit to be reused along a given document, for performing ``data travelling`` operations for instance ; or they can be totally implicit and infered from a specific contextualization statement.

# Why is this model useful ?

* it allows to **consistently handle all the kinds of "things" that populate nowadays' scholarly argumentation processes** with a simple and extendable model
* it **enforces a sense of rigourousness** by the author while referencing resources. Authors cannot mention something if they don't describe it first.
* it allows to **serve both sequential reading practices, and relation-based reading practices** : you can use a peritext document representation to produce a "text" decorated with contextualizations, like a traditional print-like artifact. But you can also use it to display a resource list decorated with their textual "implementation" (like interactive glossaries, reference lists, tables of figures, ...), or a network of elements, and so on.
* it allows to put a great attention to the non-textual elements that compose a publication. Contextualizers allow to build **parametric illustrations** descriptions that describe very precisely how to present her resources, and to perform "**data travelling**" argumentation by sequentially showing the same resources with different parameters.
* it **allows users to author high-quality documents accross several media**, while not avoiding to put a great attention into specific designs (through css styling)
* it **facilitates SEO and indexation**, as peritext outputs are highly enriched in ``dublincore``  & ``opengraph`` metadata, and ``schema`` and ``RDFa`` microdata at the level of tiniest elements.

# What use cases is this model useful for ?

* **multi-supports** publication: write once, publish everywhere
* **media-related or interview-related** research publishing: quote timecoded specific portions of recorded media. Display subtitles/transcriptions if you have them. See media thumbnails in static outputs.
* **data-related** research publishing: show your data through different angles. Discuss it, argument with it, travel inside it, make it live through your textual argumentation.
* **web-related** research publishing: quote tweets, webpages, search engine results. See the publication evolve with time for dynamic outputs.
* **design-related** publishing: show your productions and process more comprehensively in academic publications. Take care of your publication's design through fine-grained custom css, while staying inside academic standards.

---

# The library

To allow an authoring process based on the RCC Model, Peritext library is a  set of modules whose core is centered on **converting the javascript representation of *flatfile-represented contents* to the javascript representation of a *context-oriented academic document*, and vice versa**.

Contents are supposed to be written in plain text files (in ``markdown`` for narratives and ``bibtex`` for resources description) and hosted in flatfile-represented data sources (ftp server, local hard drive/server files, google drive, amazon s3, ...). The relation to these datasources is handled via *connectors* plugins.

The choice of flat-file representation for the data source is motivated by the desire of providing a very flexible and light way to produce documents, but it could be as well connected to a more traditionnal database.

Contextualizations are handled through *contextualizers* plugins (written in javascript and react), which interpret the RCC representation of a document to produce a specific react/html representation. They can be customized and overriden by specific applications. They are all supposed to handle both static (e.g. print) outputs and dynamic (e.g. web) outputs.

Outputs can be either files (`pdf`, `xml`, `html`, ...) handled by ``exporters`` plugins, or a javascript representation to manipulate in another application to produce APIs, webapps, content editors, ... [check lectio app to see an example of read-only utilisation of Peritext](https://github.com/peritext/peritext-lectio).

# Caution : Work In Progress

Peritext is in its really early phase of existence : some modules APIs should change a lot in the near future, test coverage is poor, contextualization components are minimal, and exporters too. Use it at your own risk, but more than that, feel free to give a hand to the project !
