'use strict';

var Arrow = require('arrow');
var _ = require('lodash');

/**
 * Creates models from your schema (see "fetchSchema" for more information on the schema).
 */
exports.createModelsFromSchema = function () {
  var self = this;
  var models = {};

  Object.keys(self.schema.objects).forEach(function (modelName) {
    var object = self.schema.objects[modelName];
    var primaryKeyName = self.schema.primary_keys[modelName];
    var fields = {};

    Object.keys(object).forEach(function (fieldName) {
      if (!primaryKeyName || fieldName !== primaryKeyName) {
        fields[fieldName] = {
          type: self.convertDataTypeToJSType(object[fieldName].DATA_TYPE),
          required: object[fieldName].NULLABLE === 'N'
        };
      }
    });

    models[self.name + '/' + modelName] = Arrow.Model.extend(self.name + '/' + modelName, {
      name: self.name + '/' + modelName,
      autogen: !!self.config.modelAutogen,
      fields: fields,
      connector: self,
      generated: true
    });

    if (primaryKeyName) {
      models[self.name + '/' + modelName].metadata = {
        primarykey: primaryKeyName
      };
    }
  });

  self.models = _.defaults(self.models || {}, models);
};