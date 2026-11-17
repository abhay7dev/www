import { expect, test } from 'bun:test';
import { plainTitle, titleParts } from './format.js';

test('titles support inline code only', () => {
	expect(titleParts('My `neofetch` Output!')).toEqual([
		{ text: 'My ', code: false },
		{ text: 'neofetch', code: true },
		{ text: ' Output!', code: false }
	]);
	expect(titleParts('Plain')).toEqual([{ text: 'Plain', code: false }]);
	expect(plainTitle('My `neofetch` Output!')).toBe('My neofetch Output!');
});

test('months format for the experience timeline', async () => {
	const { formatMonth } = await import('./format.js');
	expect(formatMonth('2025-06')).toBe('Jun 2025');
	expect(formatMonth(null)).toBe('Present');
});
