Figures and data resources
====

# Parameters for resources description and contextualization description

## For all

### Resource description

<table>
    <tr>
        <thead>
            <td>Name</td>
            <td>Mandatory</td>
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
        
</table>

### Resource contextualization

<table>
    <tr>
        <thead>
            <td>Name</td>
            <td>Mandatory</td>
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


## Timeline

## Sankey

## Network

## Dicto

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
    - settiongs
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
