/**
 * @file src/path.ts
 * @copyright 2018-present Karim Alibhai. All rights reserved.
 */

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
}

export class Path {
  constructor (
    public node: Node,
  ) {
    verifyNode(node)
  }

  replaceWith (node: Node) {
    verifyNode(node)
    this.node = node
  }
}
