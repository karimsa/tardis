/**
 * @file src/transpile.ts
 * @copyright 2018-present Karim Alibhai. All rights reserved.
 */

import { Path } from './path'
import { Node } from './types'
import { Visitor, mergeVisitors } from './node'
import { traverse } from './traverse'

import * as createDebug from 'debug'
const debug = createDebug('tardis')

export type Generator = {
  [key: string]: (node: Node) => string,
}

export type TranspileOptions = {
  parser: (code: string) => Node,
  visitor?: Visitor,
  generator?: Generator,
}

function createVisitorFromGenerator (generator: Generator): Visitor {
  const visitor: Visitor = {}

  for (const type in generator) {
    if (generator.hasOwnProperty(type)) {
      visitor[type] = function generate (path: Path) {
        path.node.toString = () => {
          debug('generating code for node %s', path.node.type)
          return generator[type](path.node)
        }
      }
    }
  }

  return visitor
}

export async function transpile (code: string, options: TranspileOptions): Promise<string> {
  const root: Node = options.parser(code)

  const generator: Visitor = options.generator ? createVisitorFromGenerator(options.generator) : null
  const visitor: Visitor = (
    options.visitor && generator ?
    mergeVisitors(generator, options.visitor) :
    (options.visitor || generator)
  )

  await traverse(root, {
    visitor,
  })

  // magic
  return root.toString()
}
