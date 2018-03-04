<p align="center">
  <img src=".github/tardis.png">
</p>

<h1 align="center">TARDIS</h1>

<p align="center">
  <a href="https://travis-ci.org/karimsa/tardis">
    <img src="https://travis-ci.org/karimsa/tardis.svg?branch=master" />
  </a>

  <a href="https://codecov.io/gh/karimsa/tardis">
    <img src="https://codecov.io/gh/karimsa/tardis/branch/master/graph/badge.svg" />
  </a>

  <a href="https://greenkeeper.io/">
    <img src="https://badges.greenkeeper.io/karimsa/tardis.svg">
  </a>
</p>

<p align="center">
  Language-agnostic transpiler library based on babel.
</p>

## Motivation

Babel is a very powerful & highly effective tool for transpiling JavaScript. But unfortuanately, due to
its extensive architecture, it has grown to be a very large project and so the contributors are not currently
looking to extend it any further to support greater syntax. That is a completely fair decision considering the
size of their project but for some projects that I am working on, I thought it would be nice to utilize their
architecture towards transpiling between languages other than JavaScript. So this project was created as a
stripped down version of babel that supports traversal and AST manipulation but is agnostic to things like
node types, parser, and generator - all of which can be manually specified.

## Usage

Install it: `npm install --save-dev @karimsa/tardis`.

```javascript
import { parse } from 'babylon'
import { Node as BabylonNode } from 'babel-types'
import { transpile, fromBabylon, babelGenerator } from '../src'

transpile(`
  console.log('hello')
`, {
  parser (code) {
    const ast: BabylonNode = parse(code)

    // the 'fromBabylon' helper takes an AST from babylon and adds tardis extensions
    // using babel-types
    return fromBabylon(ast)
  },

  visitor: {
    MemberExpression (path) {
      // the basic requirements for a node are 'type' and 'children'
      // everything else is optional + it can be a simple object, does not need to be created
      // from a class
      path.replaceWith({
        type: 'Identifier',
        name: 'print',
        children: () => [],
      })
    }
  },

  // the generator is a simple visitor that receives each node instead of a nodePath
  // and should return a string for the node
  // 'toJS' is a helper that wraps babel-generator to produce javascript code from nodes
  // but allows overrides
  generator: babelGenerator,
})
  .then(console.log)
  .catch(console.error)

```

Tardis offers APIs for just simple tree traversal as well as transpiling which is just a wrapper
around the traversal API that dispatches generation on the root node (which should propagate through
the tree if the tree is created properly).

The transpiler & traversal APIs are both asynchronous to allow for asynchronous walking of the tree.
This isn't particularly efficient but it allows you to have async checks for how you want to do node
replacements.

*Some examples are provided in [examples/](examples).*

## Goals

 * Allow usage of existing babel plugins with minimal addition effort
  * This would be an effective way of getting to feature-complete on the NodePath class
 * Add auto-sourcemap support by watching incoming location + creating a outgoing location from the generator

## License

Copyright &copy; 2018-present Karim Alibhai.

Licensed under MIT license.
