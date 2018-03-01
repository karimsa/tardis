/**
 * @file src/transpile.ts
 * @copyright 2018-present Karim Alibhai. All rights reserved.
 */

import { Path } from './path'
import { Node } from './types'
import { Visitor } from './node'
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

export async function transpile (code: string, options: TranspileOptions): Promise<string> {
  const root: Node = options.parser(code)

  // do node replacements / transpiling
  if (options.visitor) {
    await traverse(root, {
      visitor: options.visitor,
    })
  }

  // if generator provided, do some hacks to add stringification to all nodes
  if (options.generator) {
    const generator: Visitor = {
      '*': function visitAll (path: Path) {
        if (path.node.toString === {}.toString) {
          throw new Error(`Missing implementation for ${path.node.type}.toString()`)
        }
      }
    }

    for (const type in options.generator) {
      if (options.generator.hasOwnProperty(type)) {
        generator[type] = function generate (path: Path) {
          path.node.toString = () => {
            debug('generating code for node %s', path.node.type)
            return options.generator[type](path.node)
          }
        }
      }
    }

    await traverse(root, {
      visitor: generator,
    })
  }

  // magic
  return root.toString()
}
