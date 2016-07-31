Peritext documentation | markdown document syntax (peritext-flavoured markdown) | WIP
=================


# Grounded on Markdown

Peritext tends to be as simple and standard-compliant as possible by following the markdown standard specification.

The following describes how markdown is extended to fit rigorous and media-rich scholarly composition practices.

# The Resources-Contextualizer-Contextualization model

[See the Peritext Resource-Contextualizer-Contextualization (RCC) model doc](https://github.com/robindemourat/peritext/tree/master/specification/sections/doc-rcc_model.md)

# How is markdown modified

Hyperlinks statements (e.g. ``[link](http://example.com)``) are used to specify ``inline`` contextualizations (e.g. ``[contextualization](@resource)``).

Image statements (e.g. ``![My image](http://example.com/image.jpg)``) are used to specify ``block`` contextualizations (e.g. ``![contextualization](@resource)``).

### Note on media-related and URL resources : outside web should always be 2 clicks away

**It should be impossible to reference an image, a video, or even an external link in a Peritext document without having it referenced (and documented) as a resource.**

The only way to point to these kinds of contents in peritext is to use resources descriptions as "middlewares".

# Smart contextualization

Another goal of Peritext is to infer as much *implicit semanticity* as it can from the input markdown content. 

This is done first through html outputs and microformats. They must be used as much as possible (when we know a piece of content must be a person, its html representation must be systematically enrichied with http://schema.org/Person microformat).

Concerning Academic publishing, one of the most important practices of scholarly composition is also quotation and citation practices. In this sense, Peritext should be smart about quotes and blockquotes directly followed by bibliographic resources contextualizations.

Examples :

This peritext assertion :

```
When Martin writes ["it should not be done"](@martin_change_2002){pages="12-13"}

```

Should translate to :

```
When Martin writes <q>it should not be done</q><cite>(Martin, 2012, pp. 12-13)</cite>
```

This peritext assertion :

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

Peritext should be able to render metadata-based properties and generated contents into the document.

This peritext assertion :
```
${abstract}
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

# Multiple files inclusions

The template language should also allow to include external parts of text coming from a markdown file in the same folder of section's one.

E.g. include the file ``subpart.md`` in a section :

```
${include:subpart}
```


