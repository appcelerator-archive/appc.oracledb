'use strict'

const tap = require('tap')
const test = tap.test
const sinon = require('sinon')
const Arrow = require('arrow')

const createModelsFromSchema = require('../../../lib/schema/createModelsFromSchema').createModelsFromSchema

const sandbox = sinon.sandbox

tap.beforeEach((done) => {
  sandbox.create()
  done()
})

tap.afterEach((done) => {
  sandbox.restore()
  done()
})

test('### Should create models from schema ###', function (t) {
    // Stub and spies
  const cbOkSpy = sandbox.spy()
  const arrowModelExtendStub = sandbox.stub(Arrow.Model, 'extend').callsFake(() => {
    return {}
  })

    // Data
  var mockConnector = {
    schema: {
      objects: require('../../schemaJSON.js'),
      primary_keys: {
        post: 'id'
      }
    },
    name: 'Test',
    models: [],
    config: {

    },
    convertDataTypeToJSType: cbOkSpy
  }

    // Execution
  createModelsFromSchema.call(mockConnector)

    // Tests
  t.ok(arrowModelExtendStub.calledOnce)
  t.ok(mockConnector.convertDataTypeToJSType.called)
  t.ok(cbOkSpy.calledTwice)

  t.end()
})

test('### Should create models from schema without models ###', function (t) {
    // Stubs and spies
  const cbOkSpy = sandbox.spy()
  const arrowModelExtendStub = sandbox.stub(Arrow.Model, 'extend').callsFake(cbOkSpy)

    // Data
  var mockConnector = {
    schema: {
      objects: require('../../schemaJSON.js'),
      primary_keys: {
        post: undefined
      }
    },
    name: 'Test',
    config: {},
    convertDataTypeToJSType: cbOkSpy
  }

    // Execution
  createModelsFromSchema.call(mockConnector)

    // Tests
  t.ok(arrowModelExtendStub.calledOnce)
  t.ok(mockConnector.convertDataTypeToJSType.called)
  t.equals(cbOkSpy.callCount, 4)

  t.end()
})
