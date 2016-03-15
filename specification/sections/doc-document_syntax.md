Modulo documentation | document syntax (modulo-flavoured markdown) | WIP
=================

Modulo-flavoured markdown is supposed to be built on top of Markua implementation (from : https://leanpub.com/markua/read) that is supposed to adapt markdown to book writing.


What it is supposed to add is the notion of resource specification, and resource contextualization, intelligent contextualization of content, and templating.


## Intelligent contextualisation

To develop ...
Typically, for instance, a quote followed by a reference citation should bind the quote to this reference citation at html level, and data API level.

## Resources contextualization and specification

Resources are of 3 types :
* bibliographical records
* figures
* entities (or, in book vocab, glossary entries)

Basically, resource description (all constant, non-changing properties) and resource contextualisation (how to display it at a specific point of the contents) are separated.

Resource description can occur either in separate files or inside the content.md file of a modulo node.

Resource contextualisation can occur only in a content.md file, as it is where it is instanciated and contextualized.

## Templating

Things should be easily template-based rendered, such as :
* authors names
* table of content


# Formatting syntax

## Underline

Markua:

> Underline
> 
To produce underlined text, surround it with ____four underscores____ (producing <u> in HTML). This is gross, but it’s a tradeoff for Markdown compatibility: the one, two and three underscore choices were taken. Thankfully, it’s usually preferable to use italic instead of underline. However, underline is not just a typewriter version of italics. In some languages, underlining serves a distinct, legitimate purpose.


## Strikethrough:

> Strikethrough
> 
To produce strikethrough text, surround it with ~~two tildes~~. This is the same syntax as is used by both GitHub Flavored Markdown and by John Macfarlane’s excellent pandoc.) TODO: ADD STRIKETHROUGH TO LEANPUB!

## Superscript

> Superscript
> 
To produce superscript like the 3 in 53 = 125, surround it with carets like 5^3^ = 125. (This is the same syntax as is used by pandoc.)

## Subscript

> Subscript
> 
To produce subscript like the 2 in H2O, surround it with single tildes like H~2~O.

## Spaces and newlines

Newlines:

> In Markua, a single newline inside a paragraph forces a line break, which produces a \<br/> tag in HTML. 


Leading spaces :

> Following exactly one newline, whitespace is preserved. Specifically, a single space produces a single space (a “non-breaking” space, or \&nbsp;, in HTML), and a single tab produces four spaces (four “non-breaking” spaces, or \&nbsp;\&nbsp;\&nbsp;\&nbsp;, in HTML).
Following two or more newlines (one or more blank lines), whitespace is ignored. So, you can manually indent your paragraphs if you’re used to doing so, and it will have no effect.

# Modulo multiple files handling

It should contain an "include" function allowing to concatenate/follow several markdown files.


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


## Inline quotes

Inline quotes should be indicated in html as span elements.

```
He said "leave me"
```

Should translate to :

```
He said <span class="inline-quote">"leave me"</span>
```



### Quotes and contextual semanticity

#### Inline quotes

Example:
```
When Berry writes that "digital must be unpacked" {!berry_understanding_2012,p12!} ...
```

Should translate to :

```
When Berry writes that <span class="short-quote" author="David Berry" quote-id="berry_understanding_2012" quote-pages="12">digital must be unpacked"</span><span class="short-citation" id="berry_understanding_2012">(Berry, 2012, p. 12)</span> ...
```

#### Block quotes

Example:
```
> digital must be unpacked
{!berry_understanding_2012,p12!}
```

Should translate to :

```
<blockquote class="short-quote" author="David Berry" quote-id="berry_understanding_2012" quote-pages="12">
digital must be unpacked
</blockquote>
<sup><a>[1]</a></sup>
```



# Template-rendered metadata calls

Modulo should be able to call metadata-based properties and generated contents into the document.

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
* [toc] --> table of contents
* [figures] --> list of figures and their captions

# Resources

## Resources : global rationale

Resources are discourse-external elements that are cited and inserted into the core flow of a document.

Writers do two types of actions concerning resources :
* they define them with constant information (url/uri, owner, rights, ...)
* they instantiate them within a specific context, decorating them with contextual indications

### Resources definition

... todo (it must be the more homogeneous possible)

### Resources instantiation and contextualization methods

Resources can be inserted as inline links, or block links.

In both cases they are composed of the three following parts :
* resource contextual name inside []
* resource constant name inside ()
* resource contextual indications inside {}

In modulo default interface behaviour, primary figures will be triggered through scroll, and secondary figures through click (as a <a> hyperlink).

Syntax of a  :

```
This is a [secondary figure insertion commentary](resource constant name){optional json-style contextual indications about additional data, comments, or displaying options}
```


```
![This is a primary figure insertion commentary](resource constant name)
{optional json-style contextual indications about additional data, comments, or displaying options}
```


Resource constant name can be of two types :
* either they point to a resource description data that would have been provided inline elswhere in the .md file, or in a separate file
* or they are implicitly asking to create a new resource from scratch : this is the case for direct media (image, video, ...) calling or for on-the-go glossary entries.

Some will need to have additional resource constant description data, such as data-related or bibliography-related resource instances.

## Entity resources

Todo ...

Should translate to:
```
<p>I'm talking about <span class="glossary-element" term="rhetorics" >rhetorics</span></p>
<p>I'm  being <span class="glossary-element" term="rhetorics" >rhetorical</span></p>
```


## Bibliographical resources

Todo ...

### Specifying the bibliography data

Bibliography should be handled with .bib file specified in the metadata of the document, or inlined as a resource in bibtext format.

### Inline short citation

Note, if quoted content before it should somehow encode in the html content that the quote is from this citation.

Note : it also should translate to a COiNS span item, when applicable.

### Single reference rendering

### Bibliography

## Figures

Figures can point to a single source of data, or to several.
They can be self-dependent, such as images or vimeo link (no indispensable need to give additional information to display them), or context-depend (i.e. : timeline data needs to specify begin and end dates).

### Origin

Three parameters :
* figure insertion method (primary or secondary)
* type (image, video, carousel, timeline, ...)
* origin (web url or inline description)


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
Inline call :
As we can see in this [vimeo video](https://vimeo.com/129051743)

Block call :
![A cool video](https://vimeo.com/129051743)
```

Youtube :

```
Inline call :
As we can see in this [vimeo video](https://www.youtube.com/watch?v=G5OicZrhkHg)

Block call :
![A cool video](https://www.youtube.com/watch?v=G5OicZrhkHg)
```

Carrousel :

```
As we can see in [these images](/data/images/1.png,/data/images/2.png,/data/images/3.png)

![The carousel title](/data/images/1.png,/data/images/2.png,/data/images/3.png)
```

Tweet message :

```
![An enlightening tweet](https://twitter.com/Strabic/status/565086840370528256)
```

Todo : tweet timeline, tweet list.

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

gif, png, jpeg, svg, svgz, gif, tif   > img
mp4, webm > video player
mp3, aac, wav, ogg  > audio

### Links without figures

By default, all hyperlinks will be considered as figures if not specified otherwise :

```
Check [this iframe](http://www.w3schools.com/jsref/jsref_regexp_nxy.asp){figure : false}
```

### Figure descriptions

Figures can be described in two ways :
* file : link to a .figure file
* inline : written in the body of the document (anywhere)

Example of figure file link :

```
Check [this timeline](my_cool_timeline.fig)
```


### Inline resources contextualization

They are done by calling the id a of figure.

```
Check [this timeline](my_cool_timeline)
```

Figure contextual data will be added with {} just after, or one line before :

```
{title : "an important period", caption:"look at this period"}
Check [this timeline](my_cool_timeline)

Or

Check [this timeline](my_cool_timeline)
{title : "an important period", caption:"look at this period"}


Or

Check [this timeline](my_cool_timeline){title : "an important period", caption:"look at this period"}

```
