Modulo documentation | contextualizers (modulo-flavoured markdown) | WIP
=================

# Contextualizer states

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

Consequently, **all contextualizers should have the following params** :

* ``nostatic`` : ignore contextualization in static outputs
* ``nodynamic`` : ignore contextualization in dynamic outputs


Note about figure numerotation : should be numeroted everything which is not a website, shortcitation, or longcitation.

## Smart static contextualizations : repetitive references

When making several reference to the same contextualizer+resource image combo in static mode, figures should not be displayed several times.

## Smart dynamic contextualizations : resource travelling & view transitions

It should be possible to handle an argumentation which "travels" through a data source :
* going from one timestamp to another in a temporal media
* zooming or panning in a map
* changing timespan of a timeline

When switching from one aside to another in these cases of "resource traveling", a transition should be provided.

# Contextualizers models modelling

## Contextualizers types models

* ``description``
* ``categories`` : for inheritance
* ``acceptedResourceTypes`` : Each contextualizer type accepts a specific set of resource types.
* ``properties`` : each contextualizer type model must describe which parameters it can take, what is their value type and whether they are required.


## Contextualizers types properties models

* ``description``
* ``key``
* ``valueType`` : string, number
* ``required`` : required or not
* (not required) ``defaultValue`` : value if the prop is not specified
* (not required) ``possibleValues`` : array of possible values

# Contextualizers' types' description

## webpage

This contextualizers inserts a reference to a website.


| State        | Output description |
| ------------- |:------------- | 
| inline static      | footnote to url |
| inline dynamic      | anchor to website iframe + reference |
| block static      | screenshot of the website + reference |
| block dynamic      | anchor to website iframe + reference |


| property        | description | valueType | defaultValue | possibleValues | required |
| ------------- |:------------- |:------------- |:------------- |:------------- | 
| | | | | | |

## citation

This contextualizer displays the reference to a bibliographic reference, either as a short or long citation.

| State        | Output description |
| ------------- |:------------- | 
| inline static      | short citation |
| inline dynamic      | short citation |
| block static      | long citation/biblio style |
| block dynamic      | long citation/biblio style |

| property        | description | valueType | defaultValue | possibleValues | required |
| ------------- |:------------- |:------------- |:------------- |:------------- | 
| | | | | | |

Note : citation formatting should be resolved with document's ``citationStyle`` param (e.g. : APA)

## imageplayer

This contextualizer displays one or more image resources.

| State        | Output description |
| ------------- |:------------- | 
| inline static      | reference to figure and figure display just after |
| inline dynamic      | anchor to gallery display in aside space |
| block static      | figure and its ref |
| block dynamic      | anchor to gallery display in aside space |

| property        | description | valueType | defaultValue | possibleValues | required |
| ------------- |:------------- |:------------- |:------------- |:------------- | 
| | | | | | |

## videoplayer

This contextualizer displays a video, either from raw video files or from video services (vimeo, youtube).

| State        | Output description |
| ------------- |:------------- | 
| inline static      | link to url in note |
| inline dynamic      | anchor to video display in aside space |
| block static      | poster of the video with reference |
| block dynamic      | anchor to video display in aside space |

| property        | description | valueType | defaultValue | possibleValues | required |
| ------------- |:------------- |:------------- |:------------- |:------------- | 
| | | | | | |


## audioplayer

This contextualizer displays an audio document, either from raw video files or from audio services (soundcloud, etc.).

| State        | Output description |
| ------------- |:------------- | 
| inline static      | link to url in note |
| inline dynamic      | anchor to audio display in aside space |
| block static      | Audio cartel with reference |
| block dynamic      | anchor to audio display in aside space |

| property        | description | valueType | defaultValue | possibleValues | required |
| ------------- |:------------- |:------------- |:------------- |:------------- | 
| | | | | | |


## speechtranscription

This contextualizer displays the transcription of a speech (without media) from a .srt formatted file.

| State        | Output description |
| ------------- |:------------- | 
| inline static      | link to url in note |
| inline dynamic      | text display in aside space |
| block static      | text cartel of the transcription + ref |
| block dynamic      | text display in aside space |

| property        | description | valueType | defaultValue | possibleValues | required |
| ------------- |:------------- |:------------- |:------------- |:------------- | 
| | | | | | |


## sourcecodedisplay

This contextualizer displays a web resource as raw source code.

| State        | Output description |
| ------------- |:------------- | 
| inline static      | link to url in note |
| inline dynamic      | source code display in aside space |
| block static      | text cartel with source code |
| block dynamic      | source code display in aside space |

| property        | description | valueType | defaultValue | possibleValues | required |
| ------------- |:------------- |:------------- |:------------- |:------------- | 
| | | | | | |


## table

This contextualizer displays tabular data as a table.

| State        | Output description |
| ------------- |:------------- | 
| inline static      | table is displayed after current block, and pointed from the anchor |
| inline dynamic      | table is displayed in aside space |
| block static      | tabled is displayed in cartel |
| block dynamic      | table is displayed in aside space |

| property        | description | valueType | defaultValue | possibleValues | required |
| ------------- |:------------- |:------------- |:------------- |:------------- | 
| | | | | | |


## timeline

This contextualizer displays events, eras and timestamped quantitative data, from tabular data.

| State        | Output description |
| ------------- |:------------- | 
| inline static      | timeline is displayed statically after calling block and pointed as a figure |
| inline dynamic      | timeline is displayed dynamically in aside space |
| block static      | timeline is displayed as a figure |
| block dynamic      | timeline is displayed dynamically in aside space |

| property        | description | valueType | defaultValue | possibleValues | required |
| ------------- |:------------- |:------------- |:------------- |:------------- | 
|disposition |how to dispose layers ? one on top of another or side by side ? | string |juxtapose|superpose,juxtapose | |
|dateformat |how dates are formatted for the whole timeline ? |string |yyyy-mm-dd | | |
|layer |describes a specific layer of timeline, working with one source of data and one type of data | object | | | |
|title (child of layer) |title of a layer |string | |yes |
|dateformat (child of layer) | describes how dates are formatted for the given layer|string | | |
|dates (child of layer) |dates to use for positioning events/datapoints/periods beginings |string | | | |
|layertype (child of layer) |what type of data is displayed in the layer ? |string |events|events,periods,metrics | |
|labels (child of layer)|(event layer) describes which datafield to use for naming events or periods |string | | | |
|eventcategories (child of layer)|(event layer) describes which datafield to use for categorizing events or periods |string | | | |
|description (child of layer)|(event layer) describes which datafield to use for describing events or periods |string | | | |
|ends (child of layer) |dates to use for positioning periods ends |string | | | |
|values (child of layer) |(metrics layer) which field to use for quantitizing datapoints |string | | | |


## map

This contextualizer displays geographical data from tabular data.

| State        | Output description |
| ------------- |:------------- |
| inline static      | map is displayed statically after calling block and pointed as a figure |
| inline dynamic      | map is displayed dynamically in aside space |
| block static      | map is displayed as a figure |
| block dynamic      | map is displayed dynamically in aside space |

| property        | description | valueType | defaultValue | possibleValues | required |
| ------------- |:------------- |:------------- |:------------- |:------------- | 
| | | | | | |


## glossary

This contextualizer displays an entity mark or call.

| State        | Output description |
| ------------- |:------------- | 
| inline static      | glossary term registration |
| inline dynamic      | glossary term registration |
| block static      | more info as note |
| block dynamic      | text cartel (for instance : display entity picture, ...) |

| property        | description | valueType | defaultValue | possibleValues | required |
| ------------- |:------------- |:------------- |:------------- |:------------- | 
| | | | | | |




