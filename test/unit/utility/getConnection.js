'use strict'

const test = require('tap').test
const getConnection = require('../../../lib/utility/getConnection').getConnection
const sinon = require('sinon')

test('### getConnection unit test ###', function (t) {
  var cbSpy = sinon.spy()
  const connector = {
    connection: 'connection'
  }
  getConnection.call(connector, cbSpy)
  t.ok(cbSpy.calledOnce)
  t.ok(cbSpy.calledWith(null, connector.connection))
  t.end()
})
