/**
 * @file src/path.ts
 * @copyright 2018-present Karim Alibhai. All rights reserved.
 */

import { Node } from './types'

export class Path {
  constructor (
    public node: Node,
  ) {}

  replaceWith (node: Node) {
    this.node = node
  }
}
