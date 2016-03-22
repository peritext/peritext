Figures and data resources
====

# Parameters for resources description and contextualization description

## Models populating through general-to-specific class inheritance-like system

See the *wip* folder models/resourceModels.json.

Individual resources' models are inherited from collective models.

If, for instance, I take the "image" resource model, here is how its resource model should be built :

* first, populate ``image resource`` model with the ``collective.all`` properties
* then, as image is a ``usableResource``, populate ``image resource`` model with the ``collective.usableResource`` properties (overwrite existing if needed)
* then, populate ``image resource`` model with the ``individual.image`` properties (overwrite existing if needed)

## For all

### Resource description props

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
