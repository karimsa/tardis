import test from 'ava'
import { traverse } from '../../'

test('should be able to find immediate parent which is root', async t => {
  t.plan(2)

  const ast = await traverse({
    type: 'Root',
    children: () => [{
      pathToChild: 'child',
      child: {
        type: 'Child',
        children: () => [],
      },
    }],
  }, {
    visitor: {
      Child (path) {
        const root = path.findParent('Root')

        t.truthy(root)
        t.is(root.type, 'Root')
      },
    },
  })
})

test('should be able to find immediate parent which is not root', async t => {
  t.plan(2)

  const tree = {
    type: 'Root',
    child: {
      type: 'Child',
      grandChild: {
        type: 'GrandChild',
        children: () => [],
      },
      children: () => [{
        pathToChild: 'grandChild',
        child: tree.child.grandChild,
      }],
    },
    children: () => [{
      pathToChild: 'child',
      child: tree.child,
    }],
  }

  const ast = await traverse(tree, {
    visitor: {
      GrandChild (path) {
        const parent = path.findParent('Child')

        t.truthy(parent)
        t.is(parent.type, 'Child')
      },
    },
  })
})

test('should be able to find root from grandchild', async t => {
  t.plan(2)

  const ast = await traverse({
    type: 'Root',
    children: () => [{
      pathToChild: 'child',
      child: {
        type: 'Child',
        children: () => [{
          pathToChild: 'grandChild',
          child: {
            type: 'GrandChild',
            children: () => [],
          },
        }],
      },
    }],
  }, {
    visitor: {
      GrandChild (path) {
        const parent = path.findParent('Root')

        t.truthy(parent)
        t.is(parent.type, 'Root')
      },
    },
  })
})
