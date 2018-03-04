import { traverse as traverseTree } from '../../'

async function traverseHelper(walker) {
  await traverseTree({
    type: 'Root',
    children: () => [],
  }, {
    visitor: {
      Root: (path) => walker('Root', path),
    },
  })

  await traverseTree({
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
      Root: (path) => walker('Root', path),
      Level1a: (path) => walker('Level1a', path),
      Level1b: (path) => walker('Level1b', path),
      Level2a: (path) => walker('Level2a', path),
      Level2b: (path) => walker('Level2b', path),
    },
  })
}

export const traverse = traverseHelper
