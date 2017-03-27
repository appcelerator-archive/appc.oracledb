'use strict'

const test = require('tap').test
const sinon = require('sinon')
const createConnector = require('../../lib/').create

test('### Should returns connector capabilities ###', function (t) {
  const connectorExtendSpy = sinon.spy()
  const capabilitiesArray = ['ConnectsToADataSource', 'ValidatesConfiguration', 'GeneratesModels', 'CanCreate', 'CanRetrieve', 'CanUpdate', 'CanDelete']
  const ArrowMock = {
    Connector: {
      Capabilities: {
        ConnectsToADataSource: 'ConnectsToADataSource',
        ValidatesConfiguration: 'ValidatesConfiguration',
        GeneratesModels: 'GeneratesModels',
        CanCreate: 'CanCreate',
        CanRetrieve: 'CanRetrieve',
        CanUpdate: 'CanUpdate',
        CanDelete: 'CanDelete',
      },
      extend: (capabilities) => {
        connectorExtendSpy()
        return capabilities
      }
    },
    Version: '1.8.0'
  }

  const connector = createConnector(ArrowMock)
  t.ok(connector)
  t.ok(connectorExtendSpy.calledOnce)
  t.ok(connector.capabilities)
  t.ok(connector.capabilities)
  t.deepequal(connector.capabilities, capabilitiesArray)
  t.end()
})

test('### Should throw error if Arrow version is not > 1.7.0 ###', function (t) {
  const ArrowMock = {
    Version: '1.6.0'
  }
  t.throws(function () {
    createConnector(ArrowMock)
  }, { message: 'This connector requires at least version 1.7.0 of Arrow; please run `appc use latest`.' }, { skip: false })
  t.end()
})

test('### Should throw error if Arrow version is not there ###', function (t) {
  const ArrowMock = {
  }
  t.throws(function () {
    createConnector(ArrowMock)
  }, { message: 'This connector requires at least version 1.7.0 of Arrow; please run `appc use latest`.' }, { skip: false })
  t.end()
})