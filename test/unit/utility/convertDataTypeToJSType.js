'use strict'

const test = require('tap').test
const convertDataTypeToJSType = require('../../../lib/utility/convertDataTypeToJSType').convertDataTypeToJSType

test('### convertDataTypeToJSType unit test - for Number ### ', function (t) {
  const dataType = 'NUMBER'
  var type = convertDataTypeToJSType(dataType)
  t.equals(type, Number)
  t.end()
})
test('### convertDataTypeToJSType unit test - for BINARY_FLOAT ### ', function (t) {
  const dataType = 'BINARY_FLOAT'
  var type = convertDataTypeToJSType(dataType)
  t.equals(type, Number)
  t.end()
})
test('### convertDataTypeToJSType unit test - for BINARY_DOUBLE ### ', function (t) {
  const dataType = 'NUMBER'
  var type = convertDataTypeToJSType(dataType)
  t.equals(type, Number)
  t.end()
})

test('### convertDataTypeToJSType unit test - for Date ### ', function (t) {
  const dataType = 'DATE'
  var type = convertDataTypeToJSType(dataType)
  t.equals(type, Date)
  t.end()
})

test('### convertDataTypeToJSType unit test - default ### ', function (t) {
  const dataType = ''
  var type = convertDataTypeToJSType(dataType)
  t.equals(type, String)
  t.end()
})
