import { index } from '#lib/blog/content.server.js';

export function load() {
	return { listing: index.listing };
}
