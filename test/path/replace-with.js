import test from 'ava'
import { traverse } from '../../'

test('should be able to replace root node', async t => {
  const ast = await traverse({
    type: 'Root',
    children: () => [],
  }, {
    visitor: {
      Root (path) {
        path.replaceWith({
          type: 'ReplacedRoot',
          children: () => [],
        })
      },
    },
  })

  t.is(ast.type, 'ReplacedRoot')
})

test('should be able to replace misc child node', async t => {
  const root = {
    type: 'Root',
    child: {
      type: 'Child',
      children: () => [],
    },
    children: () => [{
      pathToChild: 'child',
      child: root.child,
    }],
  }

  const ast = await traverse(root, {
    visitor: {
      Child (path) {
        path.replaceWith({
          type: 'ReplacedChild',
          children: () => [],
        })
      },
    },
  })

  t.is(ast.type, 'Root')
  t.is(ast.child.type, 'ReplacedChild')
  t.is(ast.children().length, 1)
  t.deepEqual(ast.children()[0].child, ast.child)
})
