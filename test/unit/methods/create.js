'use strict'

const sinon = require('sinon')
const create = require('../../../lib/methods/create').create
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

test('### create Call - Error Case ###', function (t) {
    // Data
    const values = {
        title: 'Single Post Title',
        books: ['Harry Potter 1', 'Harry Potter 2']
    }
    const error = { message: 'can\'t find primary key column for Posts' }

    const instance = {
        title: 'Some Title',
        content: 'Some Content',
        toPayload() {
            return ['Some Title', 'Some Content']
        },
        setPrimaryKey(id) { }
    }

    Model.instance = function (values, isSomething) {
        return instance
    }

    // Stubs and spies
    const cbErrorSpy = sandbox.spy()

    const getTableNameStub = sandbox.stub(connector, 'getTableName').callsFake((Model) => {
        return 'Posts'
    })

    const getPrimaryKeyColumnStub = sandbox.stub(connector, 'getPrimaryKeyColumn').callsFake((Model) => {
        return null
    })

    const fetchColumnsStub = sandbox.stub(connector, 'fetchColumns').callsFake((table, paylod) => {
        return ['title', 'content']
    })

    const returnPlaceholderStub = sandbox.stub(connector, 'returnPlaceholder').callsFake((columnName, index, array) => {
        return ':' + columnName
    })

    // Execution
    create.call(connector, Model, values, cbErrorSpy)

    // Tests
    t.ok(getTableNameStub.calledOnce)
    t.equals(getTableNameStub.firstCall.args[0], Model)
    t.ok(getPrimaryKeyColumnStub.calledOnce)
    t.equals(getPrimaryKeyColumnStub.firstCall.args[0], Model)
    t.ok(fetchColumnsStub.calledOnce)
    t.deepequal(fetchColumnsStub.firstCall.args[0], ['Some Title', 'Some Content'])
    t.ok(returnPlaceholderStub.calledTwice)
    t.equals(returnPlaceholderStub.firstCall.args[0], 'title')
    t.equals(returnPlaceholderStub.firstCall.args[1], 0)
    t.deepequal(returnPlaceholderStub.firstCall.args[2], ['title', 'content'])
    t.ok(cbErrorSpy.calledOnce)
    t.ok(cbErrorSpy.calledWith(error))

    t.end()
})

test('### create Call - OK Case ###', function (t) {
    // Data
    const values = {
        title: 'Some Title'
    }

    const instance = {
        title: 'Some Title',
        content: 'Some Content',
        toPayload() {
            return ['Some Title', 'Some Content']
        },
        setPrimaryKey(id) { }
    }

    Model.instance = function (values, isSomething) {
        return instance
    }

    // Stubs and spies
    const cbOkSpy = sandbox.spy()

    const getTableNameStub = sandbox.stub(connector, 'getTableName').callsFake((Model) => {
        return 'Posts'
    })

    const getPrimaryKeyColumnStub = sandbox.stub(connector, 'getPrimaryKeyColumn').callsFake((Model) => {
        return 'id'
    })

    const fetchColumnsStub = sandbox.stub(connector, 'fetchColumns').callsFake((table, paylod) => {
        return ['title', 'content']
    })

    const returnPlaceholderStub = sandbox.stub(connector, 'returnPlaceholder').callsFake((columnName, index, array) => {
        return ':' + columnName
    })

    const escapeKeysStub = sandbox.stub(connector, 'escapeKeys').callsFake((columns) => {
        return ['TITLE', 'CONTENT']
    })

    const _queryStub = sandbox.stub(connector, '_query').callsFake((query, payload, callback, executor) => {
        executor(7, { outBinds: { id: 7 } })
    })

    // Execution
    create.call(connector, Model, values, cbOkSpy)

    // Tests
    t.ok(getTableNameStub.calledOnce)
    t.equals(getTableNameStub.firstCall.args[0], Model)
    t.ok(getPrimaryKeyColumnStub.calledOnce)
    t.equals(getPrimaryKeyColumnStub.firstCall.args[0], Model)
    t.ok(fetchColumnsStub.calledOnce)
    t.ok(returnPlaceholderStub.calledTwice)
    t.equals(returnPlaceholderStub.firstCall.args[0], 'title')
    t.equals(returnPlaceholderStub.firstCall.args[1], 0)
    t.deepequal(returnPlaceholderStub.firstCall.args[2], ['title', 'content'])
    t.equals(_queryStub.firstCall.args.length, 4)
    t.equals(_queryStub.firstCall.args[0], 'INSERT INTO Posts (TITLE,CONTENT) VALUES (:title,:content) RETURNING "id" INTO :id')
    t.deepequal(_queryStub.firstCall.args[1][0], 'Some Title')
    t.equals(_queryStub.firstCall.args[2], cbOkSpy)

    t.ok(cbOkSpy.calledOnce)
    t.ok(cbOkSpy.calledWith(null, instance))

    t.end()
})

test('### Stop Arrow ###', function (t) {
    arrow.stop(function () {
        t.pass('Arrow has been stopped!')
        t.end()
    })
})
