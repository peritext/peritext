Work In Progress
===

# Coding conventions [WIP]

CSS rules :

* Follow the [Package-Component-Modifier](https://github.com/unicorn-standard/pacomo) convention for consistently allowing user-generated custom css

# Testing

Unit tests are written in a ``test`` folder which is a mirror of the ``src`` folder which contains the actual source code. Please **systematically** write unit-tests along with your contributions.

# Committing

Be sure to use commitizen (``git cz`` instead of ``git commit``) while contributing to Peritext, in order to document your commits in the clearest way.

Peritext uses a ``precommit`` hook to test, lint, document & check test coverage of your code before allowing a commit to happen: these precautions are aimed at keeping the project clean and easy to maintain !
