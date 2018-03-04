import test from 'ava'
import { traverse } from '../helpers/path'

test('should provide node in path', async t => {
  await traverse((type, path) => {
    t.is(type, path.node.type, 'should provide correct node under path')
  })
})
