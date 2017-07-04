'use strict';

var Arrow = require('arrow');

/**
 * Fetches metadata describing your connector's proper configuration.
 * @param next
 */
exports.fetchMetadata = function fetchMetadata(next) {
  next(null, {
    fields: [Arrow.Metadata.Text({
      name: 'connectString',
      description: 'the connection string to your database',
      required: true
    }), Arrow.Metadata.Text({
      name: 'user',
      description: 'the username for connecting to your database',
      required: true
    }), Arrow.Metadata.Text({
      name: 'password',
      description: 'the password for connecting to your database',
      required: false
    }), Arrow.Metadata.Checkbox({
      name: 'generateModelsFromSchema',
      description: 'whether or not to generate models from your schema',
      required: false
    }), Arrow.Metadata.Checkbox({
      name: 'modelAutogen',
      description: 'whether or not generated models should create their own APIs',
      required: false
    })]
  });
};