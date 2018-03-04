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
  ChildResult,
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
  if (!tree || !tree.type) {
    throw new Error('Tried to traverse invalid node')
  }

  const validate: NodeValidator = options.validate || DefaultNodeValidator
  const visitAll: Walker = options.visitor['*']
  const treePath = new Path(tree, options.parentPath, options.pathToNode)

  if (typeof tree.children !== 'function') {
    throw new Error(`Node of type ${tree.type} is missing implementation for .children() - please provide one`)
  }

  async function subtraverse (list: ChildResult[]): Promise<void> {
    debug('subtraversing: %j', list)

    for (const { pathToChild, child } of list) {
      if (!child) {
        throw new Error(`Missing 'child' when subtraversing children of ${tree.type}`)
      }

      if (!pathToChild) {
        throw new Error(`Missing 'pathToChild' when subtraversing child ${child.type} of ${tree.type}`)
      }

      if (!child.type || !validate(child)) {
        throw new Error(`Node is using an unsupported type: "${child.type}"`)
      }

      debug('traversing subtree: %s', child.type)
      const newChild = await traverse(child, Object.assign({}, options, {
        pathToNode: pathToChild,
        parentPath: treePath,
      }))

      if (newChild !== child) {
        if (newChild) {
          debug('replacing subtree of %s in %s.%s', newChild.type, tree.type, pathToChild)
        } else {
          debug('removing node of type %s from %s', child.type, tree.type)
        }

        set(tree, pathToChild, newChild)
      }
    }
  }

  // traverse the children
  await subtraverse(tree.children())

  // visit current node
  const visit = options.visitor[ tree.type ]
  debug('visiting: %s (%s)', tree.type, !!visit)
  if (visit) {
    await visit(treePath, options.state)
    if (!treePath.node) return
  }

  // allow visit through wildcard
  if (visitAll) {
    await visitAll(treePath, options.state)
    if (!treePath.node) return
  }

  // re-process all unshifts & shifts
  await subtraverse(treePath.added())

  if (!treePath.node.type || !validate(treePath.node)) {
    throw new Error(`Node is using an unsupported type: "${treePath.node.type}"`)
  }

  return treePath.node
}
