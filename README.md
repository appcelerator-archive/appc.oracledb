# Oracle Database Connector

This is an Arrow connector to Oracle Database.

## Prerequisites

This connector requires Oracle Instant Client to be installed prior to usage. To install it, please follow the instructions for your environment here:
    * [Oracle Instant Client](http://www.oracle.com/technetwork/database/features/instant-client/index-097480.html)
    * The connector also depends on the ‘node-oracledb’ module. To be able to properly install the connector, please check the prerequisites here: [node-oracledb](https://github.com/oracle/node-oracledb#-installation) 

## Installation

To install the connector use:

```bash
$ appc install connector/appc.oracledb
```

## Configuration

Create appc.oracledb.default.js in `<your_project>/conf` directory.

Example appc.oracledb.defaults.js content:
```javascript
module.exports = {
    connectors: {
        'appc.oracledb': {
            // Your connection credentials.
            user: 'hr',
            password: 'welcome',
            connectString: 'localhost/XE',
            // Create models based on your schema that can be used in your API.
            generateModelsFromSchema: true,
            // Whether or not to generate APIs based on the methods in generated models.
            modelAutogen: true
        }
    }
};
```

This example connector configuration will automatically generate models based on your database schema.
If you want to create a custom model, set `generateModelsFromSchema: false` and reference the documentation for more information how to create models.

## Unit Tests

Run the tests:

```bash
npm test
```

The tests will automatically create their own table named "TEST_Post".
