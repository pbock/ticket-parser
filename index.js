'use strict';

const extract = require('./lib/extract');
const parsePayload = require('./lib/parse');

const parseBody = require('./lib/parse/body');
const PRODUCT_CLASSES = parseBody.PRODUCT_CLASSES;
const BAHNCARD_TYPES = parseBody.BAHNCARD_TYPES;
const FARE_TYPES = parseBody.FARE_TYPES;
const IDENTIFICATION_TYPES = require('./lib/parse/identification').IDENTIFICATION_TYPES;

const parse = function(aztecCodeContents) {
	return extract.extract(aztecCodeContents).then(parsePayload);
}

module.exports = {
	parse,

	PRODUCT_CLASSES,
	BAHNCARD_TYPES,
	FARE_TYPES,
	IDENTIFICATION_TYPES,
};
