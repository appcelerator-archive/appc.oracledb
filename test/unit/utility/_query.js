'use strict'

const tap = require('tap')
const test = tap.test
const _query = require('../../../lib/utility/_query')._query
const sinon = require('sinon')
const server = require('../../server')
const getConnection = require('../../../lib/utility/getConnection')
const _ = require('lodash')

var connector
var arrow
const getConnectionStub = sinon.stub(getConnection, 'getConnection')

const loggerSpy = sinon.spy()
const logger = {
  trace: loggerSpy
}
const sandbox = sinon.sandbox

tap.beforeEach((done) => {
  sandbox.create()
  done()
})

tap.afterEach((done) => {
  sandbox.restore()
  getConnectionStub.reset()
  loggerSpy.reset()
  done()
})

test('### Start Arrow ###', function (t) {
  server()
    .then((inst) => {
      arrow = inst
      connector = arrow.getConnector('appc.oracledb')
      connector.getConnection = getConnectionStub
      connector.logger = logger
      t.ok(arrow, 'Arrow has been started')
      t.end()
    })
    .catch((err) => {
      t.threw(err)
    })
})

test('### _query unit test - getConnection firstCall Error ###', function (t) {
  // Stubs and spies
  const cbSpy = sandbox.spy()
  getConnectionStub.callsFake((callback) => {
    callback('Error message');
  })

  // Execution
  _query.call(connector, 'query', 'data', 'options', cbSpy, 'exec')
  t.ok(loggerSpy.calledOnce)
  t.equals(loggerSpy.firstCall.args[0], 'ORACLE QUERY=>')
  t.equals(loggerSpy.firstCall.args[1], 'query')
  t.equals(loggerSpy.firstCall.args[2], 'data')
  t.ok(getConnectionStub.calledOnce)
  t.type(getConnectionStub.firstCall.args[0], 'function')
  t.ok(cbSpy.calledOnce)
  t.equals(cbSpy.firstCall.args[0], 'Error message')


  t.end()
})

test('### _query unit test - connection.execute error ###', function (t) {
  // Data
  const queryOptions = {
    autoCommit: true,
    maxRows: 1000
  }
  const connection = {}

  // Stubs and spies
  const cbSpy = sandbox.spy()
  const connectionStub = sandbox.stub().callsFake((query, data, queryOptions, callback) => {
    callback('Connection error')
  })
  connection.execute = connectionStub
  getConnectionStub.callsFake((callback) => {
    callback(null, connection);
  })

  // Execution
  _query.call(connector, 'query', 'data', 'options', cbSpy, 'exec')
  t.ok(loggerSpy.calledOnce)
  t.equals(loggerSpy.firstCall.args[0], 'ORACLE QUERY=>')
  t.equals(loggerSpy.firstCall.args[1], 'query')
  t.equals(loggerSpy.firstCall.args[2], 'data')
  t.ok(getConnectionStub.calledOnce)
  t.ok(connectionStub.calledOnce)
  t.equals(connectionStub.firstCall.args[0], 'query')
  t.equals(connectionStub.firstCall.args[1], 'data')
  t.deepequal(connectionStub.firstCall.args[2], queryOptions)
  t.type(connectionStub.firstCall.args[3], 'function')
  t.ok(cbSpy.calledOnce)
  t.equals(cbSpy.firstCall.args[0], 'Connection error')

  t.end()
})

test('### _query unit test - connection.execute ORACLE error ###', function (t) {
  // Data
  const connection = {}
  const err = {
    message: 'ORA-03113: end-of-file on communication channel'
  }

  // Stubs and spies
  getConnectionStub.callsFake((callback) => {
    callback(null, connection)
  })
  const connectionStub = sandbox.stub().callsFake((query, data, queryOptions, callback) => {
    callback(err)
  })
  connection.execute = connectionStub
  const disconnectStub = sandbox.stub(connector, 'disconnect').callsFake((next) => {
    connector.connection = null;
    next();
  })
  const connectStub = sandbox.stub(connector, 'connect').callsFake((callback) => {
    callback(null, 'test')
  })
  const cbSpy = sandbox.spy()

  // Execution
  _query.call(connector, 'query', 'data', 'options', cbSpy, 'exec')
  t.ok(loggerSpy.calledOnce)
  t.equals(loggerSpy.firstCall.args[0], 'ORACLE QUERY=>')
  t.equals(loggerSpy.firstCall.args[1], 'query')
  t.equals(loggerSpy.firstCall.args[2], 'data')
  t.ok(getConnectionStub.calledTwice)
  t.ok(connectStub.calledOnce)
  t.ok(disconnectStub.calledOnce)
  t.ok(cbSpy.calledOnce)
  t.equals(cbSpy.firstCall.args[0], err)

  t.end()
})

test('### _query unit test - getConnection error ###', function (t) {
  // Data
  const err = {
    message: 'ORA-03113: end-of-file on communication channel'
  }
  const connection = {}

  // Stubs and spies
  const disconnectStub = sandbox.stub(connector, 'disconnect').callsFake((next) => {
    connector.connection = null;
    next()
  })
  const connectStub = sandbox.stub(connector, 'connect').callsFake((callback) => {
    callback(null, 'test')
  })
  const connectionStub = sandbox.stub().callsFake((query, data, queryOptions, callback) => {
    callback(err)
  })
  connection.execute = connectionStub

  getConnectionStub.onFirstCall().callsFake((callback) => {
    callback(null, connection)
  })
  getConnectionStub.onSecondCall().callsFake((callback) => {
    callback('Get connection error', connection);
  })

  const cbSpy = sandbox.spy()

  // Execution
  _query.call(connector, 'query', 'data', 'options', cbSpy, 'exec')
  t.ok(loggerSpy.calledOnce)
  t.equals(loggerSpy.firstCall.args[0], 'ORACLE QUERY=>')
  t.equals(loggerSpy.firstCall.args[1], 'query')
  t.equals(loggerSpy.firstCall.args[2], 'data')
  t.ok(getConnectionStub.calledTwice)
  t.ok(connectStub.calledOnce)
  t.ok(disconnectStub.calledOnce)
  t.ok(cbSpy.calledOnce)
  t.equals(cbSpy.firstCall.args[0], 'Get connection error')

  t.end()
})

test('### _query unit test - getConnection no connection ###', function (t) {
  // Data
  const options = {
    useResultSet: true
  }
  const err = {
    message: 'ORA-03113: end-of-file on communication channel'
  }
  const connection = {}

  // Stubs and spies
  const disconnectStub = sandbox.stub(connector, 'disconnect').callsFake((next) => {
    connector.connection = null;
    next()
  })
  const connectStub = sandbox.stub(connector, 'connect').callsFake((callback) => {
    callback(null, 'test')
  })
  const connectionStub = sandbox.stub().callsFake((query, data, queryOptions, callback) => {
    callback(err)
  })
  connection.execute = connectionStub

  getConnectionStub.onFirstCall().callsFake((callback) => {
    callback(null, connection)
  })
  getConnectionStub.onSecondCall().callsFake((callback) => {
    callback(null, undefined);
  })

  const cbSpy = sandbox.spy()

  // Execution
  _query.call(connector, 'query', 'data', options, cbSpy, 'exec')
  t.ok(loggerSpy.calledOnce)
  t.equals(loggerSpy.firstCall.args[0], 'ORACLE QUERY=>')
  t.equals(loggerSpy.firstCall.args[1], 'query')
  t.equals(loggerSpy.firstCall.args[2], 'data')
  t.ok(getConnectionStub.calledTwice)
  t.type(getConnectionStub.firstCall.args[0], 'function')
  t.type(getConnectionStub.secondCall.args[0], 'function')
  t.ok(connectStub.calledOnce)
  t.ok(disconnectStub.calledOnce)
  t.type(connectStub.firstCall.args[0], 'function')
  t.type(disconnectStub.firstCall.args[0], 'function')
  t.ok(cbSpy.calledOnce)
  t.equals(cbSpy.firstCall.args[0], 'No connection to the db.')

  t.end()
})

test('### _query unit test - executor call ###', function (t) {
  // Data
  const connection = {}

  // Stubs and spies
  const connectionStub = sandbox.stub().callsFake((query, data, queryOptions, callback) => {
    callback(null, 'result')
  })
  connection.execute = connectionStub

  const translateResultsStub = sandbox.stub(connector, 'translateResults').callsFake(() => {
    return 'test'
  })
  getConnectionStub.onFirstCall().callsFake((callback) => {
    callback(null, connection)
  })

  const cbSpy = sandbox.spy()
  const executor = sandbox.spy()

  // Execution
  _query.call(connector, 'query', 'data', 'options', cbSpy, executor)
  t.ok(loggerSpy.calledOnce)
  t.equals(loggerSpy.firstCall.args[0], 'ORACLE QUERY=>')
  t.equals(loggerSpy.firstCall.args[1], 'query')
  t.equals(loggerSpy.firstCall.args[2], 'data')
  t.ok(getConnectionStub.calledOnce)
  t.type(getConnectionStub.firstCall.args[0], 'function')
  t.ok(cbSpy.notCalled)
  t.ok(translateResultsStub.calledOnce)
  t.equals(translateResultsStub.firstCall.args[0], 'result')
  t.equals(executor.firstCall.args[0], 'test')
  t.equals(executor.firstCall.args[1], 'result')

  t.end()
})

test('### _query unit test - fetchRowsFromResultSet call  error case ###', function (t) {
  // Data
  const result = {
    resultSet: {}
  }
  const options = {
    useResultSet: true
  }
  const connection = {}
  const queryOptions = { autoCommit: true, resultSet: true, prefetchRows: 1000 }

  // Stubs and spies
  const connectionStub = sandbox.stub().callsFake((query, data, queryOptions, callback) => {
    callback(null, result)
  })
  connection.execute = connectionStub

  getConnectionStub.onFirstCall().callsFake((callback) => {
    callback(null, connection)
  })

  const getRowsStub = sandbox.stub().callsFake((neshto, callback) => {
    callback('Error')
  })
  const closeSpy = sandbox.spy()
  result.resultSet.close = closeSpy
  result.resultSet.getRows = getRowsStub

  const cbSpy = sandbox.spy()
  const executor = sandbox.spy()

  // Execution
  _query.call(connector, 'query', 'data', options, cbSpy, executor)
  t.ok(loggerSpy.calledOnce)
  t.equals(loggerSpy.firstCall.args[0], 'ORACLE QUERY=>')
  t.equals(loggerSpy.firstCall.args[1], 'query')
  t.equals(loggerSpy.firstCall.args[2], 'data')
  t.ok(getConnectionStub.calledOnce)
  t.type(getConnectionStub.firstCall.args[0], 'function')
  t.ok(connectionStub.calledOnce)
  t.equals(connectionStub.firstCall.args[0], 'query')
  t.equals(connectionStub.firstCall.args[1], 'data')
  t.deepequal(connectionStub.firstCall.args[2], queryOptions)
  t.type(connectionStub.firstCall.args[3], 'function')
  t.ok(getRowsStub.calledOnce)
  t.equals(getRowsStub.firstCall.args[0], 1000)
  t.type(getRowsStub.firstCall.args[1], 'function')
  t.ok(closeSpy.calledOnce)
  t.ok(closeSpy.calledWith())
  t.ok(cbSpy.calledOnce)
  t.equals(cbSpy.firstCall.args[0], 'Error')

  t.end()
})

test('### _query unit test - fetchRowsFromResultSet call ###', function (t) {
  // Data
  const rows = ['BOOKS', 'BOOK_ID', 'VARCHAR2', 20, null, 'N']
  const connection = {}
  const options = {
    useResultSet: true
  }
  const result = {
    resultSet: {}
  }
  const queryOptions = { autoCommit: true, resultSet: true, prefetchRows: 1000 }

  // Stubs and spies
  const connectionStub = sandbox.stub().callsFake((query, data, queryOptions, callback) => {
    callback(null, result)
  })
  connection.execute = connectionStub

  getConnectionStub.callsFake((callback) => {
    callback(null, connection)
  })
  const getRowsStub = sandbox.stub()
  getRowsStub.onFirstCall().callsFake((prefetchRows, callback) => {
    callback(null, rows)
  })
  getRowsStub.onSecondCall().callsFake((prefetchRows, callback) => {
    callback(null, [])
  })
  const closeSpy = sandbox.spy()
  result.resultSet.getRows = getRowsStub
  result.resultSet.close = closeSpy

  const cbSpy = sandbox.spy()
  const executor = sandbox.spy()

  // Execution
  _query.call(connector, 'query', 'data', options, cbSpy, executor)
  t.ok(loggerSpy.calledOnce)
  t.equals(loggerSpy.firstCall.args[0], 'ORACLE QUERY=>')
  t.equals(loggerSpy.firstCall.args[1], 'query')
  t.equals(loggerSpy.firstCall.args[2], 'data')
  t.ok(getConnectionStub.calledOnce)
  t.type(getConnectionStub.firstCall.args[0], 'function')
  t.ok(connectionStub.calledOnce)
  t.equals(connectionStub.firstCall.args[0], 'query')
  t.equals(connectionStub.firstCall.args[1], 'data')
  t.deepequal(connectionStub.firstCall.args[2], queryOptions)
  t.type(connectionStub.firstCall.args[3], 'function')
  t.ok(getRowsStub.calledTwice)
  t.equals(getRowsStub.firstCall.args[0], 1000)
  t.type(getRowsStub.firstCall.args[1], 'function')
  t.ok(closeSpy.calledOnce)
  t.ok(closeSpy.calledWith())
  t.ok(cbSpy.notCalled)

  t.end()
})

test('### _query unit test - fetchRowsFromResultSet call ###', function (t) {
  // Data
  const connection = {}
  const rows = ['BOOKS', 'BOOK_ID', 'VARCHAR2', 20, null, 'N']
  const options = {
    useResultSet: true
  }
  const result = {
    resultSet: {}
  }
  const queryOptions = { autoCommit: true, resultSet: true, prefetchRows: 1000 }

  // Stubs and spies
  const connectionStub = sandbox.stub().callsFake((query, data, queryOptions, callback) => {
    callback(null, result)
  })
  connection.execute = connectionStub
  getConnectionStub.onFirstCall().callsFake((callback) => {
    callback(null, connection)
  })
  const getRowsStub = sandbox.stub()
  getRowsStub.onFirstCall().callsFake((prefetchRows, callback) => {
    callback(null, rows)
  })
  getRowsStub.onSecondCall().callsFake((prefetchRows, callback) => {
    callback(null, [])
  })
  const closeStub = sandbox.stub().callsFake((callback) => {
    callback('Error')
  })
  result.resultSet.getRows = getRowsStub
  result.resultSet.close = closeStub

  const cbSpy = sandbox.spy()
  const executor = sandbox.spy()

  // Execution
  _query.call(connector, 'query', 'data', options, cbSpy, executor)
  t.ok(loggerSpy.calledOnce)
  t.equals(loggerSpy.firstCall.args[0], 'ORACLE QUERY=>')
  t.equals(loggerSpy.firstCall.args[1], 'query')
  t.equals(loggerSpy.firstCall.args[2], 'data')
  t.ok(getConnectionStub.calledOnce)
  t.type(getConnectionStub.firstCall.args[0], 'function')
  t.ok(connectionStub.calledOnce)
  t.equals(connectionStub.firstCall.args[0], 'query')
  t.equals(connectionStub.firstCall.args[1], 'data')
  t.deepequal(connectionStub.firstCall.args[2], queryOptions)
  t.type(connectionStub.firstCall.args[3], 'function')
  t.ok(getRowsStub.calledTwice)
  t.equals(getRowsStub.firstCall.args[0], 1000)
  t.type(getRowsStub.firstCall.args[1], 'function')
  t.ok(cbSpy.calledOnce)
  t.equals(cbSpy.firstCall.args[0], 'Error')

  t.end()
})

test('### _query unit test - fetchRowsFromResultSet call ###', function (t) {
  // Data 
  const options = {
    useResultSet: true
  }
  const result = {
    resultSet: {}
  }
  const rows = ['BOOKS', 'BOOK_ID', 'VARCHAR2', 20, null, 'N']
  const connection = {}
  const queryOptions = { autoCommit: true, resultSet: true, prefetchRows: 1000 }

  // Stubs and spies
  const connectionStub = sandbox.stub().callsFake((query, data, queryOptions, callback) => {
    callback(null, result)
  })
  connection.execute = connectionStub

  getConnectionStub.onFirstCall().callsFake((callback) => {
    callback(null, connection)
  })
  const getRowsStub = sandbox.stub()
  getRowsStub.onFirstCall().callsFake((prefetchRows, callback) => {
    callback(null, rows)
  })
  getRowsStub.onSecondCall().callsFake((prefetchRows, callback) => {
    callback(null, [])
  })
  const closeStub = sandbox.stub().callsFake((callback) => {
    callback(null)
  })
  result.resultSet.getRows = getRowsStub
  result.resultSet.close = closeStub

  const translateResultsStub = sandbox.stub(connector, 'translateResults').callsFake(() => {
    return 'test'
  })
  const cbSpy = sandbox.spy()
  const executor = sandbox.spy()

  // Execution
  _query.call(connector, 'query', 'data', options, cbSpy, executor)
  t.ok(loggerSpy.calledOnce)
  t.equals(loggerSpy.firstCall.args[0], 'ORACLE QUERY=>')
  t.equals(loggerSpy.firstCall.args[1], 'query')
  t.equals(loggerSpy.firstCall.args[2], 'data')
  t.ok(getConnectionStub.calledOnce)
  t.ok(cbSpy.notCalled)
  t.ok(executor.calledOnce)
  t.equals(executor.firstCall.args[0], 'test')
  t.deepequal(executor.firstCall.args[1], result)
  t.ok(getConnectionStub.calledOnce)
  t.type(getConnectionStub.firstCall.args[0], 'function')
  t.ok(connectionStub.calledOnce)
  t.equals(connectionStub.firstCall.args[0], 'query')
  t.equals(connectionStub.firstCall.args[1], 'data')
  t.deepequal(connectionStub.firstCall.args[2], queryOptions)
  t.type(connectionStub.firstCall.args[3], 'function')
  t.ok(getRowsStub.calledTwice)
  t.equals(getRowsStub.firstCall.args[0], 1000)
  t.type(getRowsStub.firstCall.args[1], 'function')

  t.end()
})

test('### _query unit test - with 4 args ###', function (t) {
  // Data 
  const options = {
    useResultSet: true
  }
  const result = {
    resultSet: {}
  }
  const rows = ['BOOKS', 'BOOK_ID', 'VARCHAR2', 20, null, 'N']
  const connection = {}
  const queryOptions = { autoCommit: true, resultSet: true, prefetchRows: 1000 }

  // Stubs and spies
  const connectionStub = sandbox.stub().callsFake((query, data, queryOptions, callback) => {
    callback(null, result)
  })
  connection.execute = connectionStub

  getConnectionStub.onFirstCall().callsFake((callback) => {
    callback(null, connection)
  })

  const getRowsStub = sandbox.stub()
  getRowsStub.onFirstCall().callsFake((prefetchRows, callback) => {
    callback(null, rows)
  })
  getRowsStub.onSecondCall().callsFake((prefetchRows, callback) => {
    callback(null, [])
  })
  const closeStub = sandbox.stub().callsFake((callback) => {
    callback(null)
  })
  result.resultSet.getRows = getRowsStub
  result.resultSet.close = closeStub

  const translateResultsStub = sandbox.stub(connector, 'translateResults').callsFake(() => {
    return 'test'
  })
  const cbSpy = sandbox.spy()
  const executor = sandbox.spy()

  // Execution
  _query.call(connector, 'query', 'data', options, cbSpy)
  t.ok(loggerSpy.calledOnce)
  t.equals(loggerSpy.firstCall.args[0], 'ORACLE QUERY=>')
  t.equals(loggerSpy.firstCall.args[1], 'query')
  t.equals(loggerSpy.firstCall.args[2], 'data')
  t.ok(getConnectionStub.calledOnce)
  t.ok(cbSpy.calledOnce)
  t.equals(cbSpy.firstCall.args[0], 'test')
  t.deepequal(cbSpy.firstCall.args[1], result)
  t.ok(getConnectionStub.calledOnce)
  t.type(getConnectionStub.firstCall.args[0], 'function')
  t.ok(connectionStub.calledOnce)
  t.equals(connectionStub.firstCall.args[0], 'query')
  t.equals(connectionStub.firstCall.args[1], 'data')
  t.deepequal(connectionStub.firstCall.args[2], queryOptions)
  t.type(connectionStub.firstCall.args[3], 'function')
  t.ok(getRowsStub.calledTwice)
  t.equals(getRowsStub.firstCall.args[0], 1000)
  t.type(getRowsStub.firstCall.args[1], 'function')
  t.ok(closeStub.calledOnce)
  t.type(closeStub.firstCall.args[0], 'function')
  t.ok(translateResultsStub.calledOnce)
  t.deepequal(translateResultsStub.firstCall.args[0], result)

  t.end()
})

test('### _query unit test - with less than 4 args ###', function (t) {
  // Data
  const options = {
    useResultSet: true
  }
  const result = {
    resultSet: {}
  }
  const rows = ['BOOKS', 'BOOK_ID', 'VARCHAR2', 20, null, 'N']
  const connection = {}
  const queryOptions = { autoCommit: true, maxRows: 1000 }

  // Stubs and spies
  const _Stub = sandbox.stub(_, 'isFunction').callsFake((data) => {
    return true
  })
  const connectionStub = sandbox.stub().callsFake((query, data, queryOptions, callback) => {
    callback(null, result)
  })
  connection.execute = connectionStub

  getConnectionStub.onFirstCall().callsFake((callback) => {
    callback(null, connection)
  })
  const getRowsStub = sandbox.stub()
  getRowsStub.onFirstCall().callsFake((prefetchRows, callback) => {
    callback(null, rows)
  })
  getRowsStub.onSecondCall().callsFake((prefetchRows, callback) => {
    callback(null, [])
  })

  result.resultSet.getRows = getRowsStub

  const translateResultsStub = sandbox.stub(connector, 'translateResults').callsFake(() => {
    return 'test'
  })
  const cbSpy = sandbox.spy()
  const executor = sandbox.spy()

  // Execution
  _query.call(connector, 'query', cbSpy, executor)
  t.ok(loggerSpy.calledOnce)
  t.equals(loggerSpy.firstCall.args[0], 'ORACLE QUERY=>')
  t.equals(loggerSpy.firstCall.args[1], 'query')
  t.equals(loggerSpy.firstCall.args[2], null)
  t.ok(cbSpy.notCalled)
  t.equals(executor.firstCall.args[0], 'test')
  t.deepequal(executor.firstCall.args[1], result)
  t.ok(getRowsStub.notCalled)
  t.ok(getConnectionStub.calledOnce)
  t.type(getConnectionStub.firstCall.args[0], 'function')
  t.ok(connectionStub.calledOnce)
  t.equals(connectionStub.firstCall.args[0], 'query')
  t.deepequal(connectionStub.firstCall.args[1], [])
  t.deepequal(connectionStub.firstCall.args[2], queryOptions)
  t.type(connectionStub.firstCall.args[3], 'function')
  t.ok(translateResultsStub.calledOnce)
  t.deepequal(translateResultsStub.firstCall.args[0], result)

  t.end()
})

test('### _query unit test - with less than 4 args ###', function (t) {
  // Data 
  const options = {
    useResultSet: true
  }
  const result = {
    resultSet: {}
  }
  const rows = ['BOOKS', 'BOOK_ID', 'VARCHAR2', 20, null, 'N']
  const connection = {}
  const queryOptions = { autoCommit: true, maxRows: 1000 }

  // Stubs and spies

  const _Stub = sandbox.stub(_, 'isFunction').callsFake((data) => {
    return false
  })
  const connectionStub = sandbox.stub().callsFake((query, data, queryOptions, callback) => {
    callback(null, result)
  })
  connection.execute = connectionStub
  getConnectionStub.onFirstCall().callsFake((callback) => {
    callback(null, connection)
  })

  const translateResultsStub = sandbox.stub(connector, 'translateResults').callsFake(() => {
    return 'test'
  })
  const cbSpy = sandbox.spy()

  // Execution
  _query.call(connector, 'query', 'data', cbSpy)
  t.ok(loggerSpy.calledOnce)
  t.equals(loggerSpy.firstCall.args[0], 'ORACLE QUERY=>')
  t.equals(loggerSpy.firstCall.args[1], 'query')
  t.equals(loggerSpy.firstCall.args[2], 'data')
  t.ok(getConnectionStub.calledOnce)
  t.type(getConnectionStub.firstCall.args[0], 'function')
  t.ok(cbSpy.calledOnce)
  t.equals(cbSpy.firstCall.args[0], 'test')
  t.deepequal(cbSpy.firstCall.args[1], result)
  t.ok(translateResultsStub.calledOnce)
  t.deepequal(translateResultsStub.firstCall.args[0], result)
  t.ok(connectionStub.calledOnce)
  t.equals(connectionStub.firstCall.args[0], 'query')
  t.equals(connectionStub.firstCall.args[1], 'data')
  t.deepequal(connectionStub.firstCall.args[2], queryOptions)

  t.end()
})

test('### Stop Arrow ###', function (t) {
  arrow.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
