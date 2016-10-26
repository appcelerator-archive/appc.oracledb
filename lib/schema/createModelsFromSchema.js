var Arrow = require('arrow'),
	_ = require('lodash');

/**
 * Creates models from your schema (see "fetchSchema" for more information on the schema).
 */
exports.createModelsFromSchema = function () {
	var self = this,
		models = {};

	Object.keys(self.schema.objects).forEach(function (modelName) {
		var object = self.schema.objects[modelName],
			primaryKeyName = self.schema.primary_keys[modelName] || 'ID',
			fields = {};

		Object.keys(object).forEach(function (fieldName) {
			if (fieldName !== primaryKeyName) {
				fields[fieldName] = {
					type: self.convertDataTypeToJSType(object[fieldName].DATA_TYPE),
					required: object.NULLABLE === 'N'
				};
			}
		});

		models[self.name + '/' + modelName] = Arrow.Model.extend(self.name + '/' + modelName, {
			name: self.name + '/' + modelName,
			autogen: !!self.config.modelAutogen,
			fields: fields,
			connector: self,
			metadata: {
				primarykey: primaryKeyName
			},
			generated: true
		});
	});

	self.models = _.defaults(self.models || {}, models);
};
