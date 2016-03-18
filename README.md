Modulo - *make a multimodal academic publication from simple text files*
==========


# Caution : Work In Progress

Modulo is being rewritten at the moment as a flat-file node.js application.
See an implementation of the first, front-end only, version of Dicto here : http://modesofexistence.org/anomalies/ (source : https://github.com/robindemourat/clues-anomaly-understanding )


If you're curious on what's going on, [check here the in-progress modulo v2 working documents about markdown specification, contents structures and technical choices](https://github.com/robindemourat/modulo/tree/master/specification).


# Presentation

Modulo is a rendering engine for multimodal academic publishing projects - built with flexibility, extensibility and lightness as core values.

Project's goal is to simplify and democratize the possibility of setting up a scholarly textual document accompanied with various interactive/multimodal figures (whether they be embedded from web services, or interactive figures presenting data such as timelines, graphs, or interviews).

To do so, the tool reads as input some files written in markdown, and serves as output a browsable, printable, indexing-friendly document.

Modulo uses the flexibility of markdown to develop an extensible description language that can be adapted to different kinds of interactive publishing needs - or even extended by programming-skilled scholars and collaborators.

Then, it proposes a neatly designed interface to display the documents. However, everything of the front-end interface is supposed to be highly customizable and adaptable to specific publishing needs.

Project's name comes from the desire of contributing to digital academic publishing landscape by proposing a lightweight extensible system of web contents description. Besides, it is a reference to Lecorbusier's [modulor](https://en.wikipedia.org/wiki/Modulor), a set of proportions aimed at adapting industrial means of architectural building to human scale : same goal of bridging industrial and personal scales here, the industrial being the huge digital infrastructures being built right now in the academic world.

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

