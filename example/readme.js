const { transpile, fromBabylon, babelGenerator } = require('../')
const babylon = require('babylon')

transpile(`
  console.log('hello')
`, {
  parser (code) {
    // the 'fromBabylon' helper takes an AST from babylon and adds tardis extensions
    // using babel-types
    return fromBabylon(babylon.parse(code))
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
