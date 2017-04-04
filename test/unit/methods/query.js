'use strict'

const sinon = require('sinon')
const query = require('../../../lib/methods/query').query
const tap = require('tap')
const test = tap.test
const server = require('../../server')
const lodash = require('lodash')

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

test('### query method - empty options, empty result ###', function (t) {
  // Data
  const queryString = 'SELECT * FROM Posts OFFSET 0 ROWS FETCH NEXT 10 ROWS ONLY'

  // Stubs and spies
  const cbSpy = sandbox.spy()
  const getTableNameStub = sandbox.stub(connector, 'getTableName').callsFake((Model) => {
    return 'Posts'
  })
  const getPrimaryKeyColumnStub = sandbox.stub(connector, 'getPrimaryKeyColumn').callsFake((Model) => {
    return 'id'
  })
  const _queryStub = sandbox.stub(connector, '_query').callsFake((query, values, options, callback, executor) => {
    executor()
  })

  // Execution
  query.call(connector, Model, {}, cbSpy)
  t.ok(getTableNameStub.calledOnce)
  t.ok(getTableNameStub.calledWith(Model))
  t.ok(getPrimaryKeyColumnStub.calledOnce)
  t.ok(getPrimaryKeyColumnStub.calledWith(Model))
  t.ok(_queryStub.calledOnce)
  t.equals(_queryStub.firstCall.args[0], queryString)
  t.deepequal(_queryStub.firstCall.args[1], {})
  t.deepequal(_queryStub.firstCall.args[2], { useResultSet: true })
  t.equals(_queryStub.firstCall.args[3], cbSpy)
  t.type(_queryStub.firstCall.args[4], 'function')
  t.ok(cbSpy.calledOnce)
  t.ok(cbSpy.calledWith())
  t.end()
})

test('### query method - empty options, with result ###', function (t) {
  // Data
  const queryString = 'SELECT * FROM Posts OFFSET 0 ROWS FETCH NEXT 10 ROWS ONLY'
  const data = {
    id: 40,
    books: ['book 1'],
    title: 'title',
    content: 'content'
  }
  const rows = [data, data]
  const instance = Model.instance(data, true)
  instance.setPrimaryKey(data.id)

  // Stubs and spies
  const cbSpy = sandbox.spy()
  const getTableNameStub = sandbox.stub(connector, 'getTableName').callsFake((Model) => {
    return 'Posts'
  })
  const getPrimaryKeyColumnStub = sandbox.stub(connector, 'getPrimaryKeyColumn').callsFake((Model) => {
    return 'id'
  })
  const _queryStub = sandbox.stub(connector, '_query').callsFake((query, values, options, callback, executor) => {
    executor(rows, 'result')
  })
  const getInstanceFromRowStub = sandbox.stub(connector, 'getInstanceFromRow').callsFake((Model, row) => {
    return instance
  })

  // Execution
  query.call(connector, Model, {}, cbSpy)
  t.ok(getTableNameStub.calledOnce)
  t.ok(getTableNameStub.calledWith(Model))
  t.ok(getPrimaryKeyColumnStub.calledOnce)
  t.ok(getPrimaryKeyColumnStub.calledWith(Model))
  t.ok(_queryStub.calledOnce)
  t.equals(_queryStub.firstCall.args[0], queryString)
  t.deepequal(_queryStub.firstCall.args[1], {})
  t.deepequal(_queryStub.firstCall.args[2], { useResultSet: true })
  t.equals(_queryStub.firstCall.args[3], cbSpy)
  t.type(_queryStub.firstCall.args[4], 'function')
  t.ok(getInstanceFromRowStub.calledTwice)
  t.equals(getInstanceFromRowStub.firstCall.args[0], Model)
  t.deepequal(getInstanceFromRowStub.firstCall.args[1], data)
  t.ok(cbSpy.calledOnce)
  t.equals(cbSpy.firstCall.args[0], null)
  t.deepequal(cbSpy.firstCall.args[1], [instance, instance])

  t.end()
})

test('### query method - with sel ###', function (t) {
  // Data
  const queryString = 'SELECT id, "TITLE" FROM Posts OFFSET 0 ROWS FETCH NEXT 10 ROWS ONLY'
  const options = {
    sel: {
      title: 1
    }
  }

  // Stubs and spies
  const cbSpy = sandbox.spy()
  const getTableNameStub = sandbox.stub(connector, 'getTableName').callsFake((Model) => {
    return 'Posts'
  })
  const getPrimaryKeyColumnStub = sandbox.stub(connector, 'getPrimaryKeyColumn').callsFake((Model) => {
    return 'id'
  })
  const omitStub = sandbox.stub(lodash, 'omit').callsFake((key, primaryKey) => {
    return { title: 1 }
  })
  const keyStub = sandbox.stub(lodash, 'keys').callsFake((obj) => {
    return ['title']
  })
  const escapeKeysStub = sandbox.stub(connector, 'escapeKeys').callsFake((keys) => {
    return keys.map(function (item) {
      return '"' + item.toUpperCase() + '"'
    })
  })
  const _queryStub = sandbox.stub(connector, '_query').callsFake((query, values, options, callback, executor) => {
    executor()
  })

  // Execution
  query.call(connector, Model, options, cbSpy)
  t.ok(getTableNameStub.calledOnce)
  t.ok(getTableNameStub.calledWith(Model))
  t.ok(escapeKeysStub.calledOnce)
  t.ok(getPrimaryKeyColumnStub.calledOnce)
  t.ok(getPrimaryKeyColumnStub.calledWith(Model))
  t.ok(omitStub.calledOnce)
  t.deepequal(omitStub.firstCall.args[0], options.sel)
  t.equals(omitStub.firstCall.args[1], 'id')
  t.ok(keyStub.calledOnce)
  t.deepequal(keyStub.firstCall.args[0], options.sel)
  t.ok(_queryStub.calledOnce)
  t.equals(_queryStub.firstCall.args[0], queryString)
  t.deepequal(_queryStub.firstCall.args[1], {})
  t.deepequal(_queryStub.firstCall.args[2], { useResultSet: true })
  t.equals(_queryStub.firstCall.args[3], cbSpy)
  t.type(_queryStub.firstCall.args[4], 'function')
  t.ok(cbSpy.calledOnce)
  t.ok(cbSpy.calledWith())
  t.end()
})
test('### query method - with unsel ###', function (t) {
  // Data
  const schema = {
    title: {
      type: 'string',
      required: false
    },
    content: {
      type: 'string',
      required: false
    },
    books: {
      type: 'array',
      required: false,
      originalType: 'Product'
    }
  }
  const schemaSecondCall = {
    content: {
      type: 'string',
      required: false
    },
    books: {
      type: 'array',
      required: false,
      originalType: 'Product'
    }
  }

  const queryString = 'SELECT id, "CONTENT", "BOOKS" FROM Posts OFFSET 0 ROWS FETCH NEXT 10 ROWS ONLY'
  const options = {
    unsel: {
      title: 1
    }
  }

  // Stubs and spies
  const cbSpy = sandbox.spy()
  const getTableNameStub = sandbox.stub(connector, 'getTableName').callsFake((Model) => {
    return 'Posts'
  })
  const getPrimaryKeyColumnStub = sandbox.stub(connector, 'getPrimaryKeyColumn').callsFake((Model) => {
    return 'id'
  })
  const getTableSchemaStub = sandbox.stub(connector, 'getTableSchema').callsFake((Model) => {
    return schema
  })
  const omitStub = sandbox.stub(lodash, 'omit')
  omitStub.onFirstCall().callsFake((key, primaryKey) => {
    return schema
  })
  omitStub.onSecondCall().callsFake((key, remove) => {
    return schemaSecondCall
  })
  const keyStub = sandbox.stub(lodash, 'keys').callsFake((obj) => {
    return Object.keys(obj)
  })
  const escapeKeysStub = sandbox.stub(connector, 'escapeKeys').callsFake((keys) => {
    return keys.map(function (item) {
      return '"' + item.toUpperCase() + '"'
    })
  })
  const _queryStub = sandbox.stub(connector, '_query').callsFake((query, values, options, callback, executor) => {
    executor()
  })

  // Execution
  query.call(connector, Model, options, cbSpy)
  t.ok(getTableNameStub.calledOnce)
  t.ok(getTableNameStub.calledWith(Model))
  t.ok(getTableSchemaStub.calledOnce)
  t.ok(escapeKeysStub.calledOnce)
  t.ok(getPrimaryKeyColumnStub.calledOnce)
  t.ok(getPrimaryKeyColumnStub.calledWith(Model))
  t.ok(omitStub.calledTwice)
  t.deepequal(omitStub.firstCall.args[0], schema)
  t.equals(omitStub.firstCall.args[1], 'id')
  t.deepequal(omitStub.secondCall.args[0], schema)
  t.deepequal(omitStub.secondCall.args[1], ['TITLE'])
  t.ok(keyStub.calledTwice)
  t.deepequal(keyStub.firstCall.args[0], options.unsel)
  t.deepequal(keyStub.secondCall.args[0], schemaSecondCall)
  t.ok(_queryStub.calledOnce)
  t.equals(_queryStub.firstCall.args[0], queryString)
  t.deepequal(_queryStub.firstCall.args[1], {})
  t.deepequal(_queryStub.firstCall.args[2], { useResultSet: true })
  t.equals(_queryStub.firstCall.args[3], cbSpy)
  t.type(_queryStub.firstCall.args[4], 'function')
  t.ok(cbSpy.calledOnce)
  t.ok(cbSpy.calledWith())
  t.end()
})

test('### query method - with order ###', function (t) {
  // Data
  const queryString = 'SELECT * FROM Posts ORDER BY title DESC OFFSET 0 ROWS FETCH NEXT 10 ROWS ONLY'
  const options = {
    order: {
      title: 'DESC'
    }
  }

  // Stubs and spies
  const cbSpy = sandbox.spy()
  const getTableNameStub = sandbox.stub(connector, 'getTableName').callsFake((Model) => {
    return 'Posts'
  })
  const getPrimaryKeyColumnStub = sandbox.stub(connector, 'getPrimaryKeyColumn').callsFake((Model) => {
    return 'id'
  })
  const _queryStub = sandbox.stub(connector, '_query').callsFake((query, values, options, callback, executor) => {
    executor()
  })

  // Execution
  query.call(connector, Model, options, cbSpy)
  t.ok(getTableNameStub.calledOnce)
  t.ok(getTableNameStub.calledWith(Model))
  t.ok(getPrimaryKeyColumnStub.calledOnce)
  t.ok(getPrimaryKeyColumnStub.calledWith(Model))
  t.ok(_queryStub.calledOnce)
  t.equals(_queryStub.firstCall.args[0], queryString)
  t.deepequal(_queryStub.firstCall.args[1], {})
  t.deepequal(_queryStub.firstCall.args[2], { useResultSet: true })
  t.equals(_queryStub.firstCall.args[3], cbSpy)
  t.type(_queryStub.firstCall.args[4], 'function')
  t.ok(cbSpy.calledOnce)
  t.ok(cbSpy.calledWith())
  t.end()
})

test('### query method - with order as string ###', function (t) {
  // Data
  const queryString = 'SELECT * FROM Posts ORDER BY title ASC OFFSET 0 ROWS FETCH NEXT 10 ROWS ONLY'
  const options = {
    order: 'title'
  }

  // Stubs and spies
  const cbSpy = sandbox.spy()
  const getTableNameStub = sandbox.stub(connector, 'getTableName').callsFake((Model) => {
    return 'Posts'
  })
  const getPrimaryKeyColumnStub = sandbox.stub(connector, 'getPrimaryKeyColumn').callsFake((Model) => {
    return 'id'
  })
  const _queryStub = sandbox.stub(connector, '_query').callsFake((query, values, options, callback, executor) => {
    executor()
  })

  // Execution
  query.call(connector, Model, options, cbSpy)
  t.ok(getTableNameStub.calledOnce)
  t.ok(getTableNameStub.calledWith(Model))
  t.ok(getPrimaryKeyColumnStub.calledOnce)
  t.ok(getPrimaryKeyColumnStub.calledWith(Model))
  t.ok(_queryStub.calledOnce)
  t.equals(_queryStub.firstCall.args[0], queryString)
  t.deepequal(_queryStub.firstCall.args[1], {})
  t.deepequal(_queryStub.firstCall.args[2], { useResultSet: true })
  t.equals(_queryStub.firstCall.args[3], cbSpy)
  t.type(_queryStub.firstCall.args[4], 'function')
  t.ok(cbSpy.calledOnce)
  t.ok(cbSpy.calledWith())
  t.end()
})

test('### query method - with where ###', function (t) {
  // Data
  const queryString = 'SELECT * FROM Posts WHERE "TITLE" = :title OFFSET 0 ROWS FETCH NEXT 10 ROWS ONLY'
  const options = {
    where: {
      title: {
        eq: 'title'
      }
    }
  }

  // Stubs and spies
  const cbSpy = sandbox.spy()
  const getTableNameStub = sandbox.stub(connector, 'getTableName').callsFake((Model) => {
    return 'Posts'
  })
  const getPrimaryKeyColumnStub = sandbox.stub(connector, 'getPrimaryKeyColumn').callsFake((Model) => {
    return 'id'
  })
  const _queryStub = sandbox.stub(connector, '_query').callsFake((query, values, options, callback, executor) => {
    executor()
  })

  // Execution
  query.call(connector, Model, options, cbSpy)
  t.ok(getTableNameStub.calledOnce)
  t.ok(getTableNameStub.calledWith(Model))
  t.ok(getPrimaryKeyColumnStub.calledOnce)
  t.ok(getPrimaryKeyColumnStub.calledWith(Model))
  t.ok(_queryStub.calledOnce)
  t.equals(_queryStub.firstCall.args[0], queryString)
  t.deepequal(_queryStub.firstCall.args[1], options.where)
  t.deepequal(_queryStub.firstCall.args[2], { useResultSet: true })
  t.equals(_queryStub.firstCall.args[3], cbSpy)
  t.type(_queryStub.firstCall.args[4], 'function')
  t.ok(cbSpy.calledOnce)
  t.ok(cbSpy.calledWith())
  t.end()
})

test('### Stop Arrow ###', function (t) {
  arrow.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
