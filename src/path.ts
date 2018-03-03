/**
 * @file src/path.ts
 * @copyright 2018-present Karim Alibhai. All rights reserved.
 */

import { Node } from './types'
import { set } from 'lodash'

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
    public parent?: Node,
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

    if (this.parent !== undefined) {
      set(this.parent, this.childPath, undefined)
      verifyNode(this.parent.node)
    }

    return this
  }
}
