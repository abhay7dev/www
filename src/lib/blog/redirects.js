// Builds Cloudflare Pages `_redirects` from site-level rules and per-post `redirect_from`.

const CODES = new Set(['301', '302', '303', '307', '308']);
const LIMITS = { static: 2000, dynamic: 100 };

const isDynamic = (from) => from.includes('*') || from.includes(':');
const withoutSlash = (path) => (path.length > 1 ? path.replace(/\/$/, '') : path);

/** Parses `from to [code]` lines; `#` starts a comment. */
export function parseRules(text, origin = 'site redirects') {
	const rules = [];
	text.split('\n').forEach((raw, i) => {
		const line = raw.replace(/#.*/, '').trim();
		if (!line) return;
		const [from, to, code = '301', ...rest] = line.split(/\s+/);
		const where = `${origin} line ${i + 1}`;
		if (rest.length || !to) throw new Error(`${where}: expected "from to [code]"`);
		if (!from.startsWith('/')) throw new Error(`${where}: source must start with /`);
		if (!/^(\/|https?:\/\/)/.test(to)) throw new Error(`${where}: invalid destination ${to}`);
		if (!CODES.has(code)) throw new Error(`${where}: unsupported status ${code}`);
		rules.push({ from, to, code, origin: where });
	});
	return rules;
}

/**
 * @param {{ siteRules: string, posts: { url: string, source: string, redirectFrom: string[] }[], livePaths: string[] }} input
 * @returns {string} file contents
 */
export function buildRedirects({ siteRules, posts, livePaths }) {
	const rules = parseRules(siteRules);
	for (const post of posts) {
		for (const from of post.redirectFrom) {
			rules.push({ from, to: post.url, code: '301', origin: post.source });
		}
	}

	const live = new Set(livePaths.map(withoutSlash));
	const seen = new Map();
	for (const rule of rules) {
		if (seen.has(rule.from)) {
			throw new Error(
				`${rule.origin}: ${rule.from} is already redirected by ${seen.get(rule.from)}`
			);
		}
		seen.set(rule.from, rule.origin);
		if (!isDynamic(rule.from) && live.has(withoutSlash(rule.from))) {
			throw new Error(`${rule.origin}: ${rule.from} is a live page and cannot be redirected`);
		}
	}

	// Cloudflare wants static rules before dynamic ones; first match wins.
	const staticRules = rules.filter((r) => !isDynamic(r.from));
	const dynamicRules = rules.filter((r) => isDynamic(r.from));
	if (staticRules.length > LIMITS.static || dynamicRules.length > LIMITS.dynamic) {
		throw new Error('too many redirects for Cloudflare Pages (2,000 static / 100 dynamic)');
	}
	return [...staticRules, ...dynamicRules].map((r) => `${r.from} ${r.to} ${r.code}\n`).join('');
}
