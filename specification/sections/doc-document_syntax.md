Modulo documentation | markdown document syntax (modulo-flavoured markdown) | WIP
=================


# Grounded on Markdown

Modulo tends to be as simple and standard-compliant as possible by following the markdown standard specification.

The following describes how markdown is extended to fit rigorous and media-rich scholarly composition practices.

# Resources-Contextualizer-Contextualization model

[See the Modulo Resource-Contextualizer-Contextualization (RCC) model doc](https://github.com/robindemourat/modulo/tree/master/specification/sections/doc-rcc_model.md)


## Note on media-related and URL resources : outside web should always be 2 clicks away

**It should be impossible to reference an image, a video, or even an external link in a Modulo document without having it referenced (and documented) as a resource.**

The only way to point to these kinds of contents in modulo is to use resources descriptions as "middlewares".

# Smart contextualization of quotes

Another principle of Modulo is to infer as much *implicit semanticity* as it can from the input markdown content.

Concerning Academic publishing, one of the most important practices of scholarly composition is the quotation and citation practice. In this sense, Modulo should be smart about quotes and blockquotes directly followed by bibliographic resources contextualizations.

Examples :

This modulo assertion :

```
When Martin writes ["it should not be done"](@martin_change_2002){pages="12-13"}

```

Should translate to :

```
When Martin writes <q>it should not be done</q><cite>(Martin, 2012, pp. 12-13)</cite>
```

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


