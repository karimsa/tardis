/**
 * @file src/traverse.ts
 * @copyright 2018-present Karim Alibhai. All rights reserved.
 */

import { Path } from './path'
import { Visitor } from './node'
import {
  Node,
  Walker,

  ChildrenFinder,
  DefaultChildrenFinder,

  NodeValidator,
  DefaultNodeValidator,
} from './types'

import { set } from 'lodash'
import * as createDebug from 'debug'
const debug = createDebug('tardis')

export type TraversalOptions = {
  visitor: Visitor,
  validate?: NodeValidator,
  state?: any,
  pathToNode?: string,
  parentPath?: Path,
}

export async function traverse(tree: Node, options: TraversalOptions): Promise<Node> {
  const validate: NodeValidator = options.validate || DefaultNodeValidator
  const visitAll: Walker = options.visitor['*']
  const treePath = new Path(tree, options.parentPath, options.pathToNode)

  if (typeof tree.children !== 'function') {
    throw new Error(`Node of type ${tree.type} is missing implementation for .children() - please provide one`)
  }

  for (const { pathToChild, child } of tree.children()) {
    if (!child.type || !validate(child)) {
      throw new Error(`Node is using an unsupported type: "${child.type}"`)
    }

    debug('traversing subtree: %s', child.type)
    const newChild = await traverse(child, Object.assign({
      pathToNode: pathToChild,
      parentPath: treePath,
    }, options))
    debug('replacing subtree of %s in %s.%s', newChild.type, tree.type, pathToChild)
    set(tree, pathToChild, newChild)
  }

  const visit = options.visitor[ tree.type ]

  debug('visiting: %s (%s)', tree.type, !!visit)

  if (visit) {
    await visit(treePath, options.state)
  }
  
  if (treePath.node && visitAll) {
    await visitAll(treePath, options.state)
  }

  if (treePath.node && (!treePath.node.type || !validate(treePath.node))) {
    throw new Error(`Node is using an unsupported type: "${treePath.node.type}"`)
  }

  return treePath.node
}
