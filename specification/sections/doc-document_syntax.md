Modulo documentation | markdown document syntax (modulo-flavoured markdown) | WIP
=================


# Ideas and principles

## Grounded on Markdown

Modulo tends to be as simple and standard-compliant as possible by following the markdown standard specification.

## Smart contextualisation and semanticity

Typically, for instance, a quote followed by a reference citation should bind the quote to this reference citation at html level, and data API level.

Markdown specs are often rather poor in term of (html) semanticity : it could be better.

## Templating

Modulo should provide ways to generate html content from metadata-generated information through templates, such as :
* authors names
* table of content
* ...

This would also contribute to emphasazing the importance of metadata.

## Resources contextualization model

Every external content summoned inside the main text is conceptualized as the *contextualization* of a *resource* through a *contextualizer*.

Resources are of 3 types :
* bibliographical records
* figures
* entities (or, in book vocab, glossary entries)

Basically, resource description (all constant, non-changing properties) and resource contextualizers (how to display it at a specific point of the contents) are separated from each others, and separated from contextualizations, which are the only entites to be situated inside the text body.

Resource description can occur either in separate files or inside the ``content.md`` file (in this case we speak about *one-shot* contextualizers).

Resource contextualisation can occur only in a content.md file, as it is where it is instanciated and contextualized.

# Smart contextualization

## Footnotes

Model:
```
I'm in the text[^]{This is the footnote content}
```

Description:
Indicates a side/footnote in the content

Translates to:
```
<p>I'm in the text<sup>1</sup></p>
...

<p class="footnote">
    <span class="footnote-marker">1</span>
    <span class="footnote-content">This is the footnote content</span>
</p>
```


## Quotes and resources linking

#### Inline quotes

This modulo assertion :

```
When Martin writes ["it should not be done"](@martin_change_2002){pages="12-13"}

```

Should translate to :

```
When Martin writes <q>it should not be done</q><cite>(Martin, 2012, pp. 12-13)</cite>
```

#### Block quotes

This modulo assertion :

```
> digital must be unpacked
![](@berry_understanding_2012){page:12}

```

Should translate to :

```
<blockquote class="short-quote" author="David Berry" quote-id="berry_understanding_2012" quote-pages="12">
digital must be unpacked
</blockquote>
```



# Template-rendered metadata calls

Modulo should be able to render metadata-based properties and generated contents into the document.

This modulo assertion :
```
${abstract}$
```

Should translate to :

```
<div class="abstract">
Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fuga eveniet nihil ab consectetur reprehenderit voluptatum ipsum dicta, sed atque. Inventore repudiandae doloribus nam enim modi nemo asperiores voluptatum earum, esse.
</div>
```

(grounding on the "abstract" or "description" metadata)


Forseen templates :

* ${authors} --> authors
* ${title} --> title + subtitle
* ${title_simple} --> title
* ${title_complete} --> title, subtitle, authors
* ${general_title} --> title of the book/thesis
* ${abstract} --> abstract or description
* ${toc} --> table of contents
* ${figures} --> list of figures and their captions

## Multiple files inclusions

The template language should also allow to include external parts of text coming from a markdown file in the same folder of section's one.

E.g. include the file ``subpart.md`` in a section :

```
${include:subpart}
```


# Resources and their contextualization

## Resources and their contextualization : global idea

The key idea is to distinguish the resource, which is the description of a source, data, ... and its contextualization through a figure, a citation, ...

Resources are discourse-external elements that are cited and/or inserted into the core flow of a document with a form specific to the context.


Resources are of 3 global types :

* bibliographical records
* data source : data file, video, image, ...
* entities (or, in book vocab, glossary entries)

Resource description can occur either in separate files or inside the ``content.md`` file of a modulo node.

Resource contextualisation can occur only in a ``content.md`` file, as it is where it is instanciated and contextualized.


## Resources definition

A resource definition specifies immutable information about a resource, such as :
* where its data can be fetched
* its name
* its author
* ...

As we will see, resources definition syntax stands on the shoulders of bibText syntax.

This means that data sources, persons, places, ... will all be encoded in bibText syntax, though with different properties.

Therefore, **modulo resource definition syntax is not a brand new syntax but an extension of the bibText established syntax, extended to the description of data sources, images, entities, etc. and so on.**

## Where/how to define a resource

Ressource definition must occur inside ``.bib`` files.

There can be either one or several resources in a given file.

Example of several resources inside a file :

```
@article{hamilton_publishing_????,
    title = {Publishing by -- and for? -- the {Numbers}},
    volume = {250},
    url = {http://www.garfield.library.upenn.edu/papers/hamilton1.html},
    number = {1331-2},
    journal = {Science},
    author = {Hamilton, D.P.}
}

@article{barnet_machine_2012,
    title = {Machine {Enhanced} ({Re})minding: the {Development} of {Storyspace}},
    volume = {6},
    shorttitle = {Machine {Enhanced} ({Re})minding},
    url = {http://www.digitalhumanities.org/dhq/vol/6/2/000128/000128.html},
    number = {2},
    urldate = {2014-01-23},
    author = {Barnet, Belinda},
    year = {2012}
}
```

## Resources instantiation and contextualization

### Resource identification

Ressources are identifed with their bibText Identificator preceded by ``@``.

For instance, for the resource :
```
@ent_person{marie_dupre,
    firstName = "Marie",
    lastName = "Dupré",
    aliases = "Marie D., Marie Dup."
}
```

... the identificator is ``@marie_dupre``.

### Resource insertion and contextualization

Resources can be contextualized as inline links, or block links.

In both cases they are composed of the three following parts :

* resource contextual name inside []
* resource identificator inside ()
* resource contextualizer (call or definition) inside {}

In modulo default interface behaviour, primary figures will be triggered through scroll, and secondary figures through click (as a <a> hyperlink).

Syntax of an inline resource contextualization  :

```
This is a [secondary figure insertion commentary](resource constant name){optional json-style contextual indications about additional data, comments, or displaying options}
```

Syntax of a block resource contextualization :

```
![This is a primary figure insertion commentary](resource constant name)
{optional json-style contextual indications about additional data, comments, or displaying options}
```


So for instance with our Marie Dupré :

```
As experienced by [Marie Dupré](@marie_dupre), we can argue that ...
```

... we are stating that there is here a reference to the entity marie_dupre inserted inside the document at this point of text.

## Combined contextualization

It should be possible to combine several resources citations to "build" their display.

For instance combining a ``.srt`` data with a video media should give a figure displaying the video subtitled with the provided data.

```
As experienced by [Marie Dupré](@marie_dupre) and seen in her [Interview](@marie_interview_video, @marie_interview_transcription), ...
```


## Bibliographical resources

Note : all bibligraphical resources contextualizations should translate to a COiNS span item, when applicable.

### Inline contextualization

This corresponds by default to a short citation if not specified by the contextualization data.

Possible contextualization data :
* display as short citation (eg *(Dupré, 1983)* or *[DUPRE]*)
* page(s) being referenced (eg *(Dupré, 1983, pp. 12-13)* or *[DUPRE, 12-13]*)
* display as long citation


Note related to *intelligent contextualization* : if quoted content before it should somehow encode in the html content that the quote is from this citation.

Note : abbreviations such as *ibid* should be automatically generated.

### Block contextualization

This corresponds by default to a long citation (think bibliography-like display) if not specified otherwise by the contextualization data.

## Media and URL resources : outside web should always be 2 clicks away

This is where modulo aims at be constraining, and specifically fit for academic rigor.

**It should be impossible to reference an image, a video, or even an external link in a Modulo document without having it referenced (and documented) as a resource.**

The only way to point to these kinds of contents in modulo is to use resources descriptions as "middlewares".

By default they will affect (by click or scroll) the aside contents of the interface/document :
* videos will be displayed in videos

Possible contextualization properties :
* ``directLink`` : not using the aside-contents and directly pointing to the link of the resource
* ``directShow`` (for links) : aside will automatically display an iframe of the targeted website
