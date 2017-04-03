'use strict'

const tap = require('tap')
const test = tap.test
const server = require('../../server')
const sinon = require('sinon')
const getTableName = require('../../../lib/utility/getTableName').getTableName

var arrow
var connector
var Model

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
            Model = arrow.getModel('Posts')
            t.ok(arrow, 'Arrow has been started')
            t.end()
        })
        .catch((err) => {
            t.threw(err)
        })
})

test('### getTableName Call - OK Case when the model is generated ###', function (t) {
    // Stubs
    const getMetaStub = sandbox.stub(Model, 'getMeta').callsFake((tableName) => {
        return 'appc.oracledb/Posts'
    })

    // Execution
    const name = getTableName.call(connector, Model)

    // Tests
    t.equals(name, 'Posts')
    t.ok(getMetaStub.calledOnce)
    t.ok(getMetaStub.firstCall.args[0], 'table')

    t.end()
})

test('### getTableName Call - OK Case when the model is manually created ###', function (t) {
    // Data
    Model.name = 'Posts'

    // Stubs
    const getMetaStub = sandbox.stub(Model, 'getMeta').callsFake((tableName) => {
        return null
    })

    // Execution
    const name = getTableName.call(connector, Model)

    // Tests
    t.equals(name, 'Posts')
    t.ok(getMetaStub.calledOnce)
    t.ok(getMetaStub.firstCall.args[0], 'table')

    t.end()
})

test('### getTableName Call - OK Case when the model is extended ###', function (t) {
    // Data
    const extendedModel = Model.extend('extendedModel', { data: 'test' })

    // Execution
    const name = getTableName.call(connector, extendedModel)

    // Tests
    t.equals(name, 'Posts')

    t.end()
})

test('### getTableName Call - OK Case when return the _supermodel ###', function (t) {
    // Data
    const extendedModel = Model.extend('extendedModel', { data: 'test' })
    extendedModel.name = null
    extendedModel._parent.name = null

    // Execution
    const name = getTableName.call(connector, extendedModel)

    // Tests
    t.equals(name, 'Posts')

    t.end()
})

test('### Stop Arrow ###', function (t) {
    arrow.stop(function () {
        t.pass('Arrow has been stopped!')
        t.end()
    })
})