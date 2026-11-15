const formatter = new Intl.DateTimeFormat('en-US', {
	year: 'numeric',
	month: 'short',
	day: 'numeric',
	timeZone: 'UTC'
});

/** Formats a `YYYY-MM-DD` calendar date without shifting it into the reader's time zone. */
export const formatDate = (date) => formatter.format(new Date(`${date}T00:00:00Z`));
