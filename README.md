Modulo - *make a multimodal academic publication from simple text files*
==========


# WIP

Modulo is being rewritten at the moment as a flat-file node.js application.
See an implementation of the first version here : https://github.com/robindemourat/clues-anomaly-understanding

The next modulo version will be :

* driven by a node.js flat-file engine
* inspired by more established existing markdown specifications like Markua and Criticmarkup - and more internally consistant in terms of markdown syntax
* editor-friendy for further developpments ...
* featuring an API for third-party use

* cleaner in terms of front-end dev, easily customable in terms of styles (and even interactions) for specific use cases
* more robots-friendly + linked-data friendly


If you're curious on what's going [check here the WIP modulo specification](https://github.com/robindemourat/modulo/tree/master/specification).


# Presentation

Modulo is a rendering engine for multimodal publishing projects - built with flexibility, extensibility and lightness as core values.

The goal is to allow for quickly setting up a scholarly textual document accompanied with various interactive/multimodal contents.

To do so, the tool reads as input a simple text file (in markdown) and serves as output a browsable, printable, indexing-friendly document.

Modulo uses the flexibility of markdown to develop an extensible description language that can be adapted to different kinds of interactive publishing needs - or even extended by programming-skilled scholars.

Then, it propose a neatly designed interface to display the documents. However, everything is supposed to be highly customizable and adaptable to specific needs.


## Features [deprecated]

* index auto-building and navigation system
* complex interactions with interactive elements, through scroll and click
* diversely extended markdown language
* responsive academic document design (desktop/tablet/mobile/print)

Current available modules (external contents) :
* google spreadsheet table
* vimeo
* youtube
* tableau
* twitter
* pdf embed
* slideshare
* image gallery
* iframe embed

Available modules (specific contents) :
* transcripted interview
* multi-dimensional timeline
* sankey diagram
* network graph
