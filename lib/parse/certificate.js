'use strict';

const parseDate = require('./date');

module.exports = function parseCertificate(buffer) {
	const id = buffer.slice(0, 11).toString();
	const validFrom = parseDate(buffer.slice(22, 30).toString());
	const validUntil = parseDate(buffer.slice(30, 38).toString(), '2400');
	const serialNumber = buffer.slice(38).toString();
	return { id, validFrom, validUntil, serialNumber };
}
