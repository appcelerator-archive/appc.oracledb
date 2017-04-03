'use strict'

const tap = require('tap')
const test = tap.test
const server = require('../../server')
const sinon = require('sinon')
const fetchSchema = require('../../../lib/schema/fetchSchema').fetchSchema

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

test('### Fetch Schema with existing schema', function (t) {
    // Data
    connector.config.database = 'testDatabase'

    // Stubs and spies
    const nextSpy = sandbox.spy()

    const _queryStub = sandbox.stub(connector, '_query').callsFake((query, { }, next, executor) => {
        executor([{
            COLUMN_NAME: 'id',
            TABLE_NAME: 'Posts'
        }, {
            COLUMN_NAME: 'id',
        }, {
            COLUMN_NAME: 'id',
            TABLE_NAME: 'Posts',
            STATUS: 'ENABLED'
        }, {
            COLUMN_NAME: 'id',
            TABLE_NAME: 'Posts',
            STATUS: 'ENABLED',
            CONSTRAINT_TYPE: 'P'
        }])
    })

    // Execution
    fetchSchema.call(connector, nextSpy)

    // Tests
    t.ok(nextSpy.calledOnce)
    t.equals(nextSpy.args[0][1].database, 'testDatabase')
    t.ok(_queryStub.calledTwice)
    t.equals(_queryStub.firstCall.args.length, 4)
    t.equals(_queryStub.firstCall.args[0], `SELECT cols.TABLE_NAME, cols.COLUMN_NAME, cons.STATUS, cons.CONSTRAINT_TYPE FROM user_constraints cons, user_cons_columns cols WHERE cons.CONSTRAINT_NAME = cols.CONSTRAINT_NAME`)
    t.deepequal(_queryStub.firstCall.args[1], { useResultSet: true })
    t.equals(_queryStub.firstCall.args[2], nextSpy)

    t.end()
})

test('### Fetch Schema without existing schema', function (t) {
    // Data
    connector.schema = {}

    // Stubs and spies
    const nextSpy = sandbox.spy()

    // Execution
    fetchSchema.call(connector, nextSpy)

    // Tests
    t.ok(nextSpy.calledOnce)
    t.ok(nextSpy.calledWith(null, {}))

    t.end()
})

test('### Stop Arrow ###', function (t) {
    arrow.stop(function () {
        t.pass('Arrow has been stopped!')
        t.end()
    })
})