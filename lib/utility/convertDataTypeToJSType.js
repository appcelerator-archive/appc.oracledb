/**
 * Converts SQL data types to their appropriate JavaScript type.
 * @param dataType
 * @returns {*}
 */
exports.convertDataTypeToJSType = function convertDataTypeToJSType(dataType) {
	switch (dataType) {
		case 'NUMBER':
		case 'BINARY_FLOAT':
		case 'BINARY_DOUBLE':
			return Number;
		case 'DATE':
			return Date;
		default:
			return String;
	}
};
