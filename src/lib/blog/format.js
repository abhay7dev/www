const formatter = new Intl.DateTimeFormat('en-US', {
	year: 'numeric',
	month: 'short',
	day: 'numeric',
	timeZone: 'UTC'
});

/** Formats a `YYYY-MM-DD` calendar date without shifting it into the reader's time zone. */
export const formatDate = (date) => formatter.format(new Date(`${date}T00:00:00Z`));

/**
 * Titles may use `inline code` (backticks) and nothing else. `titleParts` splits a title for
 * rendering; `plainTitle` drops the backticks where markup cannot go (<title>, RSS, OG).
 */
export const titleParts = (title) =>
	title.split('`').map((text, i) => ({ text, code: i % 2 === 1 }));
export const plainTitle = (title) => title.replaceAll('`', '');

const monthFormatter = new Intl.DateTimeFormat('en-US', {
	year: 'numeric',
	month: 'short',
	timeZone: 'UTC'
});

/** Formats a `YYYY-MM` month as `Jun 2025`; `null` reads as `Present`. */
export const formatMonth = (month) =>
	month ? monthFormatter.format(new Date(`${month}-01T00:00:00Z`)) : 'Present';
