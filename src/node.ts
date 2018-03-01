/**
 * @file src/node.ts
 * @copyright 2018-present Karim Alibhai. All rights reserved.
 */

import { Path } from './path'
import { SyncWalker, AsyncWalker } from './types'

export type JSON = {
  [key: string]: any,
}

export type Visitor = {
  [key: string]: SyncWalker | AsyncWalker,
}
