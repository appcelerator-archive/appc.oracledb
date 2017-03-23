// jscs:disable jsDoc
var should = require('should');

exports.query = {
	// To run this test multiple times (useful when you're caching results), increase this number.
	iterations: 1,
	insert: [
		{
			title: 'Rick',
			content: 'Blalock'
		},
		{
			title: 'Nolan',
			content: 'Wright'
		},
		{
			title: 'Nolan',
			content: 'Carroll'
		},
		{
			title: 'Nolan',
			content: 'Reimold'
		},
		{
			title: 'Jeff',
			content: 'Haynie'
		}
	],
	query: [
		{
			where: {
				title: 'Nolan'
			},
			sel: {content: 1},
			order: {
				title: 'true',
				content: -1
			}
		},
		{
			where: {
				title: 'Nolan'
			},
			unsel: {title: 1},
			order: {
				title: 'true',
				content: -1
			}
		},
		{
			where: {
				title: 'Nolan'
			},
			order: {
				title: 'true',
				content: -1
			}
		},
		{},
		{
			where: {
				title: 'does not exist'
			}
		}
	],
	check: function (results) {
		if (results === undefined) {
			// ok!
		} else if (results.length === 3) {
			should(results[0]).have.property('content', 'Wright');
			should(results[1]).have.property('content', 'Reimold');
			should(results[2]).have.property('content', 'Carroll');
		} else if (results.length === 5) {
			should(results).be.ok;
		} else {
			console.error(results);
			throw new Error('Unexpected results: ');
		}
	}
};
