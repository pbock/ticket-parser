'use strict';

const parseDate = require('./date');

module.exports = function parseHeader(payload) {
	const version = payload.slice(6, 8).toString();
	const length = parseInt(payload.slice(8, 12).toString(), 10);
	const buffer = payload.slice(0, length);

	const pnr = buffer.slice(16, 22).toString();
	const issueDate = buffer.slice(36, 44).toString();
	const issueTime = buffer.slice(44, 48).toString();
	const date = parseDate(issueDate, issueTime);
	const primaryLanguage = buffer.slice(49, 51).toString();
	const secondaryLanguage = buffer.slice(51, 53).toString();

	const data = {
		version,
		pnr,
		issueDate: date,
		primaryLanguage,
		secondaryLanguage,
	};
	return { length, data };
}
