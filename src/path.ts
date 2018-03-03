/**
 * @file src/path.ts
 * @copyright 2018-present Karim Alibhai. All rights reserved.
 */

import { set } from 'lodash'
import * as createDebug from 'debug'
const debug = createDebug('tardis')

import { Node } from './types'

function verifyNode(node: Node) {
  if (typeof node.type !== 'string' || !node.type) {
    throw new Error('Node is missing a valid type')
  }

  if (typeof node.children !== 'function') {
    throw new Error(`Invalid node of type ${node.type}: missing a valid children function`)
  }

  if (typeof node.toString !== 'function' || node.toString === {}.toString) {
    node.toString = () => {
      throw new Error(
        `Invalid node of type ${node.type}: missing a valid toString() function - will not generate`
      )
    }
  }

  if (typeof node.validate === 'function') {
    node.validate()
  }
}

export class Path {
  constructor (
    public node: Node,
    public parentPath?: Path,
    public childPath?: string
  ) {
    verifyNode(node)
  }

  /**
   * Replaces a node with a substitute node in its parent.
   * @param node substitute node
   * @returns {Path} this for chaining
   */
  replaceWith(node: Node): Path {
    verifyNode(node)
    this.node = node
    return this
  }

  /**
   * Removes the current node from its parent.
   * @returns {Path} this for chaining
   */
  remove(): Path {
    this.node = undefined

    if (this.parentPath !== undefined) {
      set(this.parentPath.node, this.childPath, undefined)
      verifyNode(this.parentPath.node)
    }

    return this
  }

  findParent(parentType: string): Node {
    debug('checking %s node for parent of %s', this.node.type, parentType)

    if (!this.parentPath) {
      return
    }

    if (this.parentPath.node.type === parentType) {
      return this.parentPath.node
    }

    return this.parentPath.findParent(parentType)
  }
}
