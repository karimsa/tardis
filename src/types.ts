/**
 * @file src/types.ts
 * @copyright 2018-present Karim Alibhai. All rights reserved.
 */

import { Path } from './path'

export type JSON = {
  [key: string]: any,
}

export type ChildResult = {
  pathToChild: string,
  child: Node,
}

export type ChildrenFinder = () => ChildResult[]
export const DefaultChildrenFinder: ChildrenFinder = function DefaultChildrenFinder () {
  return []
}

export type Node = {
  type: string,
  children: ChildrenFinder,
  toString?: () => string,
  validate?: () => void,
} & JSON

export type SyncWalker = (path: Path, state?: JSON) => void
export type AsyncWalker = (path: Path, state?: JSON) => Promise<void>
export type Walker = SyncWalker | AsyncWalker

export type NodeValidator = (node: Node) => boolean
export const DefaultNodeValidator: NodeValidator = function DefaultNodeValidator () {
  return true
}
