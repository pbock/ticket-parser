'use strict';

const expect = require('chai').expect;
const parse = require('../../lib/parse/certificate');

const certificateBlock = Buffer.concat([
	Buffer.from('ABCD1234EFG'),
	new Buffer([0,0,0,0,0,0,0,0,0,0,0]),
	Buffer.from('27122014271220140123456789'),
]);

describe('parseCertificate', function () {
	it('parses certificate data', function () {
		expect(parse(certificateBlock)).to.deep.equal({
			id: 'ABCD1234EFG',
			validFrom: new Date(2014, 11, 27),
			validUntil: new Date(2014, 11, 28),
			serialNumber: '0123456789',
		})
	})
})
