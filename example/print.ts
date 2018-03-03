import fs from 'fs'
import babylon from 'babylon'
import { transpile, fromBabylon } from '../'

const jsFile = `
function sayHello () {
  console.log('hello, world')
}

sayHello()
`

transpile(jsFile, {
  parser (code) {
    return fromBabylon(babylon.parse(code))
  },

  visitor: {
    MemberExpression (path) {
      if (path.node.object.name === 'console' && path.node.property.name === 'log') {
        path.replaceWith({
          type: 'Identifier',
          name: 'print',
          children: () => [],
        })
      }
    },
  },

  generator: {
    File: (file) => file.program.toString(),
    Program: (program) => program.body.map(b => b.toString()).join('\n'),
    StringLiteral: (string) => `'${string.value}'`,
    Identifier: (id) => id.name,
    ExpressionStatement: (es) => es.expression.toString(),
    CallExpression: (fn) => `${fn.callee}(${fn.arguments.join(', ')})`,
    FunctionDeclaration: (fn) => `def ${fn.id.name}(${fn.params.join(', ')}):\n${fn.body}`,
    BlockStatement: (block) => block.body.map(line => `  ${line}`).join(', '),
  },
})
  .then(console.log)
  .catch(console.error)
