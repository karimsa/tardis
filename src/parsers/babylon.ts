/**
 * @file src/parsers/babel.ts
 * @copyright 2018-present Karim Alibhai. All rights reserved.
 */

import {
  File,
  Program,
  ExpressionStatement,
  CallExpression,
  MemberExpression,
  Node as BabylonNode,
  VISITOR_KEYS
} from 'babel-types'
import { get, flatten } from 'lodash'

import {
  ChildrenFinder,
  ChildResult,
  Node as OutNode,
} from '../types'

import * as createDebug from 'debug'
const debug = createDebug('tardis')

function getChildren(node: BabylonNode): ChildResult[] {
  function $(...paths: string[]): ChildResult[] {
    return flatten(paths.map(pathToChild => {
      const child = get(<any>node, pathToChild)

      if (Array.isArray(child)) {
        return child.map((c, index) => ({
          child: c,
          pathToChild: `${pathToChild}.${index}`,
        }))
      }

      if (!child) {
        return []
      }

      return {
        child,
        pathToChild,
      }
    }))
  }

  if (!VISITOR_KEYS[node.type]) {
    return []
  }

  return $(
    ... VISITOR_KEYS[node.type]
  )
}

export function fromBabylon (tree: BabylonNode & { children: ChildrenFinder }): OutNode {
  if (!tree.children) {
    tree.children = () => getChildren(tree)

    for (const { child, pathToChild } of tree.children()) {
      debug('injecting children finder into %s.%s => %s', tree.type, pathToChild, child.type)
      fromBabylon(<any>child)
    }
  }

  return tree
}
