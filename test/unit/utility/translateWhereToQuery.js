'use strict'

const tap = require('tap')
const test = tap.test
const sinon = require('sinon')
const translateWhereToQuery = require('../../../lib/utility/translateWhereToQuery').translateWhereToQuery

const sandbox = sinon.sandbox

tap.beforeEach((done) => {
  sandbox.create()
  done()
})

tap.afterEach((done) => {
  sandbox.restore()
  done()
})

test('### translateWhereToQuery Call - OK Case ###', function (t) {
    // Data
  const where = {
    Title: 'SomeTitle'
  }

    // Execution
  const whereQuery = translateWhereToQuery(where, {})

    // Tests
  t.equals(whereQuery, ' WHERE "TITLE" = :Title')
  t.end()
})

test('### translateWhereToQuery Call - OK Case with property $like ###', function (t) {
    // Data
  const where = {
    Title: {
      $like: 'SomeTitle'
    }
  }

    // Execution
  const whereQuery = translateWhereToQuery(where, {})

    // Tests
  t.equals(whereQuery, ' WHERE "TITLE" LIKE :Title')
  t.end()
})

test('### translateWhereToQuery Call - OK Case where the key is undefined ###', function (t) {
    // Data
  const where = {
    Title: undefined
  }

    // Execution
  const whereQuery = translateWhereToQuery(where, {})

    // Tests
  t.equals(whereQuery, '')
  t.end()
})
