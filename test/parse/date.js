'use strict';

const expect = require('chai').expect;

const parseDate = require('../../lib/parse/date');

describe('parseDate', function () {
	it('parses a DD.MM.YYYY or DDMMYYYY string to a Date object', function () {
		expect(parseDate('29.02.2016')).to.deep.equal(new Date(2016, 1, 29));
		expect(parseDate('01011970')).to.deep.equal(new Date(1970, 0, 1));
		expect(parseDate('31122010')).to.deep.equal(new Date(2010, 11, 31));
	})

	it('accepts HHMM as a second argument for hours and minutes', function () {
		expect(parseDate('29.02.2016', '1200')).to.deep.equal(new Date(2016, 1, 29, 12, 0));
		expect(parseDate('01011970', '2400')).to.deep.equal(new Date(1970, 0, 2, 0, 0));
		expect(parseDate('31122010', '1234')).to.deep.equal(new Date(2010, 11, 31, 12, 34));
	})
})
