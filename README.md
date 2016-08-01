[WIP] Peritext - *a contextualization-oriented academic publishing engine*
==========

[![Build Status](https://travis-ci.org/peritext/peritext.svg?branch=master)](https://travis-ci.org/peritext/peritext) [![Documentation coverage](https://rawgithub.com/peritext/peritext/master/doc/badge.svg)](https://github.com/peritext/peritext/tree/master/doc) [![Coverage Status](https://coveralls.io/repos/github/peritext/peritext/badge.svg?branch=master)](https://coveralls.io/github/peritext/peritext?branch=master)

Peritext is a javascript/node library aimed at facilitating the making of media-rich, data-driven and multimodal academic publication projects.

# The RCC model

The core of the library is centered on manipulating a specific abstraction of academic documents, which I labeled the *Resource-Contexutalization-Contextualizer Model*.

The *Resource-Contextualization-Contextualizer Model* is a way to think of an academic document as something composed by ``contents``, ``resources``, ``contextualizations`` and ``contextualizers``:

* ``Contents`` are the main linear, textual, contents of a publication. These are sections, titles, paragraphs, ... written by the author and ordered in a specific sequence. In peritext, they come written in regular ``markdown`` syntax
* ``Resources`` are **all the external resources mentionned by the author**. These can be bibliographical records (of books, articles, ...), medias (images, videos), data (as files, as url, ...), and even entities (persons, places, organization, concepts, ...). All the resources are described in the same logic, and written in ``bibTeX`` syntax
* ``Contextualizations`` are statements written by the author about **how to contextualize a specific resource at a specific point of her text, in a specific way.** For example, the same *dataset* resource will be able to be *contextualized* by the author as a ``table``, a ``timeline``, a `map`, or a simple ``academic reference`` contextualization.
* ``Contextualizers`` are **sets of contextualization parameters** describing how to contextualize a resource. They can be explicit set and therefore reused along a given document ; or be taken as basis by specific contextualizations, to perform ``data travelling`` operations for instance ; or they can be totally implicit and infered from a specific contextualization statement.

# Why is this model useful ?

* it allows to **consistently handle all the kinds of "things" that populate nowadays' research argumentations** with a simple and extendable model
* it **enforces a sense of rigourousness** by the author while referencing resources. Authors cannot mention something if they don't describe it first.
* it allows to **serve both sequential reading applications, and non-sequential relation-based reading applications** : you can use a peritext document representation to produce a "text" decorated with contextualizations, like a traditional print-like artifact. But you can also use it to display a resource list decorated with their textual "implementation" (like interactive glossaries, reference lists, tables of figures, ...), or a network of elements, and so on.
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

To allow an authoring process based on the RCC Model, Peritext library is a modular set of modules whose core is centered on **converting the javascript representation of *flatfile contents* to the javascript ``RCC`` representation of a *multimodal academic document*, and vice versa**.

Flatfiles are written in plain text files (in ``markdown`` and ``bibtex`` syntaxes), and hosted in flatfile-structured data sources (ftp server, local hard drive/server files, google drive, amazon s3, ...). The relation to these datasources is handled by *connectors* plugins.

Contextualizations are handled through *contextualizers* plugins (written in javascript and react), that can be customized and overridable by specific applications. They are all supposed to handle both static/print outputs and dynamic/web outputs.

Outputs can be either files (in pdf, xml, html, ... formats) handled by ``exporters`` plugins, or a library to use in another application to produce APIs, webapps, content editors, ...

# Caution : Work In Progress

Peritext is in its really early phase of existence : some modules APIs are inconsistant/overcomplicated and should change a lot in the near future, test coverage is quasi inexistant, contextualization components are minimal, and exporters too. Use it at your own risk, but more than that, feel free to give a hand to the project if you wish !

# Detailed description

Peritext is built with flexibility, extensibility and lightness as core values.

Project's goal is to simplify and democratize the possibility of setting up a scholarly textual document accompanied with various interactive/multimodal figures (whether they be embedded from web services, or interactive figures presenting data such as timelines, graphs, interviews, ...).

To do so, the tool reads as input some simple text files (and possibly annotation attached to them through tierce sources such as Disqus), and produces as output a browsable, printable, indexing-friendly document.

# Design goals

Contextualization-related goals :

1. **feature all the richness of the web while respecting academic needs** : first of all, Peritext's main goal is to allow users to take the maximum advantage of the web as input (in terms of data sources, media, ...) and as output (as printable webpage, API-served data, embedded widget, mobile-friendly app, ...) - while encouraging writers to document and design the use of all of this richness according to academic rigorousness standards
1. **resource(s)+contextualizer=contextualization model** : one of the core intellectual endeavours at the origin of Peritext is a reflection about the future of the "editorial figure" notion in digital publishing environments. In order to reflect on this issue through practice, Peritext proposes to reframe "figures" as the *contextualization* of one or several given *resources*  through a set of parameters called a *contextualizer*. The same contextualizer can be used for displaying several resources (comparing different data sources, for instance), and one resource can be contextualized in a diversity of ways. Following this model and giving an example, a timeline visualization inserted inside the core content would be described as the *contextualization* at one point of the text of a temporal data *resource* through a *contextualizer* describing which column to use as date, which to use as events descriptions and how to display them.
1. **standard syntaxes extension** : Peritext writing syntax tries to ground on existing standard specifications (e.g. : ``bibtex``, ``markdown``) and to extend them for the sake of the specific needs of multimodal academic publication projects. **Bibtex is used for *all* resources, and contextualizers descriptions**, including convential bibliographical records AND images, links, data sources, etc. descriptions. **Markdown is used to write all the linear aspects of the stories displayed inside a document - that is: textual contents and contextualizations assertions.**

Flexibility-related goals :

1. **source agnostic - openess as choice and modularity** : Peritext is designed with freedom as one of its main core values : it should be possible to "plugin" the app into a various array of data sources (Google Drive, Dropbox, Github, Amazon S3, ftp server, local data, ...) with the same results in terms of outputs. Distinct storage origins can be specified for main contents, assets (images, videos, data ...) and annotations (e.g. : Disqus)
1. **non-captive data - openess as autonomy of content** : it should be possible to read and write the contents written with/for Peritext independently from Peritext - nothing of the data should be lost if a user chooses to cease to use the tool
1. **peritext users' permissions are source users' permissions** : *Peritext should take no responsability at all in permissions and just be a pure interface to the sources' own permission settings and authentication process.* Peritext should do nothing but to allow the display or edit contents according to source's own permission settings. If a section's source is publicly readable, it should be publicly readable in its peritext version. If a section's source is modifiable by Marc, it should be (in future versions of the tool including an editor) modifiable by Marc in Peritext's editor after logging in through source' authentication protocol.

Fluidity-related goals :

1. **built for indexation** : Peritext should render all of its contents (even the "interactive" ones) to indexing agents and javascript-less browsers. It should cover as metadata domains as possible, and be as precise as possible regarding metadata. It should use ``schema`` micro-formatting specification for semantically describing html contents when possible.
1. **built for fetching, exporting and embedding** : a peritext document should be highly exploitable and sharable from other places of the web : it should be possible to embed/comment/quote all kinds and scales of its contents, and it should be possible access all kinds and scales of these contents through a public API
1. **built for multiple supports** : everything written in a Peritext document should be by default viewable both on a screen and on a page of paper (even "interactive" figures should have a meaningfull static visual state).

Experience-related goals :

1. **outside web should be always accessible but at least 2 clicks away** : Peritext cares about readers' attention, and for that matters, all external links and resources should be displayed inside document's interface in the first place
1. **linearity-driven** : peritext's interface goal is to take advantage of the hypertextuality and knowledge-linking capabilities of digital content while always focusing on not getting the reader (and maybe later, the writer) lost. This is seeked by emphasizing strongly a linear, hierarchical mental model of the document accessible at all times
2. **built for reuse, citation, and quoting** : it should be extremely easy to precisely quote a part of a Peritext document, and to retrieve document's own metadata and document's cited sources from any bibliography management software (like Zotero)

# History of the project

Peritext is a technology built in the context of my Ph.D. in digital humanities, design & aesthetics, which deals with academic publishing in the humanities.

On an intellectual plan, it is the continuation of a joint reflection conducted about the roles and acceptions of "context" in humanities' academic publishing situations. This reflection was summarized by a 2014 milestone's [conference communication](https://www.academia.edu/9062107/AIME_opening_the_context_of_a_Humanities_inquiry) that I co-authored with [Donato Ricci](http://www.medialab.sciences-po.fr/fr/people/donato-ricci/).

On a practical plan, the project comes also as the amplification of a previous, very specific, multimodal article experiment, that I participated to as a designer, developper and researcher : http://modesofexistence.org/anomalies/ (source code is there : https://github.com/robindemourat/clues-anomaly-understanding ).

In the frame of my Ph.D., this experiment became first the project of a generic flat-file application engine for generating multimodal publications. Then it became an even more generic technology, aimed at being used as client tool, or as a library in other applications, such as the one I am developping in order to publish my own Ph.D. in multimodal format.

Therefore, the [github peritext organization](https://github.com/peritext) is aimed, on the long term, at progressively hosting the Peritext core library, but also a series of contextualization/connection/exporting plugins, and applications making use of this library in the context of reading and/or authoring multimodal academic contents.

If you're curious about what's going on or want to comment/give a hand to the project, [check here the in-progress peritext v2 working documents about markdown specification, contents structures and technical choices](https://github.com/robindemourat/peritext/tree/master/specification).
