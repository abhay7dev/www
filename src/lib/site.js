export const site = {
	origin: 'https://abhay7.dev',
	name: 'Abhay Bhat',
	// Placeholder until the user writes a real site description.
	description: 'Personal website and blog of Abhay Bhat.',
	repo: 'https://github.com/abhay7dev/www',
	// Placeholder until the user writes the homepage tagline.
	tagline: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod.'
};

/** Primary navigation, in display order. The site name in the header links home. */
export const nav = [
	{ href: '/about', label: 'About' },
	{ href: '/projects', label: 'Projects' },
	{ href: '/experience', label: 'Experience' },
	{ href: '/blog', label: 'Blog' },
	{ href: '/contact', label: 'Contact' }
];

/** Non-blog pages, for the sitemap. Blog URLs are added from content. */
export const pages = ['/', '/about', '/projects', '/experience', '/contact', '/licenses', '/blog'];

export const contact = {
	github: 'https://github.com/abhay7dev',
	linkedin: 'https://linkedin.com/in/abhaygbhat',
	x: 'https://x.com/abhaygb7',
	// Disabled until supplied: set to a mailto: URL / résumé path to show them.
	email: null,
	resume: null
};

// Giscus comments (GitHub Discussions on this repo, category "Blog Post"). The IDs come from
// https://giscus.app. giscus.json at the repo root limits which origins may embed them.
export const giscus = {
	repo: 'abhay7dev/www',
	repoId: 'R_kgDOVuu0_g',
	category: 'Blog Post',
	categoryId: 'DIC_kwDOVuu0_s4DLS81'
};
