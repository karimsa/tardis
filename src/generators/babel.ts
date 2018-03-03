/**
 * @file src/generators/babel.ts
 * @copyright 2018-present Karim Alibhai. All rights reserved.
 */

import { Node as TardisNode } from '../types'
import { Generator } from '../node'

import { File, Node as BabelNode } from 'babel-types'
import generate from 'babel-generator'

export const babelGenerator: Generator = {
  File (file: BabelNode & TardisNode): string {
    return generate(file).code
  },
}
