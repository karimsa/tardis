/**
 * @file src/path.ts
 * @copyright 2018-present Karim Alibhai. All rights reserved.
 */

import { set } from 'lodash'
import { ok as assert } from 'assert'

import * as createDebug from 'debug'
const debug = createDebug('tardis')

import { Node, ChildResult } from './types'

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

export type Shifts = {
  [key: string]: Node[],
}

export class Path {
  unshifts: Shifts = {}
  shifts: Shifts = {}

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

  /**
   * Recursively walks up AST to find given parent.
   * @param parentType the type of the parent to search for
   * @returns {Node} the parent node or undefined if none found
   */
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

  /**
   * Adds a node to the start of a container.
   * @param property the property to insert into
   * @param node the node to insert
   */
  unshiftContainer(property: string, node: Node) {
    this.unshifts[property] = this.unshifts[property] || []
    this.unshifts[property].push(node)

    assert(Array.isArray(this.node[property]), 'Could not like an Array-like property to insert into')
    assert(node, 'node is a required property')

    this.node[property].unshift(node)

    return this
  }

  /**
   * Adds a node to the end of a container.
   * @param property the property to insert into
   * @param node the node to insert
   */
  pushContainer(property: string, node: Node) {
    this.shifts[property] = this.shifts[property] || []
    this.shifts[property].push(node)

    assert(Array.isArray(this.node[property]), 'Could not like an Array-like property to insert into')
    assert(node, 'node is a required property')

    this.node[property].push(node)

    return this
  }

  /**
   * Returns the same output as `.children()` but instead
   * of returning all children, it only returns artificially added
   * ones.
   * @returns {ChildResult[]} array of child results
   */
  added(): ChildResult[] {
    const results: ChildResult[] = []

    for (const property in this.unshifts) {
      if (this.unshifts[property] !== undefined) {
        for (let i = 0; i < this.unshifts[property].length; ++ i) {
          results.push({
            pathToChild: `${property}.${i}`,
            child: this.unshifts[property][i],
          })
        }
      }
    }

    for (const property in this.shifts) {
      if (this.shifts[property] !== undefined) {
        for (let i = 0; i < this.shifts[property].length; ++ i) {
          results.push({
            pathToChild: `${property}.${i}`,
            child: this.shifts[property][i],
          })
        }
      }
    }

    return results
  }
}
