'use strict'

const test = require('tap').test
const getInstanceFromRow = require('../../../lib/utility/getInstanceFromRow').getInstanceFromRow
const sinon = require('sinon')
const server = require('../../server')
const getPrimaryKeyColumn = require('../../../lib/utility/getPrimaryKeyColumn')

var connector
var arrow
const getPrimaryKeyColumnStub = sinon.stub(getPrimaryKeyColumn, 'getPrimaryKeyColumn').callsFake((Model) => {
  return returnKey()
})
var returnKey = () => { }

test('### Start Arrow ###', function (t) {
  server()
    .then((inst) => {
      arrow = inst
      connector = arrow.getConnector('appc.oracledb')
      connector.getPrimaryKeyColumn = getPrimaryKeyColumnStub
      t.ok(arrow, 'Arrow has been started')
      t.end()
    })
    .catch((err) => {
      t.threw(err)
    })
})

test('### getInstanceFromRow unit test - with primary key ###', function (t) {
  const Model = arrow.getModel('Posts')
  returnKey = () => {
    return 'id'
  }
  const row = {
    id: 40,
    TITLE: 'Title',
    CONTENT: 'Content',
    BOOKS: ['Book1', 'Book2']
  }
  var instance = Model.instance(row, true)
  instance.setPrimaryKey(row.id)
  var result = getInstanceFromRow.call(connector, Model, row)
  t.ok(getPrimaryKeyColumnStub.calledOnce)
  t.ok(getPrimaryKeyColumnStub.firstCall.args[0], Model)
  t.deepequal(result, instance)

  t.end()
})

test('### getInstanceFromRow unit test - with primary key ###', function (t) {
  const Model = arrow.getModel('Books')
  returnKey = () => {
    return false
  }
  const row = {
    id: 45,
    CATEGORYID: 'CategoryId',
    DISCOUNTED: true,
    NAME: 'Book Name',
    QUANTITYPERUNIT: '40',
    UNITPRICE: 5,
    POST: 'Test Post'
  }
  var instance = Model.instance(row, true)
  var result = getInstanceFromRow.call(connector, Model, row)
  t.ok(getPrimaryKeyColumnStub.calledTwice)
  t.ok(getPrimaryKeyColumnStub.secondCall.args[0], Model)
  t.deepequal(result, instance)
  t.deepequal(result, instance)

  t.end()
})

test('### Stop Arrow ###', function (t) {
  arrow.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
