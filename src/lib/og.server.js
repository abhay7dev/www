// Build-time cards rendered with satori: Open Graph images (1200×630) and default project
// thumbnails (1200×675). Always Mocha. satori reads WOFF2 directly.
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync } from 'node:fs';
import { flavors } from '#lib/theme/catppuccin.js';

const font = (name, file, weight) => ({
	name,
	data: readFileSync(`src/fonts/${file}`),
	weight,
	style: 'normal'
});
const fonts = [
	font('Fira Sans', 'FiraSans-Regular-latin.woff2', 400),
	font('Fira Sans', 'FiraSans-Regular-latin-ext.woff2', 400),
	font('Fira Code', 'FiraCode-Regular.woff2', 400),
	font('Fira Code', 'FiraCode-Bold.woff2', 700)
];

const { base, surface0, text, subtext0, lavender } = flavors.mocha;

const el = (type, style, children) => ({ type, props: { style, children } });

/**
 * Title in Fira Code Bold, optional description in Fira Sans, footer line in Fira Code with a
 * Lavender rule above it, matching the site's headings and labels.
 * @param {{ title: string, description?: string, footer: string, height?: number }} card
 */
export async function renderCard({ title, description, footer, height = 630 }) {
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
				background: base.hex,
				border: `1px solid ${surface0.hex}`,
				color: text.hex
			},
			[
				el('div', { display: 'flex', flexDirection: 'column', gap: 28 }, [
					el(
						'div',
						{
							fontFamily: 'Fira Code',
							fontSize: 64,
							fontWeight: 700,
							lineHeight: 1.15,
							letterSpacing: -1
						},
						title
					),
					...(description
						? [
								el(
									'div',
									{ fontFamily: 'Fira Sans', fontSize: 32, lineHeight: 1.4, color: subtext0.hex },
									description
								)
							]
						: [])
				]),
				el('div', { display: 'flex', flexDirection: 'column', gap: 20 }, [
					el('div', { width: 64, height: 4, background: lavender.hex }, ''),
					el('div', { fontFamily: 'Fira Code', fontSize: 28, color: subtext0.hex }, footer)
				])
			]
		),
		{ width: 1200, height, fonts }
	);
	return new Resvg(svg).render().asPng();
}
