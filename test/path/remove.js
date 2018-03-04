import test from 'ava'
import { traverse } from '../../'

test('should be able to remove root node', async t => {
  const ast = await traverse({
    type: 'Root',
    children: () => [],
  }, {
    visitor: {
      Root (path) {
        path.remove()
      },
    },
  })

  t.is(ast, undefined)
})

test('should be able to remove misc child node', async t => {
  const root = {
    type: 'Root',
    child: {
      type: 'Child',
      children: () => [],
    },
    children: () => root.child ? [{
      pathToChild: 'child',
      child: root.child,
    }] : [],
  }

  const ast = await traverse(root, {
    visitor: {
      Child (path) {
        path.remove()
      },
    },
  })

  t.is(ast.type, 'Root')
  t.is(ast.child, undefined)
  t.is(ast.children().length, 0)
})
