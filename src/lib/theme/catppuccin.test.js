import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { flavors } from './catppuccin.js';

const css = readFileSync(new URL('../../app.css', import.meta.url), 'utf8');

test('app.css --ctp-* variables match the palette module', () => {
	for (const name of Object.keys(flavors.latte)) {
		const [latte, mocha] = [flavors.latte[name].hex, flavors.mocha[name].hex];
		expect(css).toContain(`--ctp-${name}: light-dark(${latte}, ${mocha});`);
	}
	expect(css.match(/--ctp-[a-z0-9]+:/g)).toHaveLength(Object.keys(flavors.latte).length);
	expect(flavors.mocha.lavender.rgb).toEqual([180, 190, 254]);
});

// WCAG 2 relative luminance and contrast ratio.
const luminance = (rgb) => {
	const [r, g, b] = rgb.map((v) => {
		v /= 255;
		return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
	const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (hi + 0.05) / (lo + 0.05);
};
// color-mix(in srgb, a p%, b): interpolates the encoded channels.
const mix = (a, b, p) => a.map((v, i) => Math.round(v * p + b[i] * (1 - p)));

test.each([
	['latte', 'subtext1'],
	['mocha', 'subtext0']
])('role colors meet WCAG AA in %s', (flavor, muted) => {
	const c = Object.fromEntries(Object.entries(flavors[flavor]).map(([k, v]) => [k, v.rgb]));
	for (const bg of [c.base, c.mantle]) {
		expect(contrast(c.text, bg)).toBeGreaterThanOrEqual(4.5);
		expect(contrast(c[muted], bg)).toBeGreaterThanOrEqual(4.5); // --text-muted
	}
	expect(contrast(c.text, mix(c.lavender, c.base, 0.3))).toBeGreaterThanOrEqual(4.5); // selection
});
