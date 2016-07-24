Resources and contextualization
====

# Resources description

## Models populating through general-to-specific model inheritance system

Resource models are described through a tree structure rooted in generic properties and growing to more and more resource specific properties.

See the *wip* folder models/resourceModels.json.

Individual resources' models are inherited from their relative collective models.

Let's inspect for instance, the "image" resource model. It is on top of the following models inheritance tree : ``collective ==> usableResource ==> imageResource``.

Here is how its resource model should therefore be built :

* first, populate ``image resource`` model with the ``collective.all`` properties
* then, as image is a ``usableResource``, populate ``image resource`` model with the ``collective.usableResource`` properties (overwrite inherited properties if needed)
* then, populate ``image resource`` model with the ``individual.image`` properties (overwrite inherited properties if needed)


## Resource description props

<table>
    <tr>
        <thead>
            <td>Name</td>
            <td>Mandatory?</td>
            <td>Description</td>
        </thead>
    </tr>

    <tr>
        <td>Title</td>
        <td></td>
        <td></td>
    </tr>

    <tr>
        <td>Description</td>
        <td></td>
        <td></td>
    </tr>

    <tr>
        <td>Url</td>
        <td></td>
        <td>Note : there should be a specific syntax for ``assets``-based resources (eg : ``@assets/``) data and a related url-resolver middleware</td>
    </tr>
        
</table>

# Resource contextualization

A contextualization is summoned at all time if the pattern ``[]()`` is found.
The presence of a ``linebreak`` followed by a ``!`` defines it as block contextualization, if not it is a inline contextualization.

```
//inline contextualization
Check out [this resource](@my_resource_cite_key)

//block contextualization
![this resource](@my_resource_cite_key)

```

*Note : in regular markdown these two notations would be dedicated to coding respectively hyperlinks and images. However, as one of the principles of Peritext is to keep external web two clicks away and to force writers to rigorously describe all external resources they are using (including links and images), there is no conflict between regular markdown's notation and peritext markdown's notation : images or links are not supposed to be specifiable directly in the linear markdown contents, so their notation can be used for something else, inline and block contextualizations.*

Default contextualization params are automatically provided to specify a way to display a resource in the document (as an aside-caller, as a footnote caller, as a html-replacement caller (for bib references), ... ).

However, it is also possible to provide some params to specify more precisely how to contextualize the resource in the document (for instance : specify a page number when contextualizing a bibliographical resource, call a visualization module when contextualizing a data resource, ...). This is done by **following the resource contextualization call with a bibtex contextualizer object.** Example :

```
//possible params location #1
![this resource](@my_resource_cite_key)
{params}

//possible params location #2
![this resource](@my_resource_cite_key){params}

```

## Contextualizers syntax

There are two ways to describe a contextualizer :
* **inline contextualizer description** : the contextualizer is described directly in the markdown file, just at the location in which it is used
* **separate contextualizer description** : contextualizer is described separately as a bib resource, and called in the contextualization through its citekey

```
// Separate description of a contextualization :

//meta.bib :
@contextualizer{my_timeline,
    figure={timeline},
    columns={layers={@source.data.dates,@source.data.descriptions}}
}

//content.md

Look at this [vis](@vis_data){my_timeline}

//
=============================
//

// Inline description of a contextualization :

![this resource](@my_resource_cite_key){
    figure={timeline},
    columns={layers={@source.data.dates,@source.data.descriptions}}
}
```

### Nested bibTeX objects expressions

When dealing with contextualizers such as datavis-related contextualizations, contextualization params can become complex. Therefore, Peritext extends the principle of nesting in bibTex in order to allow for complex parameters.

```
This bibtex contextualization description :
@contextualization{my_timeline,
    columns={layers={data=@source.data.dates,tooltips=@source.data.descriptions}}
}

Would become this in json :
{
    //...
    columns : {
        layers : {
            data : '@source.data.dates',
            tooltip : '@source.data.dates'
        }
    }
}
```


## Contextualization models

A contextualization model is defined by resource types (or combo of resources type) and the related accepted contextualization types and parameters.

Contextualization resources+type combo should all correspond a default params object.

## Accessing resource properties

For a lot of cases, contextualization will need to specify what parts of the resource data should be used.
This is done by calling the resource citeKey followed by javascript object-like access properties :

```

@resource.metadata.title //accesses the title of the resource
@resource['metadata']['title'] //accesses the title of the resource (other syntax)

@resource.data.keys.date //access the "date" column of an array specified by the ressource

// ...

```

The ``@resource`` assertion is handled with the related resource at the moment of contextualization. If the writer calls the same contextualizer on several resources, the ``@resource`` assertion will correspond to the related resource for each contextualization.

### Resource contextualization props

<table>
    <tr>
        <thead>
            <td>Name</td>
            <td>Mandatory?</td>
            <td>Description</td>
        </thead>
    </tr>

    <tr>
        <td>Title</td>
        <td>Yes</td>
        <td></td>
    </tr>

    <tr>
        <td>Caption</td>
        <td>No</td>
        <td></td>
    </tr>

    <tr>
        <td>Quote</td>
        <td>No</td>
        <td></td>
    </tr>

    <tr>
        <td>screen-only</td>
        <td>No</td>
        <td>To specify if the figure is supposed not to be printed</td>
    </tr>

    <tr>
        <td>print-only</td>
        <td>No</td>
        <td>To specify if the figure is supposed not to be displayed in interactive version</td>
    </tr>
</table>

# Recension of parameters used in the former Peritext syntax

## For all

* type
* caption
* printImage
* quote
* noprint

## Timeline

* columns -> layer
* dateformat
* begin date
* end date
* columns
    - layers
        + data
        + type (events | metrics)
        + models
            * for events
                - date
                - end
                - title
                - desc
            * for metrics
                - dateKey
                - value
        + dateformat
        + tooltip
        + (for metrics) : unit
        + title

## Network

* background
* data
* colors
    - keyAttribute
    - specialColors
        + events
        + hash
    - default
* filters
    - nameActive
    - nameInactive
    - hide
        + keyType
        + keyAttribute
        + value
    - active
    - settings
        + labelThreshold
        + drawEdges
        + drawNodes
        + labelSizeRatio

## Sankey

* sankeytype (questionnaire | ??)
* data
* keys
    - (list of keys to proceded)

## Dicto

* data
* cut

## Iframe

* url
* always_visible
