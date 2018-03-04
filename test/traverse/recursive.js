import test from 'ava'
import { traverse } from '../../'

test('should recursively visit children nodes', async t => {
  const visitationPath = [
    'Level2a',
    'Level1a',
    'Level2b',
    'Level1b',
    'Root',
  ]

  const visitedPath = []

  await traverse({
    type: 'Root',
    children: () => [{
      pathToChild: 'path',
      child: {
        type: 'Level1a',
        children: () => [{
          pathToChild: 'path',
          child: {
            type: 'Level2a',
            children: () => [],
          },
        }],
      },
    }, {
      pathToChild: 'level1b',
      child: {
        type: 'Level1b',
        children: () => [{
          pathToChild: 'path',
          child: {
            type: 'Level2b',
            children: () => [],
          },
        }],
      },
    }],
  }, {
    visitor: {
      Root: () => visitedPath.push('Root'),
      Level1a: () => visitedPath.push('Level1a'),
      Level1b: () => visitedPath.push('Level1b'),
      Level2a: () => visitedPath.push('Level2a'),
      Level2b: () => visitedPath.push('Level2b'),
    },
  })

  t.deepEqual(visitedPath, visitationPath, 'should visit nodes in order')
})
