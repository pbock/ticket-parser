'use strict';

const expect = require('chai').expect;
const TicketParser = require('../');

describe('TicketParser', function () {
	it('exposes globals', function () {
		expect(TicketParser).to.have.property('IDENTIFICATION_TYPES');
		expect(TicketParser).to.have.property('BAHNCARD_TYPES');
		expect(TicketParser).to.have.property('FARE_TYPES');
		expect(TicketParser).to.have.property('PRODUCT_CLASSES');
	})
	it('exposes #parse() and #parseSync() methods', function () {
		expect(TicketParser.parse).to.be.a('function');
		expect(TicketParser.parseSync).to.be.a('function');
	})
})
