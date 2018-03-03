import fs from 'fs'
import babylon from 'babylon'
import { traverse, fromBabylon } from '../'

const visitor = {
  StringLiteral (path) {
    path.replaceWith({
      type: 'StringLiteral',
      value: 'tardis is awesome',
    })
  },
}

async function go () {
  for (const file of fs.readdirSync(`${__dirname}/../dist`).filter(f => f.endsWith('.js'))) {
    const tree = await traverse(fromBabylon(
      babylon.parse(
        fs.readFileSync(`${__dirname}/../dist/${file}`, 'utf8')
      )
    ), { visitor })

    delete tree.tokens
    console.log(JSON.stringify(tree, null, 2))
  }
}

go().catch(console.error)
