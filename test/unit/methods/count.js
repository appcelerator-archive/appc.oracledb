'use strict'

const sinon = require('sinon')
const count = require('../../../lib/methods/count').count
const tap = require('tap')
const test = tap.test
const server = require('../../server')
const _ = require('lodash')

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

test('### count Call - Error Case ###', function (t) {
    // Data
    const options = {}
    const error = { message: 'can\'t find primary key column for Posts' }

    // Stubs and spies
    const cbErrorSpy = sandbox.spy()

    const getTableNameStub = sandbox.stub(connector, 'getTableName').callsFake((Model) => {
        return 'Posts'
    })

    const getPrimaryKeyColumnStub = sandbox.stub(connector, 'getPrimaryKeyColumn').callsFake((Model) => {
        return null
    })

    // Execution
    count.call(connector, Model, options, cbErrorSpy)

    // Tests
    t.ok(getTableNameStub.calledOnce)
    t.equals(getTableNameStub.firstCall.args[0], Model)
    t.ok(getPrimaryKeyColumnStub.calledOnce)
    t.equals(getPrimaryKeyColumnStub.firstCall.args[0], Model)
    t.ok(cbErrorSpy.calledOnce)
    t.ok(cbErrorSpy.calledWith(error))

    t.end()
})

test('### count Call - OK Case ###', function (t) {
    // Data
    const options = {}
    const result = 'testResult'
    const set = { COUNT: 13 }

    // Stubs and spies
    const cbOkSpy = sandbox.spy()

    const getTableNameStub = sandbox.stub(connector, 'getTableName').callsFake((Model) => {
        return 'Posts'
    })

    const getPrimaryKeyColumnStub = sandbox.stub(connector, 'getPrimaryKeyColumn').callsFake((Model) => {
        return 'id'
    })

    const _queryStub = sandbox.stub(connector, '_query').callsFake((query, callback, executor) => {
        executor(result)
    })

    const lodashStub = sandbox.stub(_, 'sum').callsFake((result, cb) => {
        return cb(set)
    })

    // Execution
    count.call(connector, Model, options, cbOkSpy)

    // Tests
    t.ok(getTableNameStub.calledOnce)
    t.equals(getTableNameStub.firstCall.args[0], Model)
    t.ok(getPrimaryKeyColumnStub.calledOnce)
    t.equals(getPrimaryKeyColumnStub.firstCall.args[0], Model)
    t.ok(_queryStub.calledOnce)
    t.equals(_queryStub.firstCall.args.length, 3)
    t.equals(_queryStub.firstCall.args[0], 'SELECT COUNT(id) AS COUNT FROM Posts')
    t.equals(_queryStub.firstCall.args[1], cbOkSpy)
    t.ok(lodashStub.calledOnce)
    t.equals(lodashStub.firstCall.args[0], result)
    t.ok(cbOkSpy.calledOnce)
    t.ok(cbOkSpy.calledWith(null, 13))

    t.end()
})

test('### count Call - OK Case return empty callback ###', function (t) {
    // Data
    const options = {}

    // Stubs and spies
    const cbOkSpy = sandbox.spy()

    const getTableNameStub = sandbox.stub(connector, 'getTableName').callsFake((Model) => {
        return 'Posts'
    })

    const getPrimaryKeyColumnStub = sandbox.stub(connector, 'getPrimaryKeyColumn').callsFake((Model) => {
        return 'id'
    })

    const _queryStub = sandbox.stub(connector, '_query').callsFake((query, callback, executor) => {
        executor()
    })

    // Execution
    count.call(connector, Model, options, cbOkSpy)

    // Tests
    t.ok(getTableNameStub.calledOnce)
    t.equals(getTableNameStub.firstCall.args[0], Model)
    t.ok(getPrimaryKeyColumnStub.calledOnce)
    t.equals(getPrimaryKeyColumnStub.firstCall.args[0], Model)
    t.ok(_queryStub.calledOnce)
    t.equals(_queryStub.firstCall.args.length, 3)
    t.equals(_queryStub.firstCall.args[0], 'SELECT COUNT(id) AS COUNT FROM Posts')
    t.equals(_queryStub.firstCall.args[1], cbOkSpy)
    t.ok(cbOkSpy.calledOnce)
    t.ok(cbOkSpy.calledWith(null, 0))

    t.end()
})

test('### Stop Arrow ###', function (t) {
    arrow.stop(function () {
        t.pass('Arrow has been stopped!')
        t.end()
    })
})

