import test from 'ava'
import { traverse } from '../../'

test('should visit root node', async t => {
  t.plan(1)

  await traverse({
    type: 'Root',
    children: () => [],
  }, {
    visitor: {
      Root () {
        t.pass()
      },
    },
  })
})
