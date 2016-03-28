Modulo - *make a multimodal academic publication from simple text files*
==========

![Modulo project in one image](https://raw.githubusercontent.com/robindemourat/modulo/master/specification/assets/modulo-project.png)


Modulo is an application aimed at facilitating the making of media-rich, data-driven and multimodal academic publication projects.

To do so, it turns flatfile contents coming from web platforms into several formats of academic publishing : webtext, pdf document, REST Api,  ...

Contents are written in plain text files (in ``markdown`` and ``bibtex`` syntaxes), and hosted mainly in external flatfile-structured data sources (ftp server, local files, google drive, amazon s3, ...).

Modulo is designed to be a "reader" in the first place, though its structure allows for connecting it to a content-edition application.

# Caution : Work In Progress

Modulo is being rewritten at the moment as a source-agnostic, annotation-ready, and editor-ready, [universal javascript application](https://medium.com/@mjackson/universal-javascript-4761051b7ae9).

See an implementation of the first, front-end only, version of Modulo there : http://modesofexistence.org/anomalies/ (source there : https://github.com/robindemourat/clues-anomaly-understanding )

If you're curious about what's going on, [check here the in-progress modulo v2 working documents about markdown specification, contents structures and technical choices](https://github.com/robindemourat/modulo/tree/master/specification).


# Presentation

Modulo is aimed at being an interface and rendering engine to multimodal academic publishing projects - built with flexibility, extensibility and lightness as core values.

Project's goal is to simplify and democratize the possibility of setting up a scholarly textual document accompanied with various interactive/multimodal figures (whether they be embedded from web services, or interactive figures presenting data such as timelines, graphs, interviews, ...).

To do so, the tool reads as input some simple text files (and possibly annotation attached to them through tierce sources such as Disqus), and produces as output a browsable, printable, indexing-friendly document.

# Design goals

Contextualization-related goals :

1. **feature all the richness of the web while respecting academic needs** : first of all, Modulo's main goal is to allow users to take the maximum advantage of the web as input (in terms of data sources, media, ...) and as output (as printable webpage, API-served data, embedded widget, mobile-friendly app, ...) - while encouraging writers to document and design the use of all of this richness according to academic rigorousness standards
1. **resources+contextualizations mental model** : one of the core intellectual endeavours at the origin of Modulo is a reflection about the future of the "editorial figure" notion in digital publishing environments. In order to reflect on this issue through practice, Modulo proposes to reframe "figures" as the *contextualization* of one or several given *resources*  through a set of parameters called a *contextualizer*. Following this model and giving an example, a data visualization inserted inside the core content will be written as the contextualization of a data source featuring temporal data through a *timeline* contextualizer
1. **standard syntaxes extension** : Modulo writing syntax tries to ground on existing standard specifications (e.g. : ``bibtex``, ``markdown``) and to extend them for the sake of the specific needs of multimodal academic publication projects

Flexibility-related goals :

1. **source agnostic** : Modulo is designed with freedom as one of its main core values : it should be possible to "plugin" the app into a various array of data sources (Google Drive, Dropbox, Github, Amazon S3, ftp server, local data, ...) with the same results in terms of outputs. Distinct storage origins can be specified for main contents, assets (images, videos, data ...) and annotations (e.g. : Disqus)
1. **non-captive data** : it should be possible to read and write the contents written with/for Modulo independently from it
1. **modulo users' permissions are source users' permissions** : Modulo should do nothing but to allow the display of contents according to source's own permission settings. If a section's source is publicly readable, it should be publicly readable in its modulo version. If a section's source is modifiable by Marc, it should be (in future versions of the tool including an editor) editable by Marc in Modulo's editor after logging in through source' authentication protocol. *Modulo should take no responsability at all in permissions and just be a pure interface to the sources' own permission settings.*

Fluidity-related goals :

1. **built for indexation** : Modulo should render all of its contents (even the "interactive" ones) to indexing agents and javascript-less browsers. It should cover as metadata domains as possible, and be as precise as possible regarding metadata. It should use ``schema`` micro-format specification for semantically describing html contents when possible.
1. **built for fetching, exporting and embedding** : a modulo document should be highly exploitable and sharable from other places of the web : it should be possible to embed/comment/quote all kinds of its contents, and it should be possible access all kinds of these contents through a public API
1. **built for multiple supports** : everything written in a Modulo document should be by default viewable both on a screen and on paper (even "interactive" figures that should have a meaningfull initial visual state).

Experience-related goals :

1. **outside web should be always accessible but at least 2 clicks away** : Modulo cares about readers' attention, and for that matters, all external links and resources should be displayed inside document's interface in the first place
1. **orientation-driven** : modulo's interface goal is to take advantage of the hypertextuality and knowledge-linking capabilities of digital content while always focusing on not getting the reader (and maybe later, the writer) lost. This is seeked by emphasizing strongly a linear, hierarchical mental model of the document accessible at all times
2. **built for reuse, citation and quoting** : it should be extremely easy to precisely quote a part of a Modulo document, and to retrieve cited sources from any bibliography management software (like Zotero)

---

To commit to these goals, Modulo grounds on existing description languages that it links together to allow for a meaningful experience of richly referenced and connected documents. 

**Bibtex** is used for **all** resources descriptions, including convential bibliographical records AND images, links, data sources, etc. descriptions.

**Markdown, and more specifically its book-oriented specification, Markua**, is used as basis for writing the main body of the text.

On top of its peculiar writing system, Modulo proposes a neatly designed interface to display scholarly document. It is supposed to be desktop/mobile/print friendly - and is highly customizable through css and javascript additional components proposition.

---

Project's name comes from the desire of contributing to digital academic publishing landscape by proposing a lightweight and extensible system for rich digital scholarly publishing. Besides, it is a reference to Lecorbusier's [modulor](https://en.wikipedia.org/wiki/Modulor), a set of proportions aimed at adapting industrial means of architectural building to human scale : same goal of bridging industrial and personal scales here, the industrial being the huge digital infrastructures being built right now in the academic world.

## (Previous version) existing features

* index auto-building and navigation system
* complex interactions with interactive elements, through scroll and click
* diversely extended markdown language
* fully responsive academic document design (desktop/tablet/mobile/print)

Current available figure modules (embedded contents) :
* google spreadsheet table
* vimeo
* youtube
* tableau
* twitter
* pdf embed
* slideshare
* image gallery
* iframe embed

Available figure modules for specific data :
* transcripted interview
* multi-dimensional timeline
* sankey diagram
* network graph

