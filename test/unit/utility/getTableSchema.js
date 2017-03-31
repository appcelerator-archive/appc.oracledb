'use strict'

const tap = require('tap')
const test = tap.test
const server = require('../../server')
const sinon = require('sinon')
const getTableSchema = require('../../../lib/utility/getTableSchema').getTableSchema

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

test('### getTableSchema Call - OK Case with model ###', function (t) {
    // Data
    connector.schema = { objects: { POSTS: 'TestPost' } }

    // Stubs
    const getTableNameStub = sandbox.stub(connector, 'getTableName').callsFake((Model) => {
        return 'Posts'
    })

    // Execution
    const tableSchema = getTableSchema.call(connector, Model)

    // Tests
    t.ok(getTableNameStub.calledOnce)
    t.equal(tableSchema, 'TestPost')
    t.end()
})

test('### getTableSchema Call - OK Case with table name ###', function (t) {
    // Data
    const tableName = 'posts'
    connector.schema = { objects: { POSTS: 'somePost' } }

    // Execution
    const tableSchema = getTableSchema.call(connector, tableName)

    // Tests
    t.equals(tableSchema, 'somePost')
    t.end()
})

test('### Stop Arrow ###', function (t) {
    arrow.stop(function () {
        t.pass('Arrow has been stopped!')
        t.end()
    })
})