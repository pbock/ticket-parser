'use strict';

const expect = require('chai').expect;
const parse = require('../../lib/parse/header');

const headerData = Buffer.concat([
	Buffer.from('U_HEAD0100530080AABBCC-3'),
	Buffer([0,0,0,0,0,0,0,0,0,0,0,0]),
	Buffer.from('0112201412340DEDE'),
])

describe('parseHeader', function () {
	it('returns the parsed data and the length of the block', function () {
		const parsed = parse(headerData);
		expect(parsed).to.have.property('data');
		expect(parsed).to.have.length(headerData.length);
	})
	it('stops parsing when the header block ends', function () {
		// Add garbage data; it should be ignored in the `length` property
		expect( parse(Buffer.concat([ headerData, Buffer.from('FOOBAR') ])) )
			.to.have.length(headerData.length);
	})
	it('parses header data', function () {
		expect(parse(headerData).data).to.deep.equal({
			version: '01',
			pnr: 'AABBCC',
			issueDate: new Date(2014, 11, 1, 12, 34),
			primaryLanguage: 'DE',
			secondaryLanguage: 'DE',
		})
	})
})
