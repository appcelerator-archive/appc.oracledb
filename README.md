# Oracle Database Connector

This is an Arrow connector to Oracle Database.

## Prerequisites

This connector requires Oracle Instant Client installed. To install it, please follow the instructions for your environment here:
http://www.oracle.com/technetwork/database/features/instant-client/index-097480.html

The connector also depends on the 'node-oracledb' module. To be able to properly install the connector, please check the prerequisites here:
https://github.com/oracle/node-oracledb#-installation

## Installation

To install the connector use:

```bash
$ appc install connector/appc.oracledb --save
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


# Contributing

This project is open source and licensed under the [Apache Public License (version 2)](http://www.apache.org/licenses/LICENSE-2.0).  Please consider forking this project to improve, enhance or fix issues. If you feel like the community will benefit from your fork, please open a pull request.

To protect the interests of the contributors, Appcelerator, customers and end users we require contributors to sign a Contributors License Agreement (CLA) before we pull the changes into the main repository. Our CLA is simple and straightforward - it requires that the contributions you make to any Appcelerator open source project are properly licensed and that you have the legal authority to make those changes. This helps us significantly reduce future legal risk for everyone involved. It is easy, helps everyone, takes only a few minutes, and only needs to be completed once.

[You can digitally sign the CLA](http://bit.ly/app_cla) online. Please indicate your email address in your first pull request so that we can make sure that will locate your CLA.  Once you've submitted it, you no longer need to send one for subsequent submissions.


# Legal Stuff

Appcelerator is a registered trademark of Appcelerator, Inc. Arrow and associated marks are trademarks of Appcelerator. All other marks are intellectual property of their respective owners. Please see the LEGAL information about using our trademarks, privacy policy, terms of usage and other legal information at [http://www.appcelerator.com/legal](http://www.appcelerator.com/legal).