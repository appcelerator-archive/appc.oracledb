'use strict'

const test = require('tap').test
const escapeKeys = require('../../../lib/utility/escapeKeys').escapeKeys

test('### escapeKeys unit test', function (t) {
  var keys = ['key1', 'key2']
  var result = escapeKeys(keys)
  t.equals(result[0], '"KEY1"')
  t.equals(result[1], '"KEY2"')
  t.end()
})
