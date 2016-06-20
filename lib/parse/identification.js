'use strict';

// We're using 'identification' and not 'id' throughout because 'id' is
// normally used for unique identifiers, e.g. a ticketId

const CREDIT_CARD = 'Credit Card';
const BAHNCARD = 'BahnCard';
const DEBIT_CARD = 'Debit Card';
const BONUSCARD_BUSINESS = 'BonusCard Business';
const NATIONAL_ID = 'National ID Card';
const PASSPORT = 'Passport';
const BAHNBONUS_CARD = 'bahn.bonus Card';

const typeLookup = {
	1: CREDIT_CARD,
	4: BAHNCARD,
	7: DEBIT_CARD,
	8: BONUSCARD_BUSINESS,
	9: NATIONAL_ID,
	10: PASSPORT,
	11: BAHNBONUS_CARD,
}
function parseIdentification(payloadFragment) {
	const length = parseInt(payloadFragment.slice(8, 12), 10);
	const buffer = payloadFragment.slice(0, length);

	const carrier = buffer.slice(0, 4).toString();
	const type = typeLookup[parseInt(buffer.slice(12, 14), 10)];
	const lastDigits = buffer.slice(14, 18).toString();

	const data = {
		carrier,
		type,
		lastDigits,
	}
	return { length, data };
}
parseIdentification.IDENTIFICATION_TYPES = {
	CREDIT_CARD, BAHNCARD, DEBIT_CARD, BONUSCARD_BUSINESS, NATIONAL_ID,
	PASSPORT, BAHNBONUS_CARD,
};
module.exports = parseIdentification;
