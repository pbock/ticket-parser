'use strict';

module.exports = function parseDate(date, time) {
	// Offset skips over '.' if there are any in the date string,
	// so 24122016 == 24.12.2016
	const offset = (date.length > 8) ? 1 : 0;
	const day = parseInt(date.substr(0, 2), 10);
	const month = parseInt(date.substr(2 + offset, 2), 10);
	const year = parseInt(date.substr(4 + 2 * offset, 4), 10);

	let hours = 0, minutes = 0;
	if (time) {
		hours = parseInt(time.substr(0, 2), 10);
		minutes = parseInt(time.substr(2, 2), 10);
	}

	return new Date(year, month - 1, day, hours, minutes);
}
