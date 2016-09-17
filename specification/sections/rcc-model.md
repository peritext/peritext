Peritext documentation | The resource-contextualizer-contextualization | WIP
====

![Peritext document model in one image](https://raw.githubusercontent.com/robindemourat/peritext/master/specification/assets/peritext-document-model.png)


The RCC model is a way to reason about digital scholarly argumentation through an homogen and still flexible document model.

The key idea or RCC model is to distinguish the resources, which deal with sources, data, ... used in an argumentative process, and their contextualization through figures,  citations, ...

In RCC, every external content mentionned inside the main text is conceptualized as the *contextualization* of a *resource* through a *contextualizer*.

* a *resource* designates any external element used in the document : it can be a bibliographical resource, a data source (tabular, API call, ...), a media asset (image, video, ...), or even an entity or glossary entry.
* a *contextualizer* designates a way to contextualize a resource. It is composed of a set of parameters: a type (e.g. : "timeline", "citation", ...) and other type-specific parameters = (e.g.: "start date" for a timeline, "page" for a citation, ...)
* a *contextualization* designates the situated and unique contextualization of a ressource through a contextualizer, at a specific point of linear contents. It is conceptually the encounter of three parameters : *one point of the main textual content*, a *contextualizer* and *one or several resources*

Resource description occur in ``.bib`` files.

Contextualizations descriptions occur in ``.md`` files, in the main textual contents of the publication.

# Resources

A resource definition specifies immutable and meta-level information about it, such as :

* its name
* its author
* where and how its data can be fetched
* ...

The syntax used to describe resources is derivated from ``bibTeX`` syntax, the way of describing bibliographical references in ``LaTeX`` environments.

Example of several resources inside a ``.bib`` file :

```
@article{hamilton_publishing,
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

### Resource identification

Ressources are identifed with their bibText id preceded by ``@``.

For instance, for the resource :
```
@person{marie_dupre,
    firstName = "Marie",
    lastName = "Dupré",
    aliases = "Marie D., Marie Dup."
}
```

... the identificator is ``@marie_dupre``.

## Additional resources types

Peritext extends the tradition bibTeX's ``bibType`` spector, by adding an evolving set of ``bibTypes`` that can be used to refer to resources in documents. Examples include (wip) :

* tabularData
* jsonData
* transcriptionData
* video
* audio
* image
* online
* person
* place
* concept
* ...

# Contextualization

Contextualizations are the **intersection of a position in mardown-written main contents, a set of resources, and (optionally) a contextualizer statement**.

Resources can be contextualized as inline links, or block links. They are specified in markdown syntax, as a hack of hyperlinks syntax and images syntax.

Hyperlinks statements (e.g. ``[link](http://example.com)``) are used to specify ``inline`` contextualizations (e.g. ``[contextualization](@resource)``).

Image statements (e.g. ``![My image](http://example.com/image.jpg)``) are used to specify ``block`` contextualizations (e.g. ``![contextualization](@resource)``).

In both cases they are composed of the three following parts :

* resource contextual name inside [] - **required**
* resource identificator inside () - **required**
* resource contextualizer (short or long version - see below) inside {} - **optional**

In peritext default web applications, primary figures would be triggered through scroll, and secondary figures through click (as a <a> hyperlink).

Again, here is the syntax of an inline resource contextualization  :

```
This is a [secondary figure insertion commentary](resource constant name){optional bibTeX-style contextual indications about additional data, comments, or displaying options}
```

And here is the syntax of a block resource contextualization :

```
![This is a primary figure insertion commentary](resource constant name)
{optional json-style contextual indications about additional data, comments, or displaying options}
```


So for instance with a resource describing the entity ``Marie Dupré``, we could have as an entity contextualization the following statement :

```
As experienced by [Marie Dupré](@marie_dupre), we can argue that ...
```

The example above is stating that there should be a contextualization of the entity ``marie_dupre`` inserted inside the document at this specific point of text.

## Combined contextualization

It should be possible to combine several resources citations : for instance combining a ``.srt`` data with a video media should give a figure displaying the video subtitled with the provided data.

In this case, resources are enumerated separated by comas :

```
As experienced by [Marie Dupré](@marie_dupre) and seen in her [Interview](@marie_interview_video, @marie_interview_transcription), ...
```

# Contextualizers

* contextualizers describe **a way to contextualize a given type of resource, or set of resources. It is a set of contextualization parameters.**
* contextualizers are **abstracted from the specific resources they will designate** : the same contextualizer should be callable on several different resources
* contextualizers are **abstracted from the way they can be instantiated** : where and how (inline or block) contextualizations occur is the job of contextualizations

## Describing a contextualizer

There are several ways contextualizers can be described :

### Explicit reusable contextualizers in bib files

Contextualizers can be specified in ``.bib`` files as ``@contextualizer`` objects (and therefore used several times). They are written in plain bibTeX syntax, and must be provided a id.

Example :

```
@contextualizer{timeline,
  type="timeline",
  title={My cool timeline},
  layer={
    dates=@res.data.dates,
    title=hello ça va,
    labels=@res.data.labels
  },
  layer={
    dates=@res.data.dates2,
    labels=@res.data.labels2}
}
```

### Contextualizers overload

Explicitly named contextualizers can be *overloaded* on top of existing contextualizers (e.g. : pointing to a different timestamp in a video) - these are *one-shot* contextualizers built on the basis on a reusable contextualizer.

Overloaded contextualizers are contextualizers created as modified copies of explicit contextualizers.

This syntax is particularly aimed at enabling authors to "travel" inside a resource through their text, through a series of contextualizers overload.These typically cover argumentations in which the author provides a "journey" through a resource's contextualization, such as a map, timeline or a book.

In this case, contextualizer's id is called, and then followed with overloading parameters.

Let's say we have the following ``.bib`` content :

```
@tabularData{temporal_data,
  url="cool_url",
  format="csv",
  title="cool data"
}

@contextualizer{cooltimeline,
    type="timeline",
    layer={dates=@res.data.dates,labels=@res.data.labels},
    caption="This is a cool timeline",
    startat="2012-20-01",
    endat="2012-30-01"
}
```

Overloading this contextualizer could look like that in the ``content.md`` file :

```
As we can see in [the the timeline](@tabularData){@cooltimeline, endat="2012-15-02"}, it is clear that they are right.
```

Here the original timeline contextualizer ends at 2012-30-01, but is *overloaded* at contextualization to end at 2012-15-02.

**The principle of overloading allows therefore to "nest" contextualization descriptions in order to perform "contextualization travelling" sequences.**

Yet another example of "data journey" use case :

```
If we look at a [timeline](@csv_file){@timeline}, we can have a global look at the events of this period.

The [ninethinth](@csv_file){@timeline, start="1800", end="1900"} century is very tough.

But the [twentieth](@csv_file){@timeline, start="1900", end="2000"}) is even worse.

The [twenty-first](@csv_file){@timeline, start="2000", end="2100"}) has gone better.
```

### Entirely implicit contextualizers

When no contextualizer information is attached to a contextualization, an implicit contextualizer is instanciated :

* its type is infered from the contextualized resource's type
* it is populated with default values provided by the contextualizer's type (see below)

Example :

```
As we can see in [the book](@thebook), it is clear that they are right.
```

Will provoke the instanciation of the implicit contextualizer :

```js
{
    id : "implicitContextualizer1",
    type : "citation"
}
```


These are *one-shot* and *fully implicit* contextualizers.

### Partial contextualizers

Contextualizers can be specified on-the-fly just after a contextualization assertion - these are *one-shot* contextualizers and they can be *partially implicit* (for instance, not specifying their contextualizer type : in this case conceptualizer is infered from the resource's type).

On-the-fly contextualizers are un-named contextualizers that just attach some extra info to the default contextualization params.

On-the-fly have **no explicit id** even if they are given one by Peritext engine. All the default params are applied if not specified otherwise.

Example of an on-the-fly contextualizer, specified inline in ``content.md`` just after the contextualization assertion : 

```
As we can see in [the the timeline](@tabularData){
    type="timeline",
    dates=@res.data.dates,
    labels=@res.data.labels
}, it is clear that they are right.
```

Another example, even more partial :

```
There can be a reference to the same book when the author writes that[it cannot continue like that](@my_book){pages="22-23"}.
```

## Contextualizers syntax

### Principles

Contextualizers are a set of params referencing how to use the data concerning specific resources to build a contextualization. Therefore **they are not related to a resource in particular, but have an abstract relationship with the resources they will be applied to**.

Therefore, two types of information can be provided to contextualizers :
* contextualization-specific information, such as, for instance, the title to give to specific contextualizations
* resource-specific information, through the use of an abstraction pointing to resource props

### Nesting

Contextualizers informations can be nested for some contextualizers types needs, like timelines.

For that, nested properties are specified within ``{}`` brackets.

Example :

```
@contextualizer{cool_timeline,
  type="timeline",
  title={My cool timeline},
  layer={
    title="First data layer",
    dates="@res1.data.sendersDates",
    labels="@res1.data.senders"
  },
  layer={
    title="Second data layer",
    dates="@res2.data.receiversDates",
    labels="@res2.data.receivers"
  }
}
```

### Resources values interpolations in contextualizers

Interpolations are performed through the use of the ``@res`` keyword.

#### Basic interpolation

For instance, calling the title of the resource that will be contextualized with a given contextualizer will be written ``@res.title``.

Another example :

```
@contextualizer{resource_specific_table,
  type="table",
  title="@res.editor",
  caption="@res.date"
}
```

In this example, the resources contextualized with ``@resource_specific_table`` contextualizer will display resources' editor as figure titles and resources' dates as figures captions.

#### Data calls

Interpolations are also used to relate to resource's data. For that matter, ``@res.data`` is called.

Example of a table displaying a limited set of columns :

```
@contextualizer{resource_specific_table,
  type="table",
  data="@res.data"
}
```

#### Relating to several resources in a contextualizer

In some cases, a contextualizer will summon several resources (example : a video and its transcription). When contextualizing several resources together, ``@res`` can be given a number to relate to a specific resources.

In these case, resources can be numeroted according to their order within contextualization.

Let's take the following contextualization :

```
Look at [this video](@myvideo,@mytranscription)
```

Here is how to access the two resources fields :

```
@res1.title //title of myvideo
@res2.title //title of mytranscription
```

Another example :

*In .bib file description :*

```
@contextualizer{cool_timeline,
  type="timeline",
  title={My cool timeline},
  layer={
    dates="@res1.data.dates",
    title="hello ça va",
    labels="@res1.data.labels"
  },
  layer={
    dates="@res2.data.dates",
    labels="@res2.data.labels"
  }
}
```

*In main content :*

```
As we can see in the [timeline](@italian_letters, @french_letters){@cool_timeline}, there is a small difference.
```


## Contextualizer states

A contextualizer describes a set of parameters aimed at materializing a resource in an output document in a specific way. It is still one step away from the actual materialization of the resource, which means it doesn't describe where and how elements should be displayed, but rather how the contextualization algorithm should do that.

Indeed, the parameters described in a contextualizer **must be applicable in all the case studies of contextualization' input (inline or as block) or output (app, pdf, epub, xml/svg, ...)**.

Therefore, each contextualizer type covers two input states :
* inline state
* block state

And each contextualizer type covers two output states :
* static state
* dynamic state

Which means that, when designing a new contextualizer, designers & developers must take into account three cases :

* inline static
* inline dynamic
* block static
* block dynamic

For instance, here is what happens for a ``timeline`` contextualizer in each case :

* inline static : timeline is displayed as a static figure and pointed in the style ``(figure 1)`` at anchor position
* inline dynamic : timeline is displayed in the figure space when its inline anchor in the text is clicked/touched
* block static : timeline is displayed as a static figure inside the body of the text
* block dynamic : timline is displayed in the figure space when its inline anchor in the text is hovered (through scroll)


Note about figure numerotation : should be numeroted everything which is not a website, shortcitation, or longcitation.

### Smart static contextualizations : repetitive references

When making several reference to the same contextualizer+resource image combo in static mode, figures should not be displayed several times.

### Smart dynamic contextualizations : contextualization travelling & view transitions

It should be possible to handle an argumentation which "travels" through a data source :
* going from one timestamp to another in a temporal media
* zooming or panning in a map
* changing timespan of a timeline

This is particularly eased by contextualizer' overload (see above).

When switching from one aside to another in these cases of "resource traveling", a transition should be provided.

## Contextualizers models modelling

### Contextualizers types models

* ``description``
* ``categories`` : for inheritance
* ``acceptedResourceTypes`` : Each contextualizer type accepts a specific set of resource types.
* ``properties`` : each contextualizer type model must describe which parameters it can take, what is their value type and whether they are required.


### Contextualizers types properties models

* ``description``
* ``key``
* ``valueType`` : see below
* ``required`` : required or not
* (not required) ``defaultValue`` : value if the prop is not specified
* (not required) ``restrictedValues`` : array of possible values

### Value types

* number : number (integer or floating)
* numberArray : comma-separated number
* coordinate : a coordinate
* string : string
* stringArray : comma-separated string
* accessor : accessor to a resource's field
* objectArray : one or several objects containing properties

### Working with accessors

An accessor allows to fetch some data from the resource. It is done by calling a resource with ``@res``, then writing a point and the key of the property to access.

```
@res.title
```


#### Accessing resource metadata

All resources metadata can be accessed through accessor.

#### Accessing resource data

When dealing with tabular data (for visualization contextualizers for instance), all data can be accessed through the ``.data`` accessor :

```
@res2.data.utterance
```

#### Accessors in string fields

If ``@res`` is used inside a string field, it will be interpreted as an accessor and resolved. If Peritext fails to resolve the assertion, it will leave it as is.

## Contextualizers' types' description

### Global

| property        | description | valueType | defaultValue | restrictedValues | required |
| ------------- |:------------- |:------------- |:------------- |:------------- |:------------- |
|title |The title to display for the contextualizer | | | | |
|type |Contextualizer type | | | | |
|caption |The caption of the contextualization. | | | | |
|note |A note from the author about the contextualization, typically a comment. | | | | |
|outputmode |Describes whether the contextualizer should be activated in static outputs, dynamic outputs, or both. |string |all |static,dynamic,all | |

### webpage

This contextualizers inserts a reference to a website.


| State        | Output description |
| ------------- |:------------- | 
| inline static      | footnote to url |
| inline dynamic      | anchor to website iframe + reference |
| block static      | screenshot of the website + reference |
| block dynamic      | anchor to website iframe + reference |


| property        | description | valueType | defaultValue | restrictedValues | required |
| ------------- |:------------- |:------------- |:------------- |:------------- |:------------- | 
|directlink |whether to allow for direct hypertext | | |yes,no | |

### citation

This contextualizer displays the reference to a bibliographic reference, either as a short or long citation.

| State        | Output description |
| ------------- |:------------- | 
| inline static      | short citation |
| inline dynamic      | short citation |
| block static      | long citation/biblio style |
| block dynamic      | long citation/biblio style |

| property        | description | valueType | defaultValue | restrictedValues | required |
| ------------- |:------------- |:------------- |:------------- |:------------- |:------------- |
|pages |Pages of the citation |string | | | |
|page |Page of the citation |string | | | |

Note : citation formatting should be resolved with document's ``citationStyle`` param (e.g. : APA)

### imageplayer

This contextualizer displays one or more image resources.

| State        | Output description |
| ------------- |:------------- | 
| inline static      | reference to figure and figure display just after |
| inline dynamic      | anchor to gallery display in aside space |
| block static      | figure and its ref |
| block dynamic      | anchor to gallery display in aside space |

| property        | description | valueType | defaultValue | restrictedValues | required |
| ------------- |:------------- |:------------- |:------------- |:------------- |:------------- |
| | | | | | |

### videoplayer

This contextualizer displays a video, either from raw video files or from video services (vimeo, youtube).

| State        | Output description |
| ------------- |:------------- | 
| inline static      | link to url in note |
| inline dynamic      | anchor to video display in aside space |
| block static      | poster of the video with reference |
| block dynamic      | anchor to video display in aside space |

| property        | description | valueType | defaultValue | restrictedValues | required |
| ------------- |:------------- |:------------- |:------------- |:------------- |:------------- |
|startat |Where to start the sample at (exemple : "1h3m2s", "5s", ...) |string | | | |
|endat |Where to end the sample at (exemple : "1h3m2s", "5s", ...) |string | | | |
|timeformat |Describes how time is formatted |string |%HhM%Mm%Ss | | |


### audioplayer

This contextualizer displays an audio document, either from raw video files or from audio services (soundcloud, etc.).

| State        | Output description |
| ------------- |:------------- | 
| inline static      | link to url in note |
| inline dynamic      | anchor to audio display in aside space |
| block static      | Audio cartel with reference |
| block dynamic      | anchor to audio display in aside space |

| property        | description | valueType | defaultValue | restrictedValues | required |
| ------------- |:------------- |:------------- |:------------- |:------------- |:------------- |
|startat |Where to start the sample at (exemple : "1h3m2s", "5s", ...) |string | | | |
|endat |Where to end the sample at (exemple : "1h3m2s", "5s", ...) |string | | | |
|timeformat |Describes how time is formatted |string |%HhM%Mm%Ss | | |


### speechtranscription

This contextualizer displays the transcription of a speech (without media) from a .srt formatted file.

| State        | Output description |
| ------------- |:------------- | 
| inline static      | link to url in note |
| inline dynamic      | text display in aside space |
| block static      | text cartel of the transcription + ref |
| block dynamic      | text display in aside space |

| property        | description | valueType | defaultValue | restrictedValues | required |
| ------------- |:------------- |:------------- |:------------- |:------------- |:------------- | 
| | | | | | |


### sourcecodedisplay

This contextualizer displays a web resource as raw source code.

| State        | Output description |
| ------------- |:------------- | 
| inline static      | link to url in note |
| inline dynamic      | source code display in aside space |
| block static      | text cartel with source code |
| block dynamic      | source code display in aside space |

| property        | description | valueType | defaultValue | restrictedValues | required |
| ------------- |:------------- |:------------- |:------------- |:------------- |:------------- | 
|language |Describes the language in which to highlight the source code. |string | | |no |


### table

This contextualizer displays tabular data as a table.

| State        | Output description |
| ------------- |:------------- | 
| inline static      | table is displayed after current block, and pointed from the anchor |
| inline dynamic      | table is displayed in aside space |
| block static      | tabled is displayed in cartel |
| block dynamic      | table is displayed in aside space |

| property        | description | valueType | defaultValue | restrictedValues | required |
| ------------- |:------------- |:------------- |:------------- |:------------- |:------------- | 
|columns |Describes which columns to display |accessorArray | | | |
|maxlines |maximum number of lines to display |number | | | |


### timeline

This contextualizer displays events, eras and timestamped quantitative data, from tabular data.

| State        | Output description |
| ------------- |:------------- | 
| inline static      | timeline is displayed statically after calling block and pointed as a figure |
| inline dynamic      | timeline is displayed dynamically in aside space |
| block static      | timeline is displayed as a figure |
| block dynamic      | timeline is displayed dynamically in aside space |

| property        | description | valueType | defaultValue | restrictedValues | required |
| ------------- |:------------- |:------------- |:------------- |:------------- |:------------- | 
|disposition |how to dispose layers ? one on top of another or side by side ? | string |juxtapose|superpose,juxtapose | |
|dateformat |Describes how dates are formatted for the whole timeline ? |string |%Y-%m-%d | | |
|startat |Describes at what date should the timeline begin to be displayed ? |string | | | |
|endat |Describes at what date should the timeline begin to be displayed ? |string | | | |
|layer |describes a specific layer of timeline, working with one source of data and one type of data | objectArray | | | |
|layertype (child of layer) |Describes what type of data is displayed in the layer ? |string |events|events,periods,metrics | |
|title (child of layer) |title of a layer |string | | |
|dateformat (child of layer) | describes how dates are formatted for the given layer|string | | |
|dates (child of layer) |Describes which data field to use for positioning events/datapoints/periods beginings |accessor | | | |
|labels (child of layer)|(event layer) describes which datafield to use for naming events or periods |accessor | | | |
|categories (child of layer)|(event layer) Describes which datafield to use for categorizing events, periods, or quantitative data |accessor | | | |
|description (child of layer)|(event layer) describes which datafield to use for describing events or periods |accessor | | | |
|ends (child of layer) |Describes the dates to use for positioning periods ends |accessor | | | |
|values (child of layer) |(metrics layer) which field to use for quantitizing datapoints |accessor | | | |


### map

This contextualizer displays geographical data from tabular data.

| State        | Output description |
| ------------- |:------------- |
| inline static      | map is displayed statically after calling block and pointed as a figure |
| inline dynamic      | map is displayed dynamically in aside space |
| block static      | map is displayed as a figure |
| block dynamic      | map is displayed dynamically in aside space |

| property        | description | valueType | defaultValue | restrictedValues | required |
| ------------- |:------------- |:------------- |:------------- |:------------- |:------------- |
|disposition |hDescribes ow to dispose layers ? one on top of another or side by side ? | string |juxtapose|superpose,juxtapose | |
|zoomlevel |The zoom level of the view. |number | | | |
|zoomlatitude |The center latitude of the view. |coordinate | | | |
|zoomlongitude |The center longitude of the view. |coordinate | | | |
|layer |describes a specific layer of the map, working with one source of data and one type of data |objectArray |string | | |
|title (child of layer) |title of a layer |string | |yes |
|latitude (child of layer) |Describes which data field to use for displaying datapoints latitude |accessor | | | |
|longitude (child of layer) |describes which data field to use for displaying datapoints longitude |accessor | | | |
|labels (child of layer) |describes which data field to use for displaying datapoints labels |accessor | | | |
|categories (child of layer) |describes which data field to use for displaying datapoints category (e.g. for colors) |accessor | | | |

### glossary

This contextualizer displays an entity mark (when inline) or cartel display (when block).

| State        | Output description |
| ------------- |:------------- | 
| inline static      | glossary term registration |
| inline dynamic      | glossary term registration |
| block static      | more info as note |
| block dynamic      | text cartel (for instance : display entity picture, ...) |

| property        | description | valueType | defaultValue | restrictedValues | required |
| ------------- |:------------- |:------------- |:------------- |:------------- |:------------- |
| | | | | | |

