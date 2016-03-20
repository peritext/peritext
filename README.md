Modulo - *make a multimodal academic publication from simple text files*
==========


# Caution : Work In Progress

Modulo is being rewritten at the moment as a source-agnostic, annotation-ready, and editor-ready, (universal javascript application)[https://medium.com/@mjackson/universal-javascript-4761051b7ae9].

See an implementation of the first, front-end only, version of Modulo there : http://modesofexistence.org/anomalies/ (source there : https://github.com/robindemourat/clues-anomaly-understanding )


If you're curious on what's going on, [check here the in-progress modulo v2 working documents about markdown specification, contents structures and technical choices](https://github.com/robindemourat/modulo/tree/master/specification).


# Presentation

Modulo is aimed at being a rendering engine for multimodal academic publishing projects - built with flexibility, extensibility and lightness as core values.

Project's goal is to simplify and democratize the possibility of setting up a scholarly textual document accompanied with various interactive/multimodal figures (whether they be embedded from web services, or interactive figures presenting data such as timelines, graphs, or interviews).

To do so, the tool reads as input some simple text files, and produces as output a browsable, printable, indexing-friendly document.

Modulo grounds on several design goals :

1. **resources contextualizations** : the core intellectual focus at the root of Modulo is a reflexion about the future of the "editorial figure" notion in digital publishing environments. In order to reflect on this issue through practice, Modulo proposes to reframe "figures" as the encounter between one or several given "resources" and their "contextualization" through editorial design. Following this model and giving an example, a data visualization inserted inside the core content will be written as the contextualization of a data source featuring temporal data (more explanation to come)
1. **source agnostic** : Modulo is designed with freedom as core value : it should be possible to "plugin" the app into a various array of data sources (Google Drive, Dropbox, Github, Amazon S3, ftp server, local data, ...) with the same result. Different storage origins can be specified for main contents, assets (images, videos, data ...) and annotation (e.g. : Disqus)
1. **tool independent** : it should be possible to read the contents written with/for Modulo independently from it
1. **standard extension strategy** : Modulo writing syntax tries to take advantage of existing standards' specification and to extent them for the specific needs of the project
1. **built for indexation** : Modulo should render all of its contents (even the interactive ones) to indexing agents. It should cover as metadata languages as possible, and be as precise as possible. It should use ``schema`` micro-format specification for semantically describing html contents when possible.
1. **built for exporting and embedding** : a modulo document should be highly exploitable and sharable by other places of the web : it should be possible to embed/comment/quote all kinds of its parts, and it should be possible access all kinds of its parts through a public API
2. **built for multiple supports** : everything written in a Modulo document should be by default viewable both on a screen and on paper (even "interactive" figures).

To follow these goals, Modulo grounds on existing description languages that it links together to allow for a meaningful experience of richly referenced and connected documents. 

**Bibtex** is used for **all** resources descriptions, including convential bibliographical records AND images, links, data sources, ... descriptions.

**Markdown, and more specifically its book-oriented specification, Markua**, is used as basis for writing the main body of the text and resource contextualizations (see above).

On top of its peculiar writing system, Modulo proposes a neatly designed interface to display scholarly document. It is supposed to be desktop/mobile/print friendly and is highly customizable through css and javascript additional components proposition.

Project's name comes from the desire of contributing to digital academic publishing landscape by proposing a lightweight and extensible system for rich digital scholarly publishing. Besides, it is a reference to Lecorbusier's [modulor](https://en.wikipedia.org/wiki/Modulor), a set of proportions aimed at adapting industrial means of architectural building to human scale : same goal of bridging industrial and personal scales here, the industrial being the huge digital infrastructures being built right now in the academic world.

## Existing features

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

