'use strict'

const sinon = require('sinon')
const save = require('../../../lib/methods/save').save
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

test('### save Call - Error Case ###', function (t) {
    // Data
  const error = { message: 'can\'t find primary key column for Posts' }

  const instance = {
    toPayload: function () {
      return ['Some Title', 'Some Content']
    },
    getPrimaryKey: function () {
      return '2'
    }
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

    // Execution
  save.call(connector, Model, instance, cbErrorSpy)

    // Tests
  t.ok(getTableNameStub.calledOnce)
  t.equals(getTableNameStub.firstCall.args[0], Model)
  t.ok(getPrimaryKeyColumnStub.calledOnce)
  t.equals(getPrimaryKeyColumnStub.firstCall.args[0], Model)
  t.ok(fetchColumnsStub.calledOnce)
  t.deepequal(fetchColumnsStub.firstCall.args[0], ['Some Title', 'Some Content'])
  t.ok(cbErrorSpy.calledOnce)
  t.ok(cbErrorSpy.calledWith(error))

  t.end()
})

test('### save Call - OK Case ###', function (t) {
    // Data
  const instance = {
    getPrimaryKey: function () {
      return '2'
    },
    toPayload: function () {
      return ['Some Title', 'Some Content']
    }
  }

    // Stubs and spies
  const cbOkSpy = sandbox.spy()

  const getTableNameStub = sandbox.stub(connector, 'getTableName').callsFake((Model) => {
    return 'Posts'
  })

  const getPrimaryKeyColumnStub = sandbox.stub(connector, 'getPrimaryKeyColumn').callsFake((Model) => {
    return 2
  })

  const fetchColumnsStub = sandbox.stub(connector, 'fetchColumns').callsFake((table, paylod) => {
    return ['title', 'content']
  })

  const _queryStub = sandbox.stub(connector, '_query').callsFake((query, payload, callback, executor) => {
    executor(7, { rowsAffected: 1 })
  })

    // Execution
  save.call(connector, Model, instance, cbOkSpy)

    // Tests
  t.ok(getTableNameStub.calledOnce)
  t.equals(getTableNameStub.firstCall.args[0], Model)
  t.ok(getPrimaryKeyColumnStub.calledOnce)
  t.equals(getPrimaryKeyColumnStub.firstCall.args[0], Model)
  t.ok(fetchColumnsStub.calledOnce)
  t.equals(_queryStub.firstCall.args.length, 4)
  t.equals(_queryStub.firstCall.args[0], 'UPDATE "POSTS" SET "TITLE" = :title,"CONTENT" = :content WHERE "2" = :id')
  t.deepequal(_queryStub.firstCall.args[1][0], 'Some Title')
  t.equals(_queryStub.firstCall.args[2], cbOkSpy)
  t.ok(cbOkSpy.calledOnce)
  t.ok(cbOkSpy.calledWith(null, instance))

  t.end()
})

test('### save Call - OK Case nothing to save ###', function (t) {
    // Data
  const instance = {
    getPrimaryKey: function () {
      return '2'
    },
    toPayload: function () {
      return ['Some Title', 'Some Content']
    }
  }

    // Stubs and spies
  const cbOkSpy = sandbox.spy()

  const getTableNameStub = sandbox.stub(connector, 'getTableName').callsFake((Model) => {
    return 'Posts'
  })

  const getPrimaryKeyColumnStub = sandbox.stub(connector, 'getPrimaryKeyColumn').callsFake((Model) => {
    return 2
  })

  const fetchColumnsStub = sandbox.stub(connector, 'fetchColumns').callsFake((table, paylod) => {
    return ['title', 'content']
  })

  const _queryStub = sandbox.stub(connector, '_query').callsFake((query, payload, callback, executor) => {
    executor()
  })

    // Execution
  save.call(connector, Model, instance, cbOkSpy)

    // Tests
  t.ok(getTableNameStub.calledOnce)
  t.equals(getTableNameStub.firstCall.args[0], Model)
  t.ok(getPrimaryKeyColumnStub.calledOnce)
  t.equals(getPrimaryKeyColumnStub.firstCall.args[0], Model)
  t.ok(fetchColumnsStub.calledOnce)
  t.equals(_queryStub.firstCall.args.length, 4)
  t.equals(_queryStub.firstCall.args[0], 'UPDATE "POSTS" SET "TITLE" = :title,"CONTENT" = :content WHERE "2" = :id')
  t.deepequal(_queryStub.firstCall.args[1][0], 'Some Title')
  t.equals(_queryStub.firstCall.args[2], cbOkSpy)
  t.ok(cbOkSpy.calledOnce)
  t.ok(cbOkSpy.calledWith())

  t.end()
})

test('### Stop Arrow ###', function (t) {
  arrow.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
