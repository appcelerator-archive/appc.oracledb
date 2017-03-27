'use strinct'

const test = require('tap').test
const connect = require('../../../lib/lifecycle/connect').connect
const sinon = require('sinon')
const OracleDB = require('oracledb')

const connector = {
  config: 'config',
  connection: null
}

const OracleDBStub = sinon.stub(OracleDB, 'getConnection')

test('### connect unit test - error case ###', function (t) {
  OracleDBStub.callsFake((config, callback) => {
    callback('Error')
  })
  const cbSpy = sinon.spy()
  connect.call(connector, cbSpy)
  t.ok(cbSpy.calledOnce)
  t.equals(cbSpy.firstCall.args[0], 'Error')
  t.ok(OracleDBStub.calledOnce)
  t.equals(OracleDBStub.firstCall.args[0], connector.config)

  OracleDBStub.reset()
  t.end()
})

test('### connect unit test - Ok case ###', function (t) {
  OracleDBStub.callsFake((config, callback) => {
    callback(null, 'connection')
  })
  const cbSpy = sinon.spy()
  connect.call(connector, cbSpy)
  t.ok(cbSpy.calledOnce)
  t.ok(cbSpy.calledWith())
  t.ok(OracleDBStub.calledOnce)
  t.equals(OracleDBStub.firstCall.args[0], connector.config)

  OracleDBStub.reset()
  t.end()
})
