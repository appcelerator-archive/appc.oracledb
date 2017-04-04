'use strict'

const tap = require('tap')
const test = tap.test
const server = require('../../server')
const fetchMetadata = require('./../../../lib/metadata/fetchMetadata').fetchMetadata
const sinon = require('sinon')
var arrow
var connector

const sandbox = sinon.sandbox

tap.beforeEach((done) => {
  sandbox.create()
  done()
})

tap.afterEach((done) => {
  sandbox.restore()
  done()
})

test('### Start Arrow ###', function (t) {
  server()
        .then((inst) => {
          arrow = inst
          connector = arrow.getConnector('appc.oracledb')
          t.ok(arrow, 'Arrow has been started')
          t.end()
        })
        .catch((err) => {
          t.threw(err)
        })
})

test('### fetchMetadata test response, fields name, type and required ###', function (t) {
    // Spy
  const nextSpy = sandbox.spy()

    // Execution
  fetchMetadata.call(connector, nextSpy)

    // Tests
  const fields = nextSpy.args[0][1].fields

  t.ok(nextSpy.calledOnce)

  t.equal(fields[0].name, 'connectString')
  t.equal(fields[0].type, 'text')
  t.equal(fields[0].required, true)

  t.equal(fields[1].name, 'user')
  t.equal(fields[1].type, 'text')
  t.equal(fields[1].required, true)

  t.equal(fields[2].name, 'password')
  t.equal(fields[2].type, 'text')
  t.equal(fields[2].required, false)

  t.equal(fields[3].name, 'generateModelsFromSchema')
  t.equal(fields[3].type, 'checkbox')
  t.equal(fields[3].required, false)

  t.equal(fields[4].name, 'modelAutogen')
  t.equal(fields[4].type, 'checkbox')
  t.equal(fields[4].required, false)

  t.end()
})

test('### Stop Arrow ###', function (t) {
  arrow.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
