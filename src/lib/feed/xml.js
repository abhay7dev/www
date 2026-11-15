// RSS 2.0 and sitemap builders. Output is deterministic: no build timestamps.

export function escapeXml(text) {
	return String(text)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

const cdata = (text) => `<![CDATA[${text.replaceAll(']]>', ']]]]><![CDATA[>')}]]>`;
const rfc822 = (date) => new Date(`${date}T00:00:00Z`).toUTCString();

/**
 * @param {{ title: string, description: string, origin: string, feedPath: string }} channel
 * @param {{ title: string, url: string, date: string, description: string, html: string }[]} items newest first
 */
export function buildRss(channel, items) {
	const self = new URL(channel.feedPath, channel.origin).href;
	const entries = items.map((item) => {
		const link = new URL(item.url, channel.origin).href;
		return `\t\t<item>
\t\t\t<title>${escapeXml(item.title)}</title>
\t\t\t<link>${escapeXml(link)}</link>
\t\t\t<guid isPermaLink="true">${escapeXml(link)}</guid>
\t\t\t<pubDate>${rfc822(item.date)}</pubDate>
\t\t\t<description>${escapeXml(item.description)}</description>
\t\t\t<content:encoded>${cdata(item.html)}</content:encoded>
\t\t</item>\n`;
	});
	const lastBuild = items.length
		? `\t\t<lastBuildDate>${rfc822(items[0].date)}</lastBuildDate>\n`
		: '';
	return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
\t<channel>
\t\t<title>${escapeXml(channel.title)}</title>
\t\t<link>${escapeXml(channel.origin)}/</link>
\t\t<description>${escapeXml(channel.description)}</description>
\t\t<language>en</language>
\t\t<atom:link href="${escapeXml(self)}" rel="self" type="application/rss+xml"/>
${lastBuild}${entries.join('')}\t</channel>
</rss>
`;
}

/** @param {{ path: string, lastmod?: string | null }[]} entries */
export function buildSitemap(origin, entries) {
	const urls = entries.map(({ path, lastmod }) => {
		const loc = `<loc>${escapeXml(new URL(path, origin).href)}</loc>`;
		return `\t<url>${loc}${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>\n`;
	});
	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('')}</urlset>
`;
}
