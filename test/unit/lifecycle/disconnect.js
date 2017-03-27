'use strinct'

const test = require('tap').test
const disconnect = require('../../../lib/lifecycle/disconnect').disconnect
const sinon = require('sinon')

const connector = {
  config: 'config',
  connection: 'connection'
}

test('### disconnect unit test - Ok case ###', function (t) {
  const cbSpy = sinon.spy()
  disconnect.call(connector, cbSpy)
  t.ok(cbSpy.calledOnce)
  t.ok(cbSpy.calledWith())
  t.equals(connector.connection, null)

  t.end()
})
