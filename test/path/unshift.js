import test from 'ava'
import { traverse } from '../../'

test('should be able to unshift into container', async t => {
  t.plan(4)

  const root = {
    type: 'Root',
    child: [{
      type: 'Child',
      children: () => [],
    }],
    children: () => root.child.map((child, index) => ({
      pathToChild: `child.${index}`,
      child,
    })),
  }

  const ast = await traverse(root, {
    visitor: {
      Root (path) {
        path.unshiftContainer('child', {
          type: 'InsertedNode',
          children: () => [],
        })
      },

      InsertedNode (path) {
        t.is(path.node.type, 'InsertedNode')
      },
    },
  })

  t.is(root.child.length, 2)
  t.is(root.child[0].type, 'InsertedNode')
  t.is(root.child[1].type, 'Child')
})
