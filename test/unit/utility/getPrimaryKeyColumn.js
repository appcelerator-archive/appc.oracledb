'use strict'

const tap = require('tap')
const test = tap.test
const server = require('../../server')
const sinon = require('sinon')
const getPrimaryKeyColumn = require('../../../lib/utility/getPrimaryKeyColumn').getPrimaryKeyColumn

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

test('### getPrimaryKeyColumn Call - OK Case with primary key ###', function (t) {
    // Stubs
    const getMetaStub = sandbox.stub(Model, 'getMeta').callsFake((tableName) => {
        return 'id'
    })

    // Execution
    const pk = getPrimaryKeyColumn.call(connector, Model)

    // Tests
    t.ok(getMetaStub.calledOnce)
    t.equals(pk, 'id')

    t.end()
})

test('### getPrimaryKeyColumn Call - OK Case without primary key ###', function (t) {
    // Data
    connector.schema = { primary_keys: { POSTS: 'id' } }

    // Stubs
    const getMetaStub = sandbox.stub(Model, 'getMeta').callsFake((tableName) => {
        return null
    })

    const getTableNameStub = sandbox.stub(connector, 'getTableName').callsFake((Model) => {
        return 'Posts'
    })

    // Execution
    const pk = getPrimaryKeyColumn.call(connector, Model)

    // Tests
    t.equals(pk, 'id')
    t.ok(getMetaStub.calledOnce)
    t.ok(getMetaStub.firstCall.args[0], 'primarykey')
    t.ok(getTableNameStub.calledOnce)
    t.deepequal(getTableNameStub.firstCall.args[0], Model)

    t.end()
})

test('### Stop Arrow ###', function (t) {
    arrow.stop(function () {
        t.pass('Arrow has been stopped!')
        t.end()
    })
})