Connectors are an interface between a Modulo engine and its data sources. They consistently expose an low-level API allowing them to become content, assets or annotations data sources.

Flat-file data connectors (for contents and assets data sources) should handle the following operations :
* create a file or folder
* read a file or folder
* update a file or folder
* delete a file or folder

They should return data as an ``fsTree``, which is an abstraction of some flatfile content.

They should all be able to perform these operations with maximum security.


