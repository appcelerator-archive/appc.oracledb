'use strict'

const test = require('tap').test
const fetchColumns = require('../../../lib/utility/fetchColumns').fetchColumns

test('### fetchColumns unit test ###', function (t) {
  const payload = {
    name: 'John',
    age: 25
  }
  var keys = fetchColumns(payload)
  t.equals(keys[0], 'name')
  t.equals(keys[1], 'age')
  t.end()
})
