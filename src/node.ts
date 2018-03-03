/**
 * @file src/node.ts
 * @copyright 2018-present Karim Alibhai. All rights reserved.
 */

import { Path } from './path'
import { Node } from './types'
import { JSON, Walker, AsyncWalker } from './types'

export type Visitor = {
  [key: string]: Walker,
}

export type Generator = {
  [key: string]: (node: Node) => string,
}

function runWalker (walker: Walker, path: Path, state?: JSON): Promise<void> {
  if (<AsyncWalker>walker) {
    return (<AsyncWalker>walker)(path, state)
  }

  return new Promise(function syncWalker (resolve, reject) {
    try {
      resolve(walker(path, state))
    } catch (err) {
      reject(err)
    }
  })
}

export function mergeWalkers (... walkers: Walker[]): Walker {
  return function mergedWalker (path: Path, state?: JSON): Promise<void> {
    return Promise.all(walkers.map(function (walker) {
      return runWalker(walker, path, state)
    })).then(function () {
      // discard any value from coming down
      return
    })
  }
}

export function mergeVisitors (... visitors: Visitor[]): Visitor {
  const visitor: Visitor = {}

  for (const mergableVisitor of visitors) {
    for (const nodeType in mergableVisitor) {
      if (mergableVisitor.hasOwnProperty(nodeType)) {
        if (visitor[nodeType]) {
          visitor[nodeType] = mergeWalkers(visitor[nodeType], mergableVisitor[nodeType])
        } else {
          visitor[nodeType] = mergableVisitor[nodeType]
        }
      }
    }
  }

  return visitor
}
