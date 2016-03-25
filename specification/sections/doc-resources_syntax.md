Resources and contextualization
====

# Resources description

## Models populating through general-to-specific class inheritance-like system

See the *wip* folder models/resourceModels.json.

Individual resources' models are inherited from collective models.

If, for instance, I take the "image" resource model, here is how its resource model should be built :

* first, populate ``image resource`` model with the ``collective.all`` properties
* then, as image is a ``usableResource``, populate ``image resource`` model with the ``collective.usableResource`` properties (overwrite existing if needed)
* then, populate ``image resource`` model with the ``individual.image`` properties (overwrite existing if needed)


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

A contextualization is summoned every time the pattern ``[]()`` is found.
```
//inline contextualization
Check out [this resource](@my_resource_cite_key)

//block contextualization
![this resource](@my_resource_cite_key)

```

When this is done, default contextualization params are automatically provided to specify a way to display this contextualization in the document (as an aside-caller, as a footnote caller, as a html-replacement caller (for bib references)).

However, it is also possible to provide some params to specify how to contextualize the resource in the document. This is done by **following or preceding the resource contextualization call with a bibtex contextualization object.** Example :

```
//possible params location #1
![this resource](@my_resource_cite_key)
{params}

//possible params location #2
{params}
![this resource](@my_resource_cite_key)

//possible params location #3
![this resource](@my_resource_cite_key){params}

//possible params location #4
{params}![this resource](@my_resource_cite_key)
```

## Contextualizations syntax

There are two ways to describe a contextualization :
* in one time, by describing the contextualization just in its context
* in two times, by describing contextualization separately, as a bib resource

```
// Separate description of a contextualization :

@contextualization{my_timeline,
    figure={timeline},
    columns={layers={@source.data.dates,@source.data.descriptions}}
}

// Inline description of a contextualization :

![this resource](@my_resource_cite_key){figure={timeline},columns={layers={@source.data.dates,@source.data.descriptions}}}
```

### Nested bibTeX objects expressions

Modulo extends the principle of nesting in bibTex in order to allow for complex parameters.

```
This bibtex contextualization description :
@contextualization{my_timeline,
    columns={layers={data=@source.data.dates,tooltips=@source.data.descriptions}}
}

Would become this :
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

@source.metadata.title //accesses the title of the resource
@source['metadata']['title'] //accesses the title of the resource (other syntax)

@source.data.keys.date //access the "date" column of an array specified by the ressource

// ...

```

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

# Recension of parameters used in the former Modulo syntax

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
