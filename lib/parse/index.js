'use strict';

const parseHeader = require('./header');
const parseIdentification = require('./identification');
const parseBody = require('./body');

function parse(payload) {
	// Parse ticket header
	let currentOffset = 0;
	const { data: header, length: headerLength } = parseHeader(payload);

	currentOffset += headerLength;

	// Parse identification block
	const { data: identification, length: identificationLength } =
		parseIdentification(payload.slice(currentOffset));

	currentOffset += identificationLength;

	// Parse segments
	const { data: body, length: bodyLength } =
		parseBody(payload.slice(currentOffset));

	return Object.assign(header, { identification }, body);
}

module.exports = parse;
