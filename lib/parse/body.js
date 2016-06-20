'use strict';

const parseDate = require('./date');
const parseCertificate = require('./certificate');

const REGIONAL = 'Regional';
const IC = 'IC/EC';
const ICE = 'ICE';
const productClassLookup = {
	'0': REGIONAL,
	'1': IC,
	'2': ICE,
	C: REGIONAL,
	B: IC,
	A: ICE,
}

const NONE = 'keine BahnCard';
const BC50 = 'BahnCard 50';
const BC25 = 'BahnCard 25';
const BC25EN = 'Einsteiger BahnCard 25 ohne Abo';
const BC25E = 'Einsteiger BahnCard 25';
const bahnCardTypeLookup = {
	0: NONE,
	19: BC50,
	78: BC50,
	49: BC25,
	27: BC25EN,
	39: BC25E,
}

const FARE_TYPES = {
	RAIL_AND_FLY: 'Rail&Fly',
	FLEXIBLE: 'Flexpreis',
	SAVER: 'Sparpreis',
}
const fareTypeLookup = {
	3: FARE_TYPES.RAIL_AND_FLY,
	12: FARE_TYPES.FLEXIBLE,
	13: FARE_TYPES.SAVER,
}

function parseSBlocks(buffer) {
	let cursor = 0;
	let data = {};
	while (cursor < buffer.length) {
		if (buffer[cursor] !== 0x53) break;
		const length = 8 + parseInt(buffer.slice(cursor + 4, cursor + 8), 10);
		const type = buffer.slice(cursor + 1, cursor + 4).toString();
		const body = buffer.slice(cursor + 8, cursor + length).toString();

		switch (type) {
			case '001': // Fare type
				data.fareName = body;
				break;
			case '002': // Product class for entire ticket (0, 1, 2)
				data.productClass = data.productClass || {};
				data.productClass.overall = productClassLookup[body];
				break;
			case '003': // Product class outbound (C, B, A)
				data.productClass = data.productClass || {};
				data.productClass.outbound = productClassLookup[body];
				break;
			case '004': // Product class outbound (C, B, A)
				data.productClass = data.productClass || {};
				data.productClass.inbound = productClassLookup[body];
				break;
			case '009': // Passengers
				data.adults = +body.split('-')[0];
				data.bahnCards = [{
					count: +body.split('-')[1],
					type: bahnCardTypeLookup[body.split('-')[2]],
				}];
				break;
			case '012': // Children
				data.children = parseInt(body, 10);
				break;
			case '014': // Fare class
				data.fareClass = body.substr(-1);
				break;
			case '015': // Outbound from station
				data.outbound = data.outbound || {};
				data.outbound.from = body;
				break;
			case '016': // Outbound to station
				data.outbound = data.outbound || {};
				data.outbound.to = body;
				break;
			case '017': // Inbound from station
				data.inbound = data.inbound || {};
				data.inbound.from = body;
				break;
			case '018': // Inbound to station
				data.inbound = data.inbound || {};
				data.inbound.to = body;
				break;
			case '021': // VIA
				data.via = body;
				break;
			case '023': // Full Name
				data.owner = data.owner || {};
				data.owner.fullName = body;
				break;
			case '026':
				data.fareType = fareTypeLookup[body];
				break;
			case '027':
				data.identificationNumber = body;
				break;
			case '028':
				data.owner = data.owner || {};
				data.owner.firstName = body.split('#')[0];
				data.owner.lastName = body.split('#')[1];
				break;
			case '031':
				data.valid = data.valid || {};
				data.valid.from = parseDate(body);
				break;
			case '032':
				data.valid = data.valid || {};
				data.valid.until = parseDate(body, '2400');
				break;
			case '035':
				data.stationIds = data.stationIds || {};
				data.stationIds.from = body;
				break;
			case '036':
				data.stationIds = data.stationIds || {};
				data.stationIds.to = body;
				break;
			default:
				data['S' + type] = body.toString();
				break;
		}

		cursor += length;
	}
	return data;
}

function parseSegments(segmentsFragment) {
	const length = parseInt(segmentsFragment.slice(8, 12), 10);
	const buffer = segmentsFragment.slice(0, length);

	const carrier = buffer.slice(0, 4).toString();
	const certificateCount = +buffer.slice(14, 15).toString();
	const certificates = [];
	const certificateLength = 46;
	for (let i = 0; i < certificateCount; i++) {
		const start = 15 + i * certificateLength;
		const end = start + certificateLength;
		const certificate = parseCertificate(buffer.slice(start, end));
		certificates.push(certificate);
	}

	let cursor = 15 + certificateCount * certificateLength;
	// const sBlockCount = parseInt(buffer.slice(cursor, cursor + 2).toString(), 10);
	cursor += 2;

	const data = parseSBlocks(buffer.slice(cursor))
	data.carrier = carrier;
	data.certificates = certificates;

	return { data, length };
}
parseSegments.parseSBlocks = parseSBlocks;
parseSegments.PRODUCT_CLASSES = { REGIONAL, IC, ICE };
parseSegments.BAHNCARD_TYPES = { NONE, BC25, BC50, BC25E, BC25EN };
parseSegments.FARE_TYPES = FARE_TYPES;
module.exports = parseSegments;
