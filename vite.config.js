import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { enhancedImages } from '@sveltejs/enhanced-img';
import { mdsvexOptions } from './src/lib/markdown/options.js';
import { mdsvexFirst } from './src/lib/markdown/vite-plugin.js';

// CSP hashes for the inline scripts in app.html (Kit only hashes the scripts it generates).
const inlineScriptHashes = [
	...readFileSync('src/app.html', 'utf8').matchAll(/<script>([\s\S]*?)<\/script>/g)
].map(([, code]) => `sha256-${createHash('sha256').update(code).digest('base64')}`);

export default defineConfig({
	plugins: [
		// Order matters: mdsvex must compile .svx before enhanced-img's markup transform runs.
		mdsvexFirst(mdsvexOptions),
		enhancedImages(),
		sveltekit({
			adapter: adapter(),
			extensions: ['.svelte', '.svx'],
			paths: {
				origin: 'https://abhay7.dev',
				// 404.html is served at arbitrary depths, so asset URLs must be root-absolute.
				relative: false
			},
			csp: {
				mode: 'hash',
				directives: {
					'default-src': ['self'],
					// Only X's widgets.js (on posts with an embed) runs third-party code. giscus is a
					// bundled web component that only frames giscus.app (see frame-src).
					'script-src': ['self', ...inlineScriptHashes, 'https://platform.twitter.com'],
					// Shiki and Mermaid emit inline style attributes.
					'style-src': ['self', 'unsafe-inline'],
					'img-src': ['self', 'data:'],
					'font-src': ['self'],
					'connect-src': ['self'],
					'frame-src': [
						'https://giscus.app',
						'https://www.youtube-nocookie.com',
						'https://platform.twitter.com',
						'https://syndication.twitter.com'
					],
					'object-src': ['none'],
					'base-uri': ['self'],
					'form-action': ['self']
				}
			},
			prerender: {
				handleHttpError: 'fail',
				handleMissingId: 'fail',
				// Blog post routes and default project thumbnails are populated from content via entries();
				// they are legitimately empty when there is nothing to build. Any other unseen route is a bug.
				handleUnseenRoutes: ({ routes, message }) => {
					const allowed = new Set(['/blog/[slug]', '/blog/[group]/[slug]', '/projects/[slug].png']);
					if (routes.some((route) => !allowed.has(route))) throw new Error(message);
				}
			},
			// The default is Date.now(), which makes every build's HTML differ. Cloudflare Pages
			// provides the commit SHA during builds.
			version: { name: process.env.CF_PAGES_COMMIT_SHA ?? 'local' }
		})
	]
});
