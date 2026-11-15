// Build-time Open Graph cards (1200×630 PNG). satori reads WOFF2 directly.
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync } from 'node:fs';

const font = (file) => readFileSync(`src/fonts/${file}`);
const fonts = [
	{ name: 'Fira Sans', data: font('FiraSans-Regular-latin.woff2'), weight: 400, style: 'normal' },
	{
		name: 'Fira Sans',
		data: font('FiraSans-Regular-latin-ext.woff2'),
		weight: 400,
		style: 'normal'
	},
	{ name: 'Fira Sans', data: font('FiraSans-Bold-latin.woff2'), weight: 700, style: 'normal' },
	{ name: 'Fira Sans', data: font('FiraSans-Bold-latin-ext.woff2'), weight: 700, style: 'normal' }
];

// Catppuccin Mocha base / text / subtext0.
const COLORS = { background: '#1e1e2e', text: '#cdd6f4', muted: '#a6adc8' };

const el = (type, style, children) => ({ type, props: { style, children } });

/** @param {{ title: string, description?: string, footer: string }} card */
export async function renderCard({ title, description, footer }) {
	const svg = await satori(
		el(
			'div',
			{
				width: '100%',
				height: '100%',
				boxSizing: 'border-box',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between',
				padding: 80,
				background: COLORS.background,
				color: COLORS.text,
				fontFamily: 'Fira Sans'
			},
			[
				el('div', { display: 'flex', flexDirection: 'column', gap: 24 }, [
					el('div', { fontSize: 64, fontWeight: 700, lineHeight: 1.15 }, title),
					...(description ? [el('div', { fontSize: 32, color: COLORS.muted }, description)] : [])
				]),
				el('div', { fontSize: 28, color: COLORS.muted }, footer)
			]
		),
		{ width: 1200, height: 630, fonts }
	);
	return new Resvg(svg).render().asPng();
}
