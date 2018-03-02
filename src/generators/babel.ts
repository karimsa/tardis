/**
 * @file src/generators/babel.ts
 * @copyright 2018-present Karim Alibhai. All rights reserved.
 */

import { Node } from '../types'
import generate from 'babel-generator'
import { File as FileNode } from 'babel-types'

export function File (file: FileNode): string {
  return generate(file).code
}
