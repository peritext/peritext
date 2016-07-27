Work In Progress
===

# Pull requests : coding conventions [WIP]

## CSS conventions

### Class names and PaCoMo convention

Peritext documents are aimed at being as customizable as possible through user-generated css rues. Therefore, rich & consistent CSS class names are very important.

Peritext complies to the [Package-Component-Modifier](https://github.com/unicorn-standard/pacomo) convention for consistently allowing user-generated custom css.

Containing elements of a component *must* have the modifier ``container``. 

As Peritext components are sometimes composed of other meaningful elements, contained elements *may* follow the convention ``Package-Component-ElementType`` or ``Package-Component-ElementType-Modifier`` if needed.

Examples :

An ``InlineCitation`` component root *must* have the class ``peritext-inline-citation-container``.

The ``quote-pages`` section of a citation component *must* have the class ``peritext-citation-quote-pages``, and *may* have an additionnal class ``peritext-citation-quote-pages-[modifier]`` if needed. 

### CSS vs Radium

Interface elements and some layout elements of webversion are styled with inline-css-generator ``Radium`` library. As they override systematically class-based rules, inline-rules *must* be used only for elements that should not be customizable by authors/users.

## Testing

Unit tests are written in a ``test`` folder which is a mirror of the ``src`` folder which contains the actual source code. Please **systematically** write unit-tests along with your contributions.

## Committing

Please use commitizen (``git cz`` instead of ``git commit``) while contributing to Peritext, in order to document your commits in the clearest way.

Please also document any new piece of code - Peritext uses [ESDoc](https://esdoc.org/) as a documentation generator.

In order to keep the project clean and easy to develop/maintain, Peritext uses a ``precommit`` hook to test, lint, update translation files, generate automatic documentation & check the test coverage of the updated project before allowing a commit to happen.
