Modulo documentation | document syntax (modulo-flavoured markdown) | WIP
=================

# Markua implementation (from : https://leanpub.com/markua/read)

> Underline
To produce underlined text, surround it with ____four underscores____ (producing <u> in HTML). This is gross, but it’s a tradeoff for Markdown compatibility: the one, two and three underscore choices were taken. Thankfully, it’s usually preferable to use italic instead of underline. However, underline is not just a typewriter version of italics. In some languages, underlining serves a distinct, legitimate purpose.

> Strikethrough
To produce strikethrough text, surround it with ~~two tildes~~. This is the same syntax as is used by both GitHub Flavored Markdown and by John Macfarlane’s excellent pandoc.) TODO: ADD STRIKETHROUGH TO LEANPUB!

> Superscript
To produce superscript like the 3 in 53 = 125, surround it with carets like 5^3^ = 125. (This is the same syntax as is used by pandoc.)

> Subscript
To produce subscript like the 2 in H2O, surround it with single tildes like H~2~O.

Newlines:

> In Markua, a single newline inside a paragraph forces a line break, which produces a <br/> tag in HTML. 


Leading spaces :

> Following exactly one newline, whitespace is preserved. Specifically, a single space produces a single space (a “non-breaking” space, or &nbsp;, in HTML), and a single tab produces four spaces (four “non-breaking” spaces, or &nbsp;&nbsp;&nbsp;&nbsp;, in HTML).
Following two or more newlines (one or more blank lines), whitespace is ignored. So, you can manually indent your paragraphs if you’re used to doing so, and it will have no effect.

Ressources :

> Resources vary in four different ways:

> Insertion Methods: Span and Figure
Locations: Local, Web and Inline
Types: image, video, audio, code, math or text
Formats: png, m4a, mp3, ruby, latex, plain, etc.


Resource Locations and Insertion Methods
A resource is either considered a local, web or inline resource based on its location:

Local Resource
The resource is stored along with the manuscript–either in a resources directory on a local filesystem, or uploaded to the same web service where the manuscript is being written.
Web Resource
The resource is referred to via an http or https URL.
Inline Resource
The resource is defined right in the body of a Markua document.
Resources can be inserted either as spans or as figures.

Span
The resource is inserted as part of the flow of text of a paragraph with no newlines before or after it. A span resource cannot have an attribute list.
Figure
The resource is inserted with at least one newline before and after it. A figure can have an attribute list. A figure can either be top-level (with a blank line before and after it), or it can be part of the flow of text of a paragraph (with a single newline before it, and one or more newlines after it).
The syntax for a local resource or a web resource inserted as a span is as follows:

It's just ![optional alt text](resource_path_or_url) right in the text.
The syntax for a local resource or a web resource inserted as a figure is as follows:

{key: value, comma: separated, optional: attribute_list}
![Optional Figure Caption](resource_path_or_url)

The syntax for an inline resource inserted as a span is as follows:

It's a single backtick `followed by inline resource content\`optional_format and then a single backtick.
The syntax for an inline resource inserted as a figure is as follows:

{key: value, comma: separated, optional: attribute_list}
```optional_format
inline resource content
```
Resource Types and Formats
There are six types of resources: image, video, audio, code, math and text.

Each type of resource has a number of supported formats, which can either be specified by the format attribute or (in most cases) inferred from the file extension for local and web resources. (Inline resources obviously have no file extension, since they are contained in the body of a Markua manuscript file.)

Any of the six resource types can be inserted as a local resource or web resource, and many of the resource types can also be inserted as an inline resource.

Inline resources can be of type code, math or text (regardless of format), and they can also be image resources of svg format.

The default type of a local resource or web resource is always image. This means images in Markua are inserted in essentially the same way they are in Markdown.

The default type of an inline resource depends on the format specified:

If the format is svg, the inline resource is assumed to be of type image.
If the format is latex or mathml, the inline resource is assumed to be of type math.
If the format is omitted or is plain, the inline resource is assumed to be of type text.
For any other format, the inline resource is assumed to be of type code.
These defaults mean that Markua can usually do the right thing based on the format, and that the resource type can almost always be inferred for inline resources. Markua is intended to be pleasant to write, so that means eliminating verboseness by using sensible defaults wherever possible.

# CriticMarkup implementation

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

# Modulo-specific addings

```
^^vimeo:https://vimeo.com/129051743
```

```
^^youtube:https://www.youtube.com/watch?v=G5OicZrhkHg
```

```
^^tableau-embed:<script type='text/javascript' src='https://public.tableau.com/javascripts/api/viz_v1.js'></script><div class='tableauPlaceholder' style='width: 1004px; height: 669px;'><noscript><a href='#'><img alt='Countries and their participation to IPCC ARs ' src='https:&#47;&#47;public.tableau.com&#47;static&#47;images&#47;ma&#47;map_medea3&#47;Dash&#47;1_rss.png' style='border: none' /></a></noscript><object class='tableauViz' width='1004' height='669' style='display:none;'><param name='host_url' value='https%3A%2F%2Fpublic.tableau.com%2F' /> <param name='site_root' value='' /><param name='name' value='map_medea3&#47;Dash' /><param name='tabs' value='no' /><param name='toolbar' value='yes' /><param name='static_image' value='https:&#47;&#47;public.tableau.com&#47;static&#47;images&#47;ma&#47;map_medea3&#47;Dash&#47;1.png' /> <param name='animate_transition' value='yes' /><param name='display_static_image' value='yes' /><param name='display_spinner' value='yes' /><param name='display_overlay' value='yes' /><param name='display_count' value='yes' /><param name='showVizHome' value='no' /><param name='showTabs' value='y' /><param name='bootstrapWhenNotified' value='true' /></object></div>
```


```
^^carousel:/data/images/1.png,/data/images/2.png,/data/images/3.png
```

```
^^twitter-msg-oembed:https://twitter.com/Strabic/status/565086840370528256
```

```
^^slideshare://fr.slideshare.net/slideshow/embed_code/key/rGQLsk1BvwQ2Ik
```


```
^^pdf-embed:data/pdf/Mémoire - Castelletti A. (2013) - la place du public dans les nouveaux médias.pdf
```

```
^^iframe:http://www.w3schools.com/jsref/jsref_regexp_nxy.asp
```

# Modulo academy-oriented tags

## Footnotes


## Glossary


## Referencing and quotes (hard-written, generated from zotero)


## Bibliography generation


## Glossary generation


## Agregators

Websites quoted in the document.

# Modulo view tags

## Modulo-aside

### Modulo aside marker

Model:
```
^^modulo-aside:My aside
```

Description:
Indicates the end of a modulo view (if it is active)

Translates to:
```
<div class="modulo-aside-trigger" id="My aside">My aside</div>
<figure class="modulo-aside-figure" id="My aside">My aside</figure>
```

### Modulo aside end marker

Model:
```
^^modulo-aside-end:My aside
```

Description:
Indicates the end of a modulo view (if it is active)

Translates to:
```
<div class="modulo-aside-end" id="My aside"></div>
```

### Href modulo View

Model:
```
[link to a modulo view](^^modulo-href:My aside)
```

Description:
Creates an inline link that will be linked to a modulo view.

Translates to:
```
<a class="modulo-href-marker" target="My aside"></a>
```

# Modulo view description in json

## Pattern

Figures are described within code blocks:

```figure-description
key:value
```

They will be analysed and removed from content by a file parser.

## Invariant

| key | value type | description | example |
| --- | ---------- | ----------- | ------- |
| title | string | title of the figure/ressource | a good figure |

## Html content

## Timeline

## Iframe

## Sankey

## Graph

## Map

