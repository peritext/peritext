Modulo documentation | document syntax (modulo-flavoured markdown) | WIP
=================


Modulo-flavoured markdown is supposed to be built on top of two existing specs, to which it adds some (a minimum) of consistent addings :

* Markua implementation (from : https://leanpub.com/markua/read) for all document-related markdown specifications
* criticmarkup implementation for document revision model

Modulo is conservative as it still priviledges :
* text as the main medium of publishing (all other contents are considered as figures)
* linear top-down scrolling as the main contents navigation practice


[TOC]

# Formatting syntax

## Underline

Markua:

> Underline
To produce underlined text, surround it with ____four underscores____ (producing <u> in HTML). This is gross, but it’s a tradeoff for Markdown compatibility: the one, two and three underscore choices were taken. Thankfully, it’s usually preferable to use italic instead of underline. However, underline is not just a typewriter version of italics. In some languages, underlining serves a distinct, legitimate purpose.


## Strikethrough:

> Strikethrough
To produce strikethrough text, surround it with ~~two tildes~~. This is the same syntax as is used by both GitHub Flavored Markdown and by John Macfarlane’s excellent pandoc.) TODO: ADD STRIKETHROUGH TO LEANPUB!

## Superscript

> Superscript
To produce superscript like the 3 in 53 = 125, surround it with carets like 5^3^ = 125. (This is the same syntax as is used by pandoc.)

## Subscript

> Subscript
To produce subscript like the 2 in H2O, surround it with single tildes like H~2~O.

## Inline specific classes

Model:
```
I'm in the [mood]($classed:cool-stuff)
```

Description:
Allows to specify span specific classes

Translates to:
```
<p>I'm in the <span class="cool-stuff">mood</span></p>


```

## Block specific classes

Model:
```
I'm in the mood
$classed:cool-stuff
```

Description:
Allows to specify span specific classes

Translates to:
```
<p class="cool-stuff">I'm in the mood</p>
```


## Spaces and newlines

Newlines:

> In Markua, a single newline inside a paragraph forces a line break, which produces a <br/> tag in HTML. 


Leading spaces :

> Following exactly one newline, whitespace is preserved. Specifically, a single space produces a single space (a “non-breaking” space, or &nbsp;, in HTML), and a single tab produces four spaces (four “non-breaking” spaces, or &nbsp;&nbsp;&nbsp;&nbsp;, in HTML).
Following two or more newlines (one or more blank lines), whitespace is ignored. So, you can manually indent your paragraphs if you’re used to doing so, and it will have no effect.


# Modulo specific academy-oriented tags

## Footnotes

Model:
```
I'm in the text[#][This is the footnote content]
```

Description:
Indicates a side/footnote in the content

Translates to:
```
<p>I'm in the text<sup>1</sup></p>
...

<p class="footnote">
    <span class="footnote-marker">1</span>
    <span class="footnote-delimitator">.</span>
    <span class="footnote-content">This is the footnote content</span>
</p>

```

## Glossary

Model:
```
I'm talking about [rhetorics]{} //firt version

I'm being [rhetorical]{rhetorics} //second version
```

Description:
Record a word as a rhetorical word.
Without argument, the word is considered as is.
With an argument inside brackets, the word is registered is the atlas with an argument.

Translates to:
```
<p>I'm talking about <span class="glossary-element" term="rhetorics" >rhetorics</span></p>
<p>I'm  being <span class="glossary-element" term="rhetorics" >rhetorical</span></p>
```

## Inline quotes

```
He said "leave me"
```
Should translate to :

```
He said <span class="inline-quote">"leave me"</span>
```


## Referencing, quoting, generating a bibliography

### Specifying the bibliography data with bibText data

Bibliography should be handled with a unique .bib file specified in the metadata of the document, or inlined as a resource.

```bibliography

@book{berry_understanding_2012,
    title = {Understanding {Digital} {Humanities}},
    isbn = {978-0-230-37193-4},
    abstract = {The application of new computational techniques and visualisation technologies in the Arts and Humanities are resulting in fresh approaches and methodologies for the study of new and traditional corpora. This 'computational turn' takes the methods and techniques from computer science to create innovative means of close and distant reading. This book discusses the implications and applications of 'Digital Humanities' and the questions raised when using algorithmic techniques. Key researchers in the field provide a comprehensive introduction to important debates surrounding issues such as the contrast between narrative versus database, pattern-matching versus hermeneutics, and the statistical paradigm versus the data mining paradigm. Also discussed are the new forms of collaboration within the Arts and Humanities that are raised through modular research teams and new organisational structures, as well as techniques for collaborating in an interdisciplinary way.},
    language = {en},
    publisher = {Palgrave Macmillan},
    author = {Berry, David M.},
    month = feb,
    year = {2012},
    keywords = {Computers / Digital Media / General, Computers / Social Aspects / General, Social Science / Media Studies}
}

```

### Inline short citation

Example:
```
As Berry {!berry_understanding_2012,12!} wrote
```

Model:
```
{!bibText_id,page!}
```


Translates to:
```
As Berry <span class="short-citation" id="berry_understanding_2012">(Berry, 2012, p. 12)</span> wrote
```

Note, if quoted content before it should somehow encode in the html content that the quote is from this citation.

### Single reference rendering

Model:
```
{!!bibText id!!}
```

Description:
Full citation of a file

Translates to:
```
<div class="bibliographic-reference">
    Reference in the style you want ...
</div>
```

### Bibliography

Model:
```
[Bibliography:APA|my style|...:all|quoted|additionnal]
```

Description:
Generates a bibliography (just the quoted)

Translates to:
```
<div class="bibliographic-reference">
    Reference in the style you want ...
</div>
<div class="bibliographic-reference">
    Reference in the style you want ...
</div>
<div class="bibliographic-reference">
    Reference in the style you want ...
</div>
```


# Templated metadata calls

Modulo should be able to call metadata-based properties into the document.

Example:
```
[abstract]
```

Translates to:
```
<div class="abstract">
Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fuga eveniet nihil ab consectetur reprehenderit voluptatum ipsum dicta, sed atque. Inventore repudiandae doloribus nam enim modi nemo asperiores voluptatum earum, esse.
</div>
```

(grounding on the "abstract" or "description" metadata)


Forseen templates :

* [authors] --> authors
* [title] --> title + subtitle
* [title_simple] --> title
* [title_complete] --> title, subtitle, authors
* [general_title] --> title of the book/thesis
* [abstract] --> abstract or description


# Resources and figures

## Figures : global logic

Figures are essential to Modulo. They represent all the non-textual arguments of a multimodal publication.

Modulo figures are inspired from the principe of "resource" of markua specification.

Three parameters :
* figure insertion method (primary or secondary)
* type (image, video, carousel, timeline, ...)
* origin (web url or inline description)

### Figure insertion methods

Figures can be inserted as inline links, or block links.

In modulo default front-rendered, primary figures will be triggered through scroll, and secondary figures through click (as a <a> hyperlink).

Syntax :

```
This is a [secondary figure insertion](myResourceCaller)
```


```
![This is a primary figure insertion](myResourceCaller)
```

### Origin

Basically :
*  if resource caller starts with "http" or "/", it is a URL caller
*  else it is a inline resource caller

### Types

Resource type is infered from the resource caller.
If the resource is defined as inline resource, type will be described in it.
Else, modulo should try to guess the type of the resources with the following tests :

* if URL matches with some service (eg : vimeo, youtube, slideshare, ...)
* else by catching a file extension at the end of a caller
    * images (svg, png, jpg)
    * videos (mp4, ogv, ...)

If it fails to determine a resource, it will display a simple link.


All figure types come in two declinations : single item or item array (gallery, iframes collection, tweets collections, ...).
These are recognized by catching ',' in the ressource call. 


## Modulo figures calls typology

### inferences-from-url

If specified as an inline link, will be added after the current block as a figure.secondary-figure;

If specified on a single line, will be added as a figure.primary-figure

Link can be followed by {} containing key:value comma-separated addings such as figure title, figure caption, figure background, ...

Vimeo :

```
As we can see in this [vimeo video](https://vimeo.com/129051743)

![A cool video](https://vimeo.com/129051743)
```

Youtube :

```
As we can see in this [vimeo video](https://www.youtube.com/watch?v=G5OicZrhkHg)

![A cool video](https://www.youtube.com/watch?v=G5OicZrhkHg)
```

Carrousel :

```
As we can see in [these images](/data/images/1.png,/data/images/2.png,/data/images/3.png)

![Check this carrousel](/data/images/1.png,/data/images/2.png,/data/images/3.png)
```

Tweet :

```
![An enlightening tweet](https://twitter.com/Strabic/status/565086840370528256)
```


Todo : storify

Slideshare :

```
![An enlightening slide](http://fr.slideshare.net/slideshow/embed_code/key/rGQLsk1BvwQ2Ik)
```

Pdf :

```
![check this pdf](data/pdf/Mémoire - Castelletti A. (2013) - la place du public dans les nouveaux médias.pdf)
```

Iframe :

```
Check [this iframe](http://www.w3schools.com/jsref/jsref_regexp_nxy.asp)
```

### File extensions

### Links without figures

By default, all hyperlinks will be considered as figures if not specified otherwise :

```
Check [this iframe](http://www.w3schools.com/jsref/jsref_regexp_nxy.asp){figure : false}
```

###Inline figures call

They are done by calling the id a of figure.

```
Check [this timeline](my cool timeline)
```

Figure contextual data will be added with {} just after, or one line before :

```
{title : "an important period", caption:"look at this period"}
Check [this timeline](my cool timeline)

Or

Check [this timeline](my cool timeline)
{title : "an important period", caption:"look at this period"}


Or

Check [this timeline](my cool timeline){title : "an important period", caption:"look at this period"}

```


# Inline figure description (former modulo-views)

An inline figure description is portion of markdown which describes an (interactive) figure to be used by the front-end document renderer.

It is identified by an id (if no Id specified, it will try to find a title and use it as id, otherwise it will not consider it).

It translate to an html <inline-resource></inline-resource> tag that will contain the data description as a data property containing json data.

Input model:


```
\```type-of-figure
key:value
key:value
...
\```
```

Output model:

```
<inline-resource style="display:none" data="{key:value,comma-separated,type:type-of-resource}"></inline-resource>
```


If the type-of-figure is not recognized as a modulo figure, it will be displayed as a regular code block.

Example :

```
\```json
{
    key : "actual json code block"
}
\```
```


# Special figures (former modulo-view) description

## Pattern

Example :

{title:My timeline}
```
\```timeline
title:my cool timeline
\```
```

## Invariant properties

| key | value type | description | example |
| --- | ---------- | ----------- | ------- |
| title | string | title of the figure/ressource | a good figure |

## Html content

## Timeline

## Iframe

## Sankey

## Network graph

## Map

# Document comments (CriticMarkup implementation)

## Basics

There are five types of Critic marks:

```
Addition {++ ++}
Deletion {-- --}
Substitution {~~ ~> ~~}
Comment {>> <<}
Highlight {== ==}{>> <<}
```

A highlight followed by a comment creates a commented portion.

```
Lorem ipsum dolor sit amet, consectetur adipiscing elit. {==Vestibulum at orci magna. Phasellus augue justo, sodales eu pulvinar ac, vulputate eget nulla.==}{>>confusing<<} Mauris massa sem, tempor sed cursus et, semper tincidunt lacus.
```

## Possible addings

### Discussion

Several successive comments are a conversation.

```
Lorem ipsum dolor sit amet, consectetur adipiscing elit. {==Vestibulum at orci magna. Phasellus augue justo, sodales eu pulvinar ac, vulputate eget nulla.==}{>>confusing<<}{>>I don't think so.<<}{>>You should.<<} Mauris massa sem, tempor sed cursus et, semper tincidunt lacus.
```

### Identification (to think through)

Each annotatation could be followed by an identification of the person who made it, for instance with a {$$ $$} pattern:

```
Lorem ipsum dolor sit amet, consectetur adipiscing elit. {==Vestibulum at orci magna. Phasellus augue justo, sodales eu pulvinar ac, vulputate eget nulla.==}{$$ Annie $$}{>>confusing<<}{$$ Annie $$}{>>I don't think so.<<}{$$ Alain $$}{>>You should.<<}{$$ Annie $$} Mauris massa sem, tempor sed cursus et, semper tincidunt lacus.
```
