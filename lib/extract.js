'use strict';

const zlib = require('zlib');
const ZLIB_HEADER = new Buffer([ 0x78, 0x9c ]);

function extract(data) {
	return new Promise((resolve, reject) => {
		const index = data.indexOf(ZLIB_HEADER);
		if (index === -1) return reject(new Error('No zlib payload found'));
		zlib.inflate(data.slice(index), (err, inflated) => {
			if (err) return reject(err);
			resolve(inflated);
		})
	})
}

module.exports = { extract }
