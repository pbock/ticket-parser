'use strict';

const chai = require('chai');
chai.use(require('chai-as-promised'));
const expect = chai.expect;

const extract = require('../lib/extract').extract;
const extractSync = require('../lib/extract').extractSync;

const deflatedBuffer = new Buffer([0x78,0x9c,0x4b,0xcb,0xcf,0x4f,0x4a,0x2c,
	0x4a,0x43,0x22,0x01,0x46,0x83,0x07,0x6c]); // deflate("foobarfoobarfoobar")
const irrelevantData = new Buffer([0x00,0x11,0x22,0x33,0x44]);
const inflatedBuffer = Buffer.from('foobarfoobarfoobar');

describe('extract', function () {
	it(`rejects if something other than a buffer is passed`, function () {
		return Promise.all([
			expect(extract()).to.be.rejected,
			expect(extract('foobar')).to.be.rejected,
			expect(extract(deflatedBuffer.toString())).to.be.rejected,
		])
	})

	it(`looks for a zlib-deflated payload and inflates it`, function () {
		return Promise.all([
			expect(extract(deflatedBuffer)).to.become(inflatedBuffer),
			expect(extract(Buffer.concat([irrelevantData, deflatedBuffer])))
				.to.become(inflatedBuffer),
			expect(extract(Buffer.concat([deflatedBuffer, inflatedBuffer])))
				.to.become(inflatedBuffer),
		])
	})

	it(`rejects if no zlib payload is found`, function () {
		return expect(extract(irrelevantData)).to.be.rejected;
	})
})

describe('extractSync', function () {
	it(`throws if something other than a buffer is passed`, function () {
		expect(() => extractSync()).to.throw();
		expect(() => extractSync('foobar')).to.throw();
		expect(() => extractSync(deflatedBuffer.toString())).to.throw();
	})

	it(`looks for a zlib-deflated payload and inflates it`, function () {
		expect(extractSync(deflatedBuffer)).to.deep.equal(inflatedBuffer);
		expect(extractSync(Buffer.concat([irrelevantData, deflatedBuffer])))
			.to.deep.equal(inflatedBuffer);
		expect(extractSync(Buffer.concat([deflatedBuffer, inflatedBuffer])))
			.to.deep.equal(inflatedBuffer);
	})

	it(`throws if no zlib payload is found`, function () {
		expect(() => extractSync(irrelevantData)).to.throw();
	})
})
