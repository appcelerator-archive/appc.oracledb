'use strict'

const sinon = require('sinon')
const distinct = require('../../../lib/methods/distinct').distinct
const tap = require('tap')
const test = tap.test
const server = require('../../server')

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

test('### distinct Call - Error Case ###', function (t) {
    // Data
    const options = {}
    const field = 'Name'

    // Stubs and spies
    const cbErrorSpy = sandbox.spy()

    const getTableNameStub = sandbox.stub(connector, 'getTableName').callsFake((Model) => {
        return 'Posts'
    })

    const _queryStub = sandbox.stub(connector, '_query').callsFake((query, values, { }, callback, executor) => {
        executor(null)
    })

    // Execution
    distinct.call(connector, Model, field, options, cbErrorSpy)

    // Tests
    t.ok(getTableNameStub.calledOnce)
    t.equals(getTableNameStub.firstCall.args[0], Model)
    t.ok(_queryStub.calledOnce)
    t.equals(_queryStub.firstCall.args.length, 5)
    t.equals(_queryStub.firstCall.args[0], 'SELECT DISTINCT "NAME"  FROM Posts')
    t.deepequal(_queryStub.firstCall.args[1], {})
    t.deepequal(_queryStub.firstCall.args[2], { useResultSet: true })
    t.equals(_queryStub.firstCall.args[3], cbErrorSpy)
    t.ok(cbErrorSpy.calledOnce)
    t.ok(cbErrorSpy.calledWith())

    t.end()
})

test('### distinct Call - OK Case ###', function (t) {
    // Data
    const options = {
        where: "COMMISSION > 0.12"
    }
    const field = 'Name'
    const resultCallback = ['Alex', 'Ivan']
    const resultTranslateWhereToQuery = options.where
    const resultExecutor = [{ NAME: "Alex" }, { NAME: "Ivan" }]

    // Stubs and spies
    const cbOkSpy = sandbox.spy()

    const getTableNameStub = sandbox.stub(connector, 'getTableName').callsFake((Model) => {
        return 'Posts'
    })

    const translateWhereToQueryStub = sandbox.stub(connector, 'translateWhereToQuery').callsFake((where, values) => {
        return resultTranslateWhereToQuery
    })

    const _queryStub = sandbox.stub(connector, '_query').callsFake((query, values, { }, callback, executor) => {
        executor(resultExecutor)
    })

    // Execution
    distinct.call(connector, Model, field, options, cbOkSpy)

    // Tests
    t.ok(getTableNameStub.calledOnce)
    t.equals(getTableNameStub.firstCall.args[0], Model)
    t.ok(translateWhereToQueryStub.calledOnce)
    t.equals(translateWhereToQueryStub.firstCall.args[0], resultTranslateWhereToQuery)
    t.ok(_queryStub.calledOnce)
    t.equals(_queryStub.firstCall.args.length, 5)
    t.equals(_queryStub.firstCall.args[0], 'SELECT DISTINCT "NAME"  FROM PostsCOMMISSION > 0.12')
    t.deepequal(_queryStub.firstCall.args[1], {})
    t.deepequal(_queryStub.firstCall.args[2], { useResultSet: true })
    t.equals(_queryStub.firstCall.args[3], cbOkSpy)
    t.ok(cbOkSpy.calledOnce)
    t.ok(cbOkSpy.calledWith(null, resultCallback))

    t.end()
})

test('### Stop Arrow ###', function (t) {
    arrow.stop(function () {
        t.pass('Arrow has been stopped!')
        t.end()
    })
})
