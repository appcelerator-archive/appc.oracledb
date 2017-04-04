'use strict'

const tap = require('tap')
const test = tap.test
const sinon = require('sinon')
const returnPlaceholder = require('../../../lib/utility/returnPlaceholder').returnPlaceholder

const sandbox = sinon.sandbox

tap.beforeEach((done) => {
  sandbox.create()
  done()
})

tap.afterEach((done) => {
  sandbox.restore()
  done()
})

test('### returnPlaceholder Call - OK Case ###', function (t) {
    // Execution
  const placeholder = returnPlaceholder('ColumnName', 7, [])

    // Tests
  t.equals(placeholder, ':ColumnName')

  t.end()
})
