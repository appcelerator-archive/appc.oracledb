/**
 * Translates the Oracle rows: [], metaData: [] in to a nice array of objects with column names.
 */
exports.translateResults = function (results) {
	var objs = [];
	for (var i = 0; i < results.rows.length; i++) {
		var obj = {};
		var row = results.rows[i];
		for (var j = 0; j < results.metaData.length; j++) {
			var columnName = results.metaData[j];
			obj[columnName.name] = row[j];
		}
		objs.push(obj);
	}
	return objs;
};
