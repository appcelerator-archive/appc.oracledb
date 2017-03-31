'use strict'

const tap = require('tap')
const test = tap.test
const sinon = require('sinon')
const translateResults = require('../../../lib/utility/translateResults').translateResults

const sandbox = sinon.sandbox

tap.beforeEach((done) => {
    sandbox.create()
    done()
})

tap.afterEach((done) => {
    sandbox.restore()
    done()
})

test('### translateResults Call - OK Case ###', function (t) {
    // Data
    const results = {
        rows: [['COUNTRY_ID', 'ENABLED', 'C'], ['DEPARTMENT_ID', 'ENABLED', 'P']],
        metaData: [{ name: 'Table_Name' }, { name: 'Column_Name' }]
    }

    // Execution
    const resultObjects = translateResults(results)

    // Tests
    t.equals(resultObjects.length, 2)
    t.equals(resultObjects[0].Table_Name, 'COUNTRY_ID')
    t.equals(resultObjects[0].Column_Name, 'ENABLED')
    t.equals(resultObjects[1].Table_Name, 'DEPARTMENT_ID')
    t.equals(resultObjects[1].Column_Name, 'ENABLED')

    t.end()
})

test('### translateResults Call - Error Case ###', function (t) {
    // Data
    const results = { rows: null }

    // Execution
    const resultObjects = translateResults(results)

    // Tests
    t.equals(typeof resultObjects, 'undefined' )

    t.end()
})
