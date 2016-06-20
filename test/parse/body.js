'use strict';

const expect = require('chai').expect;
const parse = require('../../lib/parse/body');
const parseSBlocks = parse.parseSBlocks;

describe('parseBody', function () {
	const exampleData = Buffer.from('0080BL020126052AAAABBBBCCC___________200320142003200123456789DDDDEEEEFFF___________23032014230320012345679001S0010009Sparpreis')

	it('returns the parsed data and the length of the block', function () {
		const parsed = parse(exampleData);
		expect(parsed).to.have.property('data');
		expect(parsed).to.have.length(exampleData.length);
	})
	it('stops parsing when the block ends', function () {
		// Add garbage data; it should be ignored in the `length` property
		expect( parse(Buffer.concat([ exampleData, Buffer.from('FOOBAR') ])) )
			.to.have.length(exampleData.length);
	})
	it('parses header data', function () {
		expect(parse(exampleData).data).to.deep.equal({
			carrier: '0080',
			certificates: [
				{
					id: 'AAAABBBBCCC',
					validFrom: new Date(2014, 2, 20),
					validUntil: new Date(2001, 2, 21),
					serialNumber: '23456789',
				},
				{
					id: 'DDDDEEEEFFF',
					validFrom: new Date(2014, 2, 23),
					validUntil: new Date(2001, 2, 24),
					serialNumber: '23456790',
				},
			],
			fareName: 'Sparpreis',
		})
	})

	it('exposes PRODUCT_CLASSES, BAHNCARD_TYPES and FARE_TYPES', function () {
		expect(parse.PRODUCT_CLASSES).to.deep.equal({
			REGIONAL: 'Regional',
			IC: 'IC/EC',
			ICE: 'ICE',
		})
		expect(parse.BAHNCARD_TYPES).to.deep.equal({
			NONE: 'keine BahnCard',
			BC50: 'BahnCard 50',
			BC25: 'BahnCard 25',
			BC25EN: 'Einsteiger BahnCard 25 ohne Abo',
			BC25E: 'Einsteiger BahnCard 25',
		})
		expect(parse.FARE_TYPES).to.deep.equal({
			RAIL_AND_FLY: 'Rail&Fly',
			FLEXIBLE: 'Flexpreis',
			SAVER: 'Sparpreis',
		})
	})
})

describe('parseSBlocks', function () {
	const PRODUCT_CLASSES = parse.PRODUCT_CLASSES;
	const BAHNCARD_TYPES = parse.BAHNCARD_TYPES;
	const FARE_TYPES = parse.FARE_TYPES;
	function p(string) {
		return parseSBlocks(Buffer.from(string));
	}

	it('parses fare names', function () {
		expect(p('S0010009Sparpreis')).to.deep.equal({ fareName: 'Sparpreis' });
		expect(p('S0010011Normalpreis')).to.deep.equal({ fareName: 'Normalpreis' });
		expect(p('S0010003foo')).to.deep.equal({ fareName: 'foo' });
	})

	it('parses product classes', function () {
		expect(p('S00200012')).to.deep.equal({ productClass: { overall: PRODUCT_CLASSES.ICE } });
		expect(p('S00200011')).to.deep.equal({ productClass: { overall: PRODUCT_CLASSES.IC } });
		expect(p('S00200010')).to.deep.equal({ productClass: { overall: PRODUCT_CLASSES.REGIONAL } });
		expect(p('S00200013')).to.deep.equal({ productClass: { overall: undefined } });

		expect(p('S0030001A')).to.deep.equal({ productClass: { outbound: PRODUCT_CLASSES.ICE } });
		expect(p('S0030001B')).to.deep.equal({ productClass: { outbound: PRODUCT_CLASSES.IC } });
		expect(p('S0030001C')).to.deep.equal({ productClass: { outbound: PRODUCT_CLASSES.REGIONAL } });
		expect(p('S0030001D')).to.deep.equal({ productClass: { outbound: undefined } });

		expect(p('S0040001A')).to.deep.equal({ productClass: { inbound: PRODUCT_CLASSES.ICE } });
		expect(p('S0040001B')).to.deep.equal({ productClass: { inbound: PRODUCT_CLASSES.IC } });
		expect(p('S0040001C')).to.deep.equal({ productClass: { inbound: PRODUCT_CLASSES.REGIONAL } });
		expect(p('S0040001D')).to.deep.equal({ productClass: { inbound: undefined } });

		expect(p('S00200012S0030001AS0040001B')).to.deep.equal({
			productClass: {
				overall: PRODUCT_CLASSES.ICE,
				outbound: PRODUCT_CLASSES.ICE,
				inbound: PRODUCT_CLASSES.IC,
			},
		})
	})

	it('parses passenger information', function () {
		expect(p('S00900061-1-49')).to.deep.equal({ adults: 1, bahnCards: [{ count: 1, type: BAHNCARD_TYPES.BC25 }] })
		expect(p('S00900052-0-0' )).to.deep.equal({ adults: 2, bahnCards: [{ count: 0, type: BAHNCARD_TYPES.NONE }] })
		expect(p('S00900062-2-19')).to.deep.equal({ adults: 2, bahnCards: [{ count: 2, type: BAHNCARD_TYPES.BC50 }] })
		expect(p('S00900062-2-78')).to.deep.equal({ adults: 2, bahnCards: [{ count: 2, type: BAHNCARD_TYPES.BC50 }] })
		expect(p('S00900064-2-27')).to.deep.equal({ adults: 4, bahnCards: [{ count: 2, type: BAHNCARD_TYPES.BC25EN }] })
		expect(p('S00900061-1-39')).to.deep.equal({ adults: 1, bahnCards: [{ count: 1, type: BAHNCARD_TYPES.BC25E }] })
	})

	it('parses children count', function () {
		expect(p('S01200011')).to.deep.equal({ children: 1 });
		expect(p('S01200010')).to.deep.equal({ children: 0 });
		expect(p('S01200013')).to.deep.equal({ children: 3 });
	})

	it('parses fare class', function () {
		expect(p('S0140002S2')).to.deep.equal({ fareClass: '2' });
		expect(p('S0140002S1')).to.deep.equal({ fareClass: '1' });
	})

	it('parses outbound station information', function () {
		expect(p('S0150020Münster(Westf)+City')).to.deep.equal({ outbound: { from: 'Münster(Westf)+City' } });
		expect(p('S0160020Münster(Westf)+City')).to.deep.equal({ outbound: { to: 'Münster(Westf)+City' } });
		expect(p('S0150020Münster(Westf)+CityS0160011Berlin+City')).to.deep.equal({
			outbound: { from: 'Münster(Westf)+City', to: 'Berlin+City' },
		})
	})

	it('parses inbound station information', function () {
		expect(p('S0170020Münster(Westf)+City')).to.deep.equal({ inbound: { from: 'Münster(Westf)+City' } });
		expect(p('S0180020Münster(Westf)+City')).to.deep.equal({ inbound: { to: 'Münster(Westf)+City' } });
		expect(p('S0170020Münster(Westf)+CityS0180011Berlin+City')).to.deep.equal({
			inbound: { from: 'Münster(Westf)+City', to: 'Berlin+City' },
		})
	})

	it('parses VIA information', function () {
		const via = 'H: NV*HammWf 20:11 ICE645-ICE655 R: B-Hbf 20:36 IC2240';
		expect(p('S0210054'+via)).to.deep.equal({ via });
	})

	it('parses owner name', function () {
		expect(p('S0230016Musterfrau Maria')).to.deep.equal({ owner: {
			fullName: 'Musterfrau Maria' } });
		expect(p('S0230014Mustermann Max')).to.deep.equal({ owner: {
			fullName: 'Mustermann Max' } });
		expect(p('S0280013Anna#Beispiel')).to.deep.equal({ owner: {
			firstName: 'Anna', lastName: 'Beispiel' } });
		expect(p('S0230013Beispiel AnnaS0280013Anna#Beispiel')).to.deep.equal({ owner: {
			fullName: 'Beispiel Anna', firstName: 'Anna', lastName: 'Beispiel' } });
	})

	it('parses fare type', function () {
		expect(p('S02600013')).to.deep.equal({ fareType: FARE_TYPES.RAIL_AND_FLY });
		expect(p('S026000212')).to.deep.equal({ fareType: FARE_TYPES.FLEXIBLE });
		expect(p('S026000213')).to.deep.equal({ fareType: FARE_TYPES.SAVER });
	})

	it('parses the identification number', function () {
		expect(p('S0270004ABCD')).to.deep.equal({ identificationNumber: 'ABCD' });
	})

	it('parses validity information', function () {
		expect(p('S031001004.04.2015')).to.deep.equal({ valid: { from: new Date(2015, 3, 4) }});
		expect(p('S032001004.04.2015')).to.deep.equal({ valid: { until: new Date(2015, 3, 5) }});
		expect(p('S031001004.04.2015S032001004.04.2015')).to.deep.equal({
			valid: { from: new Date(2015, 3, 4), until: new Date(2015, 3, 5) }});
	})

	it('parses station IDs', function () {
		expect(p('S0350003foo')).to.deep.equal({ stationIds: { from: 'foo' } });
		expect(p('S0360003foo')).to.deep.equal({ stationIds: { to: 'foo' } });
		expect(p('S035000512345S0360003678')).to.deep.equal({ stationIds: { from: '12345', to: '678' } });
	})

	it('passes through unknown properties', function () {
		expect(p('S9990006foobar')).to.deep.equal({ S999: 'foobar' });
		expect(p('Sfoo0003fooSbar000242')).to.deep.equal({ Sfoo: 'foo', Sbar: '42' });
	})
})
