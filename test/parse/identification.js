'use strict';

const expect = require('chai').expect;
const parse = require('../../lib/parse/identification');
const IDENTIFICATION_TYPES = parse.IDENTIFICATION_TYPES;

describe('parseIdentification', function () {
	it('returns the parsed data and the length of the block', function () {
		const parsed = parse(Buffer.from('0080ID000018040000'));
		expect(parsed).to.have.property('data');
		expect(parsed).to.have.length(18);
	})
	it('stops parsing when the header block ends', function () {
		// Add garbage data; it should be ignored in the `length` property
		expect( parse(Buffer.from('0080ID000018040000FOOBAR')) )
			.to.have.length(18);
	})
	it('parses header data', function () {
		expect(parse(Buffer.from('0080ID000018041234')).data).to.deep.equal({
			carrier: '0080',
			type: IDENTIFICATION_TYPES.BAHNCARD,
			lastDigits: '1234',
		})
		expect(parse(Buffer.from('0080ID000018011234'))).to.have.deep.property('data.type', IDENTIFICATION_TYPES.CREDIT_CARD);
		expect(parse(Buffer.from('0080ID000018041234'))).to.have.deep.property('data.type', IDENTIFICATION_TYPES.BAHNCARD);
		expect(parse(Buffer.from('0080ID000018071234'))).to.have.deep.property('data.type', IDENTIFICATION_TYPES.DEBIT_CARD);
		expect(parse(Buffer.from('0080ID000018081234'))).to.have.deep.property('data.type', IDENTIFICATION_TYPES.BONUSCARD_BUSINESS);
		expect(parse(Buffer.from('0080ID000018091234'))).to.have.deep.property('data.type', IDENTIFICATION_TYPES.NATIONAL_ID);
		expect(parse(Buffer.from('0080ID000018101234'))).to.have.deep.property('data.type', IDENTIFICATION_TYPES.PASSPORT);
		expect(parse(Buffer.from('0080ID000018111234'))).to.have.deep.property('data.type', IDENTIFICATION_TYPES.BAHNBONUS_CARD);
	})
	it('exposes all possible IDENTIFICATION_TYPES', function () {
		expect(parse.IDENTIFICATION_TYPES).to.deep.equal({
			CREDIT_CARD: 'Credit Card',
			BAHNCARD: 'BahnCard',
			DEBIT_CARD: 'Debit Card',
			BONUSCARD_BUSINESS: 'BonusCard Business',
			NATIONAL_ID: 'National ID Card',
			PASSPORT: 'Passport',
			BAHNBONUS_CARD: 'bahn.bonus Card',
		})
	})
})
