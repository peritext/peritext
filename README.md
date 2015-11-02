Modulo - *make a multimodal academic publication from simple text files*
==========

Modulo is a rendering engine for multimodal publishing projects - built with flexibility, extensibility and lightness as core values.

The goal is to allow for quickly setting up a scholarly textual document accompanied with various interactive/multimodal contents.

To do so, the tool reads as input a simple text file (in markdown) and serves as output a browsable, printable, indexing-friendly document.

Modulo uses the flexibility of markdown to develop an extensible description language that can be adapted to different kinds of interactive publishing needs - or even extended by programming-skilled scholars.

If you plan to use it, remember that this is still :

# WIP

Work in progress, bugs in quantity, use it at your own risks !

# Features

* index auto-building and navigation system
* zotero reference managing
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

# Roadmap

## Global

* turn Modulo to a flatfile system for scholarly documents publishing
* clean html structure and css structure to allow for the specification of custom styles

## Markdown & data system

* add glossary handling
* comply to markua spec [https://leanpub.com/markua/read]
* implement change tracking ? (http://criticmarkup.com/)
* implement comments support (and making ? ) --> http://stackoverflow.com/questions/4823468/store-comments-in-markdown-syntax
* standardize and simplify aside descriptions

## Forthcoming modules

* map
* storify
* heatmap
* ...
