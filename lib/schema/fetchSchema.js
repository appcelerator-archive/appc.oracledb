/**
 * Fetches the schema for your connector.
 *
 * For example, your schema could look something like this:
 * {
 *     objects: {
 *         person: {
 *             first_name: {
 *                 type: 'string',
 *                 required: true
 *             },
 *             last_name: {
 *                 type: 'string',
 *                 required: false
 *             },
 *             age: {
 *                 type: 'number',
 *                 required: false
 *             }
 *         }
 *     }
 * }
 *
 * @param next
 * @returns {*}
 */
exports.fetchSchema = function (next) {
	var self = this;
	// If we already have the schema, just return it.
	if (this.schema) {
		return next(null, this.schema);
	}

	var constraints,
		columns;

	getConstraints();

	/**
	 * Looks up constraints from the db.
	 */
	function getConstraints() {
		var query = 'SELECT ' +
			'cols.TABLE_NAME, ' +
			'cols.COLUMN_NAME, ' +
			'cons.STATUS, ' +
			'cons.CONSTRAINT_TYPE ' +
			'FROM user_constraints cons, user_cons_columns cols ' +
			'WHERE cons.CONSTRAINT_NAME = cols.CONSTRAINT_NAME';
		self._query(query, [], next, function (results) {
			constraints = results;
			getColumns();
		});
	}

	/**
	 * Looks up columns from the schema.
	 */
	function getColumns() {
		var query = 'SELECT ' +
			'TABLE_NAME, ' +
			'COLUMN_NAME, ' +
			'DATA_TYPE, ' +
			'DATA_LENGTH, ' +
			'DATA_PRECISION, ' +
			'NULLABLE ' +
			'FROM user_tab_columns';
		self._query(query, [], next, function (results) {
			columns = results;
			calculateSchema();
		});
	}

	/**
	 * Now that we have our constraints and columns, we can create our schema.
	 */
	function calculateSchema() {
		var schema = {
			objects: {},
			database: self.config.database,
			constraints: {},
			primary_keys: {}
		};

		constraints.forEach(function (constraint) {
			var entry = schema.constraints[constraint.TABLE_NAME];
			if (!entry) {
				entry = schema.constraints[constraint.TABLE_NAME] = {};
			}
			if (constraint.STATUS !== 'ENABLED') {
				return;
			}
			entry[constraint.COLUMN_NAME] = constraint;
			if (constraint.CONSTRAINT_TYPE === 'P') {
				schema.primary_keys[constraint.TABLE_NAME] = constraint.COLUMN_NAME;
			}
		});

		columns.forEach(function (column) {
			var tableName = column.TABLE_NAME,
				columnName = column.COLUMN_NAME;

			var entry = schema.objects[tableName];
			if (!entry) {
				entry = schema.objects[tableName] = {};
			}

			entry[columnName] = column;
		});

		next(null, schema);
	}

};
