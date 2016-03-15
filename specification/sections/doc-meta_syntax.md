Modulo documentation | metadata files syntax | WIP
=================

# Global considerations

# Syntax pattern

Meta files are composed of plain text - for which each property is separated by others through a linebreak plus '*' .

Model:
```
meta property one
*
meta property two
*
metadata property three

this property spreads 
on several lines
*
metadata property four
```

Then each metadata item is composed of at least three parts, that are separated with the ':' symbol.

* first part describes the domain of the meta property (example: "general", "dublincore", "twitter", ...)
* second part represents the key of the property to specify (example: "title")
* third properties
* additional properties can be specified with additional ':' when required (example : "dublincore:creator:author:Popol") - if not required by the 

Model:
```
first property domain:first property key:first property value
*
second property domain:second property key:second property value
```

# Properties propagation through folders

By default, all contentRoot's metaproperties are disseminated to the children parts.

To unset an inherited meta property, it should be done by specifying no value (example : "twitter:card:"") or by preceding the meta property with "unset " (example : "unset dublincore:author:popol").

# Properties dissemination

Modulo is supposed to be smart and disseminate similar metadata accross metadata domains if not specified otherwise. For example, the "title" property should automatically spread to "dublincore:title", "og:title" ... if not specified otherwise later on in the metadata file.


# Custom properties

To provide for additional/uncharted metadata specifying, the writer should also be able to specify templates from scratch.

They will be treated as follows :
```
domain:property:value

becomes :

<meta name="property" name="value"/>
```

# Internal metadata

Need for metadata that does not translates necessarily to a `<meta>` tag (e.g. : order of parts, or hierarchical level).

Exemple of metadata properties :
* after [that section]'s slug
* after [that section]'s title
* hierarchical level of the section

# Metadata API

## General metadata

| type       | key                | keySubstitution | value type                             | value example                                                    | default value        | necessity | optional value                                | scopes | propagates to | input example        | output example                                 | ref                                                      | pattern | 
|------------|--------------------|-----------------|----------------------------------------|------------------------------------------------------------------|----------------------|-----------|-----------------------------------------------|--------|---------------|----------------------|------------------------------------------------|----------------------------------------------------------|---------| 
| twitter    | image              |                 | string                                 | https://farm6.staticflickr.com/5510/14338202952_93595258ff_z.jpg |                      |           |                                               | all    |               |                      |                                                |                                                          |         | 
| general    | slug               |                 | string                                 | chapter-1                                                        | slugify(folder name) |           |                                               |        |               |                      |                                                |                                                          |         | 
| general    | title              |                 | string                                 | My title                                                         |                      |           |                                               |        |               |                      |                                                |                                                          |         | 
| general    | subtitle           |                 | string                                 | My subtitle                                                      |                      |           |                                               |        |               |                      |                                                |                                                          |         | 
| general    | langage            |                 | string                                 | fr_FR                                                            | en_EN                |           |                                               |        |               |                      |                                                |                                                          |         | 
| general    | creator            |                 | string                                 | Robin de Mourat                                                  |                      |           |                                               |        |               |                      |                                                |                                                          |         | 
| general    | public             |                 | boolean                                | false                                                            | true                 |           |                                               |        |               |                      |                                                |                                                          |         | 
| general    | level              |                 | number                                 | 2                                                                | 1                    |           |                                               | part   |               |                      |                                                |                                                          |         | 
| twitter    | card               |                 | summary|player|app|summary-large-image | summary                                                          | summary              | required  |                                               | all    |               | twitter:card:summary | <meta name="twitter:card" content="summary" /> |                                                          |         | 
| twitter    | site               |                 | string(url)                            | @robindemourat                                                   |                      |           |                                               | all    |               |                      |                                                |                                                          |         | 
| twitter    | title              |                 | string                                 | My doc                                                           |                      | required  |                                               | all    |               |                      |                                                |                                                          |         | 
| twitter    | description        |                 | string                                 | My doc is cool                                                   |                      | required  |                                               | all    |               |                      |                                                |                                                          |         | 
| opengraph  | title              |                 |                                        |                                                                  |                      |           | lang(example : fr will give xml:lang= » fr ») |        |               |                      |                                                | http://ogp.me                                            |         | 
| opengraph  | type               |                 |                                        |                                                                  |                      |           |                                               |        |               |                      |                                                | http://ogp.me                                            |         | 
| opengraph  | image              |                 |                                        |                                                                  |                      |           |                                               |        |               |                      |                                                | http://ogp.me                                            |         | 
| opengraph  | url                |                 |                                        |                                                                  |                      |           |                                               |        |               |                      |                                                | http://ogp.me                                            |         | 
| opengraph  | description        |                 |                                        |                                                                  |                      |           |                                               |        |               |                      |                                                | http://ogp.me                                            |         | 
| opengraph  | locale             |                 |                                        |                                                                  |                      |           |                                               |        |               |                      |                                                | http://ogp.me                                            |         | 
| opengraph  | site_name          |                 |                                        |                                                                  |                      |           |                                               |        |               |                      |                                                | http://ogp.me                                            |         | 
| opengraph  | published_time     |                 |                                        |                                                                  |                      |           |                                               |        |               |                      |                                                | http://ogp.me                                            |         | 
| opengraph  | modified_time      |                 |                                        |                                                                  |                      |           |                                               |        |               |                      |                                                | http://ogp.me                                            |         | 
| opengraph  | expiration_time    |                 |                                        |                                                                  |                      |           |                                               |        |               |                      |                                                | http://ogp.me                                            |         | 
| opengraph  | author             |                 |                                        |                                                                  |                      |           |                                               |        |               |                      |                                                | http://ogp.me                                            |         | 
| opengraph  | section            |                 |                                        |                                                                  |                      |           |                                               |        |               |                      |                                                | http://ogp.me                                            |         | 
| opengraph  | tag                |                 |                                        |                                                                  |                      |           |                                               |        |               |                      |                                                | http://ogp.me                                            |         | 
| opengraph  | Book-author        |                 |                                        |                                                                  |                      |           |                                               |        |               |                      |                                                | http://ogp.me                                            |         | 
| opengraph  | Book-isbn          |                 |                                        |                                                                  |                      |           |                                               |        |               |                      |                                                | http://ogp.me                                            |         | 
| opengraph  | book-release_date  |                 |                                        |                                                                  |                      |           |                                               |        |               |                      |                                                | http://ogp.me                                            |         | 
| opengraph  | book-tag           |                 |                                        |                                                                  |                      |           |                                               |        |               |                      |                                                | http://ogp.me                                            |         | 
| opengraph  | website            |                 |                                        |                                                                  |                      |           |                                               |        |               |                      |                                                | http://ogp.me                                            |         | 
| opengraph  | profile-first-name |                 |                                        |                                                                  |                      |           |                                               |        |               |                      |                                                | http://ogp.me                                            |         | 
| opengraph  | profile-last-name  |                 |                                        |                                                                  |                      |           |                                               |        |               |                      |                                                | http://ogp.me                                            |         | 
| dublincore | title              |                 |                                        |                                                                  |                      |           |                                               |        |               |                      |                                                | http://www.metatags.org/dublin_core_metadata_element_set |         | 
| dublincore | creator            |                 |                                        |                                                                  |                      |           |                                               |        |               |                      |                                                | http://www.metatags.org/dublin_core_metadata_element_set |         | 
| dublincore | subject            |                 |                                        |                                                                  |                      |           |                                               |        |               |                      |                                                | http://www.metatags.org/dublin_core_metadata_element_set |         | 
| dublincore | description        |                 |                                        |                                                                  |                      |           |                                               |        |               |                      |                                                | http://www.metatags.org/dublin_core_metadata_element_set |         | 
| dublincore | publisher          |                 |                                        |                                                                  |                      |           |                                               |        |               |                      |                                                | http://www.metatags.org/dublin_core_metadata_element_set |         | 
| dublincore | contributors       |                 |                                        |                                                                  |                      |           |                                               |        |               |                      |                                                | http://www.metatags.org/dublin_core_metadata_element_set |         | 
| dublincore | date               |                 |                                        |                                                                  |                      |           |                                               |        |               |                      |                                                | http://www.metatags.org/dublin_core_metadata_element_set |         | 
| dublincore | type               |                 |                                        |                                                                  |                      |           |                                               |        |               |                      |                                                | http://www.metatags.org/dublin_core_metadata_element_set |         | 
| dublincore | format             |                 |                                        |                                                                  |                      |           |                                               |        |               |                      |                                                | http://www.metatags.org/dublin_core_metadata_element_set |         | 
| dublincore | identifier         |                 |                                        |                                                                  |                      |           |                                               |        |               |                      |                                                | http://www.metatags.org/dublin_core_metadata_element_set |         | 
| dublincore | source             |                 |                                        |                                                                  |                      |           |                                               |        |               |                      |                                                | http://www.metatags.org/dublin_core_metadata_element_set |         | 
| dublincore | langage            |                 |                                        |                                                                  |                      |           |                                               |        |               |                      |                                                | http://www.metatags.org/dublin_core_metadata_element_set |         | 
| dublincore | relation           |                 |                                        |                                                                  |                      |           |                                               |        |               |                      |                                                | http://www.metatags.org/dublin_core_metadata_element_set |         | 
| dublincore | coverage           |                 |                                        |                                                                  |                      |           |                                               |        |               |                      |                                                | http://www.metatags.org/dublin_core_metadata_element_set |         | 
| dublincore | rights             |                 |                                        |                                                                  |                      |           |                                               |        |               |                      |                                                | http://www.metatags.org/dublin_core_metadata_element_set |         | 

